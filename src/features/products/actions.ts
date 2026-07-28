"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { productSchema, categorySchema } from "@/src/lib/validations";
import type { PaginationParams, PaginatedResult, ProductInput, CategoryInput } from "@/src/types";
import { revalidatePath } from "next/cache";

export async function getProducts(
  params: PaginationParams & { categoryId?: string; minStock?: boolean }
): Promise<PaginatedResult<Record<string, unknown>>> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const { page, pageSize, search, categoryId, minStock } = params;

  const where = {
    active: true,
    ...(search && {
      OR: [
        { name: { contains: search } },
        { barcode: { contains: search } },
      ],
    }),
    ...(categoryId && { categoryId }),
  };

  const all = await prisma.product.findMany({
    where,
    include: { category: { select: { id: true, name: true } }, supplier: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Prisma can't do stock <= minStock field comparison; filter in JS
  const filtered = minStock ? all.filter((p) => p.stock <= p.minStock) : all;
  const total = filtered.length;
  const data = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    data: data.map((p) => ({
      ...p,
      price: Number(p.price),
      cost: Number(p.cost),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProduct(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, supplier: true },
  });

  if (!product) throw new Error("Product not found");

  return {
    ...product,
    price: Number(product.price),
    cost: Number(product.cost),
  };
}

export async function createProduct(data: ProductInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = productSchema.parse(data);

  const product = await prisma.product.create({
    data: {
      ...validated,
      price: validated.price,
      cost: validated.cost,
      categoryId: validated.categoryId || null,
      supplierId: validated.supplierId || null,
    },
  });

  revalidatePath("/products");
  return product;
}

export async function updateProduct(id: string, data: ProductInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = productSchema.parse(data);

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...validated,
      categoryId: validated.categoryId || null,
      supplierId: validated.supplierId || null,
    },
  });

  revalidatePath("/products");
  return product;
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "ADMIN") throw new Error("Admin only");

  await prisma.product.update({ where: { id }, data: { active: false } });
  revalidatePath("/products");
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(data: CategoryInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = categorySchema.parse(data);
  const category = await prisma.category.create({ data: validated });
  revalidatePath("/products");
  return category;
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.category.delete({ where: { id } });
  revalidatePath("/products");
}