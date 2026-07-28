"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";

export async function getSalesReport(params: {
  startDate: string;
  endDate: string;
  groupBy: "day" | "week" | "month";
}) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const { startDate, endDate, groupBy } = params;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const sales = await prisma.sale.findMany({
    where: {
      createdAt: { gte: start, lte: end },
    },
    include: {
      items: { include: { product: { select: { name: true } } } },
      user: { select: { name: true } },
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.grandTotal), 0);
  const totalTransactions = sales.length;
  const totalItems = sales.reduce((sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);

  const grouped: Record<string, { revenue: number; count: number }> = {};

  sales.forEach((s) => {
    let key: string;
    const d = new Date(s.createdAt);

    if (groupBy === "day") {
      key = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } else if (groupBy === "week") {
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      key = `Week of ${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    } else {
      key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }

    if (!grouped[key]) grouped[key] = { revenue: 0, count: 0 };
    grouped[key].revenue += Number(s.grandTotal);
    grouped[key].count++;
  });

  const topProducts = await prisma.saleItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10,
    where: {
      sale: { createdAt: { gte: start, lte: end } },
    },
  });

  const productDetails = await prisma.product.findMany({
    where: { id: { in: topProducts.map((p) => p.productId) } },
    select: { id: true, name: true },
  });

  const productMap = new Map(productDetails.map((p) => [p.id, p.name]));

  const productSales = topProducts.map((p) => ({
    productId: p.productId,
    name: productMap.get(p.productId) ?? "Unknown",
    quantity: Number(p._sum.quantity),
    total: Number(p._sum.subtotal),
  }));

  return {
    totalRevenue,
    totalTransactions,
    totalItems,
    grouped,
    productSales,
    sales: sales.map((s) => ({
      ...s,
      grandTotal: Number(s.grandTotal),
      subtotal: Number(s.subtotal),
      discount: Number(s.discount),
      tax: Number(s.tax),
      amountPaid: Number(s.amountPaid),
      change: Number(s.change),
    })),
  };
}