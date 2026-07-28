"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { stockMovementSchema } from "@/src/lib/validations";
import type { StockMovementInput } from "@/src/types";
import { revalidatePath } from "next/cache";

export async function getStockMovements(params: { page: number; pageSize: number; productId?: string; type?: string }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const { page, pageSize, productId, type } = params;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(productId && { productId }),
    ...(type && { type: type as "IN" | "OUT" }),
  };

  const [data, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, barcode: true } },
        user: { select: { id: true, name: true } },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createStockMovement(data: StockMovementInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = stockMovementSchema.parse(data);

  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: validated.productId } });
    if (!product) throw new Error("Product not found");

    if (validated.type === "OUT" && product.stock < validated.quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }

    const movement = await tx.stockMovement.create({
      data: {
        productId: validated.productId,
        userId: session.user.id,
        type: validated.type,
        quantity: validated.quantity,
        note: validated.note,
      },
    });

    await tx.product.update({
      where: { id: validated.productId },
      data: {
        stock: validated.type === "IN" ? { increment: validated.quantity } : { decrement: validated.quantity },
      },
    });

    revalidatePath("/stock");
    revalidatePath("/products");
    return movement;
  });
}

export async function getStockSummary() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const [totalStockIn, totalStockOut, allProducts] = await Promise.all([
    prisma.stockMovement.aggregate({ where: { type: "IN" }, _sum: { quantity: true } }),
    prisma.stockMovement.aggregate({ where: { type: "OUT" }, _sum: { quantity: true } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { stock: "asc" },
      select: { id: true, name: true, stock: true, minStock: true },
    }),
  ]);

  const lowStock = allProducts.filter((p) => p.stock <= p.minStock);

  return {
    totalStockIn: Number(totalStockIn._sum.quantity ?? 0),
    totalStockOut: Number(totalStockOut._sum.quantity ?? 0),
    lowStock,
  };
}