"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { getDashboardStats, getMonthlyRevenue } from "@/src/features/dashboard/actions";
import { Package, Users, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalUsers: number;
  lowStockProducts: Array<{ id: string; name: string; stock: number; minStock: number }>;
  totalRevenue: number;
  totalSalesCount: number;
  recentTransactions: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    cashierName: string;
    grandTotal: number;
    paymentMethod: string;
    amountPaid: number;
    change: number;
    subtotal: number;
    discount: number;
    tax: number;
    createdAt: string | Date;
  }>;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getMonthlyRevenue()]).then(([s, r]) => {
      setStats(s as DashboardStats);
      setRevenue(r as MonthlyRevenue[]);
      setLoading(false);
    });
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your pet store at a glance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} label="Total Products" value={stats?.totalProducts ?? 0} />
        <StatCard icon={Users} label="Total Customers" value={stats?.totalCustomers ?? 0} />
        <StatCard icon={DollarSign} label="Monthly Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={stats?.lowStockProducts.length ?? 0} variant="warning" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    formatter={((value: any) => [formatCurrency(Number(value)), "Revenue"]) as any}
                  />
                  <Bar dataKey="revenue" fill="hsl(142.1, 76.2%, 36.3%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{t.invoiceNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.customerName} &middot; {formatDate(t.createdAt, "datetime")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(t.grandTotal)}</p>
                    <Badge variant={t.paymentMethod === "CASH" ? "success" : "secondary"}>
                      {t.paymentMethod}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {stats && stats.lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <span className="text-sm">{p.name}</span>
                  <Badge variant="destructive">
                    {p.stock} / {p.minStock}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  variant?: "default" | "warning";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`h-5 w-5 ${variant === "warning" ? "text-amber-500" : "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${variant === "warning" ? "text-amber-600" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64 mt-1" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}