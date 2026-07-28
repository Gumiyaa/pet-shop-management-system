"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { DataTable } from "@/src/components/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { formatDate, formatCurrency } from "@/src/lib/utils";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerSales } from "@/src/features/customers/actions";
import { Plus, Edit2, Trash2, Users, Eye } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";

const customerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type CustomerForm = z.infer<typeof customerFormSchema>;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<Record<string, unknown>[]>([]);

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { name: "", email: "", phone: "", address: "" },
  });

  const loadCustomers = useCallback(async () => {
    try {
      const result = await getCustomers({ page, pageSize: 10, search });
      setCustomers(result.data);
      setTotalPages(result.totalPages);
    } catch { toast.error("Failed to load customers"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const handleSearch = (value: string) => { setSearch(value); setPage(1); setLoading(true); };

  const openCreate = () => {
    setEditingCustomer(null);
    form.reset({ name: "", email: "", phone: "", address: "" });
    setDialogOpen(true);
  };

  const openEdit = (customer: Record<string, unknown>) => {
    setEditingCustomer(customer.id as string);
    form.reset({ name: customer.name as string, email: (customer.email as string) ?? "", phone: (customer.phone as string) ?? "", address: (customer.address as string) ?? "" });
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CustomerForm) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer, data);
        toast.success("Customer updated");
      } else {
        await createCustomer(data);
        toast.success("Customer created");
      }
      setDialogOpen(false);
      loadCustomers();
    } catch { toast.error("Failed to save customer"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this customer?")) return;
    try { await deleteCustomer(id); toast.success("Deleted"); loadCustomers(); }
    catch { toast.error("Failed to delete"); }
  };

  const viewHistory = async (customerId: string) => {
    try {
      const sales = await getCustomerSales(customerId);
      setPurchaseHistory(sales);
      setHistoryOpen(true);
    } catch { toast.error("Failed to load purchase history"); }
  };

  const columns: ColumnDef<Record<string, unknown>>[] = [
    {
      accessorKey: "name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name") as string}</span>
        </div>
      ),
    },
    { accessorKey: "email", header: "Email", cell: ({ row }) => (row.getValue("email") as string) ?? "-" },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => (row.getValue("phone") as string) ?? "-" },
    { accessorKey: "createdAt", header: "Member Since", cell: ({ row }) => formatDate(row.getValue("createdAt") as string) },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => viewHistory(row.original.id as string)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id as string)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer base</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Customer</Button>
      </div>

      {loading ? (
        <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>
      ) : (
        <DataTable columns={columns} data={customers} searchPlaceholder="Search customers..." page={page} totalPages={totalPages} onPageChange={setPage} onSearch={handleSearch} />
      )}

      {dialogOpen && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
              <DialogDescription>Enter customer details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input {...form.register("name")} placeholder="Full name" />
                {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input {...form.register("email")} placeholder="email@example.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input {...form.register("phone")} placeholder="Phone number" />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input {...form.register("address")} placeholder="Address" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingCustomer ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {historyOpen && (
        <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase History</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {purchaseHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No purchases yet.</p>
              ) : (
                purchaseHistory.map((s) => (
                  <div key={s.id as string} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{s.invoiceNumber as string}</span>
                      <Badge>{s.paymentMethod as string}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(s.createdAt as string, "datetime")}</p>
                    <div className="mt-2 space-y-1">
                      {(s.items as Array<{ product: { name: string }; quantity: number; price: number }>)?.map((item, idx) => (
                        <p key={idx} className="text-xs">{item.product.name} x{item.quantity} - {formatCurrency(item.price)}</p>
                      ))}
                    </div>
                    <p className="text-sm font-medium mt-2">Total: {formatCurrency(s.grandTotal as number)}</p>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}