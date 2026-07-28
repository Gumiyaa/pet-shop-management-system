"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { DataTable } from "@/src/components/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { formatDate } from "@/src/lib/utils";
import { getStockMovements, createStockMovement, getStockSummary } from "@/src/features/stock/actions";
import { getProducts } from "@/src/features/products/actions";
import { Plus, PackageSearch, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";

export default function StockPage() {
  const [movements, setMovements] = useState<Record<string, unknown>[]>([]);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getStockSummary>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const load = useCallback(async () => {
    try {
      const [m, s] = await Promise.all([
        getStockMovements({ page, pageSize: 15, type: typeFilter || undefined }),
        getStockSummary(),
      ]);
      setMovements(m.data);
      setTotalPages(m.totalPages);
      setSummary(s);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, [page, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const openAdd = async () => {
    try {
      const r = await getProducts({ page: 1, pageSize: 500 });
      setProducts(r.data as { id: string; name: string }[]);
      setDialogOpen(true);
    } catch { toast.error("Failed to load products"); }
  };

  const handleSubmit = async () => {
    if (!selectedProduct || quantity < 1) { toast.error("Select product and quantity"); return; }
    try {
      await createStockMovement({ productId: selectedProduct, type, quantity, note });
      toast.success("Stock movement recorded");
      setDialogOpen(false); setQuantity(0); setSelectedProduct(""); setNote(""); load();
    } catch (err) { toast.error((err as Error).message); }
  };

  const columns: ColumnDef<Record<string, unknown>>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const t = row.getValue("type") as string;
        return <Badge variant={t === "IN" ? "success" : "destructive"}>{t === "IN" ? <TrendingUp className="h-3 w-3 inline mr-1" /> : <TrendingDown className="h-3 w-3 inline mr-1" />}{t}</Badge>;
      },
    },
    {
      accessorKey: "product.name",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original.product as { name?: string } | undefined;
        return product?.name ?? "Unknown";
      },
    },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "note", header: "Note", cell: ({ row }) => (row.getValue("note") as string) ?? "-" },
    { accessorKey: "user.name", header: "By", cell: ({ row }) => {
      const user = row.original.user as { name?: string } | undefined;
      return user?.name ?? "-";
    }},
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDate(row.getValue("createdAt") as string, "datetime") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Stock Management</h1><p className="text-muted-foreground">Track inventory movements</p></div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Record Movement</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><PackageSearch className="h-4 w-4" /> Total Stock In</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-emerald-600">{summary?.totalStockIn ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><PackageSearch className="h-4 w-4" /> Total Stock Out</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-red-600">{summary?.totalStockOut ?? 0}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Low Stock Items</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-amber-600">{summary?.lowStock.length ?? 0}</p></CardContent></Card>
      </div>

      {summary && summary.lowStock.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader><CardTitle className="text-sm text-amber-600">Low Stock Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {summary.lowStock.map((p) => (
              <div key={p.id} className="flex justify-between text-sm"><span>{p.name}</span><span className="font-medium text-destructive">{p.stock} / {p.minStock}</span></div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Button variant={typeFilter === "" ? "default" : "outline"} size="sm" onClick={() => { setTypeFilter(""); setPage(1); setLoading(true); }}>All</Button>
        <Button variant={typeFilter === "IN" ? "default" : "outline"} size="sm" onClick={() => { setTypeFilter("IN"); setPage(1); setLoading(true); }}>Stock In</Button>
        <Button variant={typeFilter === "OUT" ? "default" : "outline"} size="sm" onClick={() => { setTypeFilter("OUT"); setPage(1); setLoading(true); }}>Stock Out</Button>
      </div>

      {loading ? <div className="space-y-4"><Skeleton className="h-10" /><Skeleton className="h-96" /></div> :
        <DataTable columns={columns} data={movements} page={page} totalPages={totalPages} onPageChange={setPage} />
      }

      {dialogOpen && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Stock Movement</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Product</label>
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="">Select product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <div className="flex gap-2 mt-1">
                  <Button variant={type === "IN" ? "default" : "outline"} size="sm" onClick={() => setType("IN")}>Stock In</Button>
                  <Button variant={type === "OUT" ? "default" : "outline"} size="sm" onClick={() => setType("OUT")}>Stock Out</Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-sm font-medium">Note (optional)</label>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for movement" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Record</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}