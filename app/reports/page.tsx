"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { getSalesReport } from "@/src/features/reports/actions";
import { Download, BarChart3, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

interface ReportItem {
  invoiceNumber: string;
  customer: { name: string } | null;
  grandTotal: number;
  paymentMethod: string;
  createdAt: Date | string;
  subtotal: number;
  discount: number;
  tax: number;
  amountPaid: number;
  change: number;
}

interface ProductSale {
  productId: string;
  name: string;
  quantity: number;
  total: number;
}

interface SalesReport {
  totalRevenue: number;
  totalTransactions: number;
  totalItems: number;
  grouped: Record<string, { revenue: number; count: number }>;
  productSales: ProductSale[];
  sales: ReportItem[];
}

type GroupBy = "day" | "week" | "month";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [groupBy, setGroupBy] = useState<GroupBy>("day");

  const generateReport = async () => {
    if (!startDate || !endDate) { toast.error("Select date range"); return; }
    setLoading(true);
    try {
      const r = await getSalesReport({ startDate, endDate, groupBy });
      setReport(r as unknown as SalesReport);
    } catch { toast.error("Failed to generate report"); }
    finally { setLoading(false); }
  };

  const chartData = report ? Object.entries(report.grouped).map(([period, data]) => ({
    period,
    revenue: data.revenue,
    count: data.count,
  })) : [];

  const exportPDF = async () => {
    if (!report) return;
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Sales Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`${startDate} to ${endDate}`, 14, 28);
    doc.text(`Total Revenue: ${formatCurrency(report.totalRevenue)}`, 14, 35);
    doc.text(`Transactions: ${report.totalTransactions}`, 14, 42);

    autoTable(doc, {
      startY: 50,
      head: [["Invoice", "Customer", "Total", "Method", "Date"]],
      body: report.sales.map((s) => [
        s.invoiceNumber,
        s.customer?.name ?? "Walk-in",
        formatCurrency(s.grandTotal),
        s.paymentMethod,
        formatDate(s.createdAt, "short"),
      ]),
    });
    doc.save(`sales-report-${startDate}.pdf`);
    toast.success("PDF exported");
  };

  const exportExcel = async () => {
    if (!report) return;
    const XLSX = await import("xlsx");
    const data = report.sales.map((s) => ({
      Invoice: s.invoiceNumber,
      Customer: s.customer?.name ?? "Walk-in",
      Total: s.grandTotal,
      Payment: s.paymentMethod,
      Date: formatDate(s.createdAt, "short"),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
    XLSX.writeFile(wb, `sales-report-${startDate}.xlsx`);
    toast.success("Excel exported");
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Reports</h1><p className="text-muted-foreground">Generate sales reports and analytics</p></div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Report Parameters</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div><label className="text-sm font-medium block mb-1">Start Date</label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div><label className="text-sm font-medium block mb-1">End Date</label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
            <div><label className="text-sm font-medium block mb-1">Group By</label>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} className="flex h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option>
              </select>
            </div>
            <Button onClick={generateReport} disabled={loading}><BarChart3 className="mr-2 h-4 w-4" /> Generate</Button>
          </div>
        </CardContent>
      </Card>

      {loading && <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-80" /></div>}

      {report && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(report.totalRevenue)}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Transactions</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{report.totalTransactions}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Items Sold</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{report.totalItems}</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg. Per Transaction</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(report.totalRevenue / (report.totalTransactions || 1))}</p></CardContent></Card>
          </div>

          <Card><CardHeader><CardTitle>Revenue Chart</CardTitle></CardHeader>
            <CardContent><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="period" className="text-xs" /><YAxis className="text-xs" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} /><Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    formatter={(value: any) => [formatCurrency(Number(value)), "Revenue"]} /><Bar dataKey="revenue" fill="hsl(142.1, 76.2%, 36.3%)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={exportPDF} variant="outline"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
            <Button onClick={exportExcel} variant="outline"><Download className="mr-2 h-4 w-4" /> Export Excel</Button>
          </div>

          {report.productSales.length > 0 && (
            <Card><CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
              <CardContent><div className="space-y-2">
                {report.productSales.map((p: ProductSale, i: number) => (
                  <div key={p.productId} className="flex items-center justify-between"><span className="text-sm"><span className="font-mono text-muted-foreground mr-2">#{i + 1}</span>{p.name}</span><span className="text-sm font-medium">{p.quantity} sold - {formatCurrency(p.total)}</span></div>
                ))}
              </div></CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}