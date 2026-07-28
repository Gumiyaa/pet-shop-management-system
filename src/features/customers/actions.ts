"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";
import { customerSchema } from "@/src/lib/validations";
import type { PaginationParams, PaginatedResult, CustomerInput } from "@/src/types";
import { revalidatePath } from "next/cache";

export async function getCustomers(params: PaginationParams): Promise<PaginatedResult<Record<string, unknown>>> {
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
    prisma.customer.findMany({ where, skip, take: pageSize, orderBy: { createdAt: "desc" } }),
    prisma.customer.count({ where }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getCustomer(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  return prisma.customer.findUnique({ where: { id } });
}

export async function createCustomer(data: CustomerInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = customerSchema.parse(data);
  const customer = await prisma.customer.create({
    data: {
      ...validated,
      email: validated.email || null,
    },
  });

  revalidatePath("/customers");
  return customer;
}

export async function updateCustomer(id: string, data: CustomerInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const validated = customerSchema.parse(data);
  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...validated,
      email: validated.email || null,
    },
  });

  revalidatePath("/customers");
  return customer;
}

export async function deleteCustomer(id: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
}

export async function getCustomerSales(customerId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const sales = await prisma.sale.findMany({
    where: { customerId },
    include: { items: { include: { product: { select: { name: true } } } }, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return sales.map((s): Record<string, unknown> => ({
    ...s,
    grandTotal: Number(s.grandTotal),
    subtotal: Number(s.subtotal),
    discount: Number(s.discount),
    tax: Number(s.tax),
    amountPaid: Number(s.amountPaid),
    change: Number(s.change),
    items: s.items.map((i): Record<string, unknown> => ({
      ...i,
      price: Number(i.price),
      subtotal: Number(i.subtotal),
    })),
  }));
}