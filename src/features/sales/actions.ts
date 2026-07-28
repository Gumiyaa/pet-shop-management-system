"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { saleSchema } from "@/src/lib/validations";
import { generateInvoiceNumber } from "@/src/lib/utils";
import type { SaleInput } from "@/src/types";
import { revalidatePath } from "next/cache";

export async function getSales(params: { page: number; pageSize: number; search?: string; startDate?: string; endDate?: string }) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const { page, pageSize, search, startDate, endDate } = params;
  const skip = (page - 1) * pageSize;

  const where = {
    ...(search && {
      OR: [
        { invoiceNumber: { contains: search} },
        { customer: { name: { contains: search} } },
      ],
    }),
    ...(startDate && { createdAt: { gte: new Date(startDate) } }),
    ...(endDate && { createdAt: { lte: new Date(endDate) } }),
  };

  const [data, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    data: data.map((s) => ({
      ...s,
      grandTotal: Number(s.grandTotal),
      subtotal: Number(s.subtotal),
      discount: Number(s.discount),
      tax: Number(s.tax),
      amountPaid: Number(s.amountPaid),
      change: Number(s.change),
      items: s.items.map((i) => ({ ...i, price: Number(i.price), subtotal: Number(i.subtotal) })),
      customerName: s.customer?.name ?? "Walk-in",
      cashierName: s.user.name,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getSale(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      user: { select: { id: true, name: true } },
      items: { include: { product: { select: { name: true, barcode: true } } } },
    },
  });

  if (!sale) throw new Error("Sale not found");

  return {
    ...sale,
    grandTotal: Number(sale.grandTotal),
    subtotal: Number(sale.subtotal),
    discount: Number(sale.discount),
    tax: Number(sale.tax),
    amountPaid: Number(sale.amountPaid),
    change: Number(sale.change),
    items: sale.items.map((i) => ({ ...i, price: Number(i.price), subtotal: Number(i.subtotal) })),
  };
}

export async function createSale(data: SaleInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = saleSchema.parse(data);

  return await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const itemsData = [];
    const invoiceNumber = generateInvoiceNumber();

    for (const item of validated.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      const price = Number(product.price);
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      itemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
        subtotal: itemSubtotal,
      });

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          userId: session.user.id,
          type: "OUT",
          quantity: item.quantity,
          note: `Sale ${invoiceNumber}`,
        },
      });
    }

    const discount = Number(validated.discount) || 0;
    const tax = Number(validated.tax) || 0;
    const grandTotal = subtotal - discount + tax;

    const sale = await tx.sale.create({
      data: {
        invoiceNumber,
        customerId: validated.customerId || null,
        userId: session.user.id,
        subtotal,
        discount,
        tax,
        grandTotal,
        paymentMethod: validated.paymentMethod,
        amountPaid: validated.amountPaid,
        change: validated.amountPaid - grandTotal,
        notes: validated.notes,
        items: { create: itemsData },
      },
      include: {
        customer: true,
        user: { select: { name: true } },
        items: { include: { product: { select: { name: true, barcode: true } } } },
      },
    });

    revalidatePath("/sales");
    revalidatePath("/dashboard");
    revalidatePath("/products");

    return {
      ...sale,
      grandTotal: Number(sale.grandTotal),
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount),
      tax: Number(sale.tax),
      amountPaid: Number(sale.amountPaid),
      change: Number(sale.change),
      items: sale.items.map((i) => ({ ...i, price: Number(i.price), subtotal: Number(i.subtotal) })),
    };
  });
}

export async function getProductsForSale(search?: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const products = await prisma.product.findMany({
    where: {
      active: true,
      stock: { gt: 0 },
      ...(search && {
        OR: [
          { name: { contains: search} },
          { barcode: { contains: search} },
        ],
      }),
    },
    include: { category: { select: { name: true } } },
    orderBy: { name: "asc" },
    take: 50,
  });

  return products.map((p) => ({ ...p, price: Number(p.price), cost: Number(p.cost) }));
}