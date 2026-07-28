"use server";

import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/lib/auth";

export async function getDashboardStats() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const [
    totalProducts,
    totalCustomers,
    totalUsers,
    lowStockProducts,
    monthlySales,
    recentTransactions,
  ] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.customer.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { stock: "asc" },
      select: { id: true, name: true, stock: true, minStock: true },
    }).then((products) => products.filter((p) => p.stock <= p.minStock).slice(0, 5)),
    prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { grandTotal: true },
      _count: true,
    }),
    prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  return {
    totalProducts,
    totalCustomers,
    totalUsers,
    lowStockProducts,
    totalRevenue: Number(monthlySales._sum.grandTotal ?? 0),
    totalSalesCount: monthlySales._count,
    recentTransactions: recentTransactions.map((t) => ({
      ...t,
      grandTotal: Number(t.grandTotal),
      amountPaid: Number(t.amountPaid),
      change: Number(t.change),
      subtotal: Number(t.subtotal),
      discount: Number(t.discount),
      tax: Number(t.tax),
      customerName: t.customer?.name ?? "Walk-in",
      cashierName: t.user.name,
    })),
  };
}

export async function getMonthlyRevenue() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const sales = await prisma.sale.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: sixMonthsAgo } },
    _sum: { grandTotal: true },
    _count: true,
  });

  const monthly: Record<string, number> = {};
  sales.forEach((s) => {
    const month = s.createdAt.toLocaleString("en-US", { month: "short", year: "numeric" });
    monthly[month] = (monthly[month] ?? 0) + Number(s._sum.grandTotal);
  });

  return Object.entries(monthly).map(([month, revenue]) => ({ month, revenue }));
}