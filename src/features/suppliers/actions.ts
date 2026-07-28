"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { supplierSchema } from "@/src/lib/validations";
import type { PaginationParams, PaginatedResult, SupplierInput } from "@/src/types";
import { revalidatePath } from "next/cache";

export async function getSuppliers(params: PaginationParams): Promise<PaginatedResult<Record<string, unknown>>> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const { page, pageSize, search } = params;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search} },
        { email: { contains: search} },
        { phone: { contains: search } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.supplier.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
    prisma.supplier.count({ where }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createSupplier(data: SupplierInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = supplierSchema.parse(data);
  const supplier = await prisma.supplier.create({
    data: { ...validated, email: validated.email || null },
  });

  revalidatePath("/suppliers");
  return supplier;
}

export async function updateSupplier(id: string, data: SupplierInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = supplierSchema.parse(data);
  const supplier = await prisma.supplier.update({
    where: { id },
    data: { ...validated, email: validated.email || null },
  });

  revalidatePath("/suppliers");
  return supplier;
}

export async function deleteSupplier(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.supplier.delete({ where: { id } });
  revalidatePath("/suppliers");
}