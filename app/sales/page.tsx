"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { DataTable } from "@/src/components/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { getSales, createSale, getProductsForSale } from "@/src/features/sales/actions";
import { getCustomers } from "@/src/features/customers/actions";
import { Plus, ShoppingCart, Trash2, Printer, Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Record<string, unknown> | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<{ id: string; name: string; price: number; stock: number }[]>([]);
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "TRANSFER">("CASH");

  const loadSales = useCallback(async () => {
    try { const r = await getSales({ page, pageSize: 10, search }); setSales(r.data); setTotalPages(r.totalPages); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { loadSales(); }, [loadSales]);

  const searchProducts = async (q: string) => {
    setProductSearch(q);
    if (q.length < 1) { setProducts([]); return; }
    try { setProducts(await getProductsForSale(q)); } catch {}
  };

  const searchCustomers = async (q: string) => {
    setCustomerSearch(q);
    if (q.length < 1) { setCustomers([]); return; }
    try { const r = await getCustomers({ page: 1, pageSize: 10, search: q }); setCustomers(r.data as { id: string; name: string }[]); } catch {}
  };

  const addToCart = (product: { id: string; name: string; price: number; stock: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) { toast.error("Out of stock"); return prev; }
        return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((i) => i.productId !== productId));

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const grandTotal = subtotal - discount;

  const handleCheckout = async () => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    if (amountPaid < grandTotal) { toast.error("Insufficient payment"); return; }
    try {
      await createSale({
        customerId: selectedCustomer || undefined,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        discount,
        tax: 0,
        paymentMethod,
        amountPaid,
        notes: "",
      });
      toast.success("Sale completed!");
      setCart([]); setCartOpen(false); setDiscount(0); setAmountPaid(0); setSelectedCustomer(""); loadSales();
    } catch (err) { toast.error("Sale failed"); }
  };

  const columns: ColumnDef<Record<string, unknown>>[] = [
    { accessorKey: "invoiceNumber", header: "Invoice", cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("invoiceNumber") as string}</span> },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "grandTotal", header: "Total", cell: ({ row }) => formatCurrency(row.getValue("grandTotal") as number) },
    { accessorKey: "paymentMethod", header: "Payment", cell: ({ row }) => <Badge variant="secondary">{row.getValue("paymentMethod") as string}</Badge> },
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDate(row.getValue("createdAt") as string, "datetime") },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => { setSelectedSale(row.original); setViewOpen(true); }}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Sales</h1><p className="text-muted-foreground">Point of sale & transaction history</p></div>
        <Button onClick={() => setCartOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Sale</Button>
      </div>

      {loading ? <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div> :
        <DataTable columns={columns} data={sales} searchPlaceholder="Search by invoice or customer..." page={page} totalPages={totalPages} onPageChange={setPage} onSearch={(v) => { setSearch(v); setPage(1); setLoading(true); }} />
      }

      {/* Cart Dialog */}
      {cartOpen && (
        <Dialog open={cartOpen} onOpenChange={setCartOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> New Sale</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {/* Product search */}
              <div>
                <label className="text-sm font-medium">Search Product</label>
                <Input value={productSearch} onChange={(e) => searchProducts(e.target.value)} placeholder="Type to search..." />
                {products.length > 0 && (
                  <div className="border rounded-md mt-1 max-h-40 overflow-y-auto">
                    {products.map((p) => (
                      <button key={p.id} className="w-full text-left px-3 py-2 hover:bg-accent text-sm" onClick={() => { addToCart(p); setProductSearch(""); setProducts([]); }}>
                        {p.name} - {formatCurrency(p.price)} (Stock: {p.stock})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer search */}
              <div>
                <label className="text-sm font-medium">Customer (optional)</label>
                <Input value={customerSearch} onChange={(e) => { searchCustomers(e.target.value); setSelectedCustomer(""); }} placeholder="Walk-in customer..." />
                {customers.length > 0 && (
                  <div className="border rounded-md mt-1 max-h-32 overflow-y-auto">
                    {customers.map((c) => (
                      <button key={c.id} className="w-full text-left px-3 py-2 hover:bg-accent text-sm" onClick={() => { setSelectedCustomer(c.id); setCustomerSearch(c.name); setCustomers([]); }}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart items */}
              <div className="border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted"><tr><th className="p-2 text-left">Item</th><th className="p-2 text-right">Price</th><th className="p-2 text-center">Qty</th><th className="p-2 text-right">Subtotal</th><th className="p-2" /></tr></thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.productId} className="border-t">
                        <td className="p-2 font-medium">{item.name}</td>
                        <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="p-2 text-center">
                          <input type="number" min={1} value={item.quantity} onChange={(e) => setCart((prev) => prev.map((i) => i.productId === item.productId ? { ...i, quantity: Math.max(1, Number(e.target.value)) } : i))} className="w-14 h-8 text-center border rounded" />
                        </td>
                        <td className="p-2 text-right">{formatCurrency(item.price * item.quantity)}</td>
                        <td className="p-2"><Button variant="ghost" size="sm" onClick={() => removeFromCart(item.productId)}><Trash2 className="h-4 w-4 text-destructive" /></Button></td>
                      </tr>
                    ))}
                    {cart.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No items in cart</td></tr>}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between text-sm items-center">
                  <span>Discount</span>
                  <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-28 h-8 text-right" />
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Grand Total</span><span>{formatCurrency(grandTotal)}</span></div>
                <div className="flex justify-between text-sm items-center">
                  <span>Payment Method</span>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as "CASH" | "CARD" | "TRANSFER")} className="h-8 rounded border bg-transparent px-2 text-sm">
                    <option value="CASH">Cash</option><option value="CARD">Card</option><option value="TRANSFER">Transfer</option>
                  </select>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span>Amount Paid</span>
                  <Input type="number" min={0} value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} className="w-36 h-8 text-right" />
                </div>
                {amountPaid >= grandTotal && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium"><span>Change</span><span>{formatCurrency(amountPaid - grandTotal)}</span></div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setCartOpen(false)}>Cancel</Button>
                <Button onClick={handleCheckout} disabled={cart.length === 0 || amountPaid < grandTotal}>Complete Sale</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View Invoice */}
      {viewOpen && selectedSale && (
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Invoice {selectedSale.invoiceNumber as string}</DialogTitle></DialogHeader>
            <div className="space-y-2 text-sm">
              <p>Customer: {selectedSale.customerName as string}</p>
              <p>Cashier: {selectedSale.cashierName as string}</p>
              <p>Date: {formatDate(selectedSale.createdAt as string, "datetime")}</p>
              <p>Payment: <Badge variant="secondary">{selectedSale.paymentMethod as string}</Badge></p>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(selectedSale.subtotal as number)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(selectedSale.discount as number)}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>{formatCurrency(selectedSale.grandTotal as number)}</span></div>
                <div className="flex justify-between"><span>Paid</span><span>{formatCurrency(selectedSale.amountPaid as number)}</span></div>
                <div className="flex justify-between text-emerald-600"><span>Change</span><span>{formatCurrency(selectedSale.change as number)}</span></div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}