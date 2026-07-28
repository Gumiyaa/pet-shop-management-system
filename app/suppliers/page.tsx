"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { DataTable } from "@/src/components/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/src/features/suppliers/actions";
import { Plus, Edit2, Trash2, Truck } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";

const supplierFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type SupplierForm = z.infer<typeof supplierFormSchema>;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const form = useForm<SupplierForm>({ resolver: zodResolver(supplierFormSchema), defaultValues: { name: "", email: "", phone: "", address: "" } });

  const load = useCallback(async () => {
    try { const r = await getSuppliers({ page, pageSize: 10, search }); setSuppliers(r.data); setTotalPages(r.totalPages); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); form.reset({ name: "", email: "", phone: "", address: "" }); setDialogOpen(true); };
  const openEdit = (s: Record<string, unknown>) => { setEditing(s.id as string); form.reset({ name: s.name as string, email: (s.email as string) ?? "", phone: (s.phone as string) ?? "", address: (s.address as string) ?? "" }); setDialogOpen(true); };

  const handleSubmit = async (data: SupplierForm) => {
    try {
      if (editing) { await updateSupplier(editing, data); toast.success("Updated"); }
      else { await createSupplier(data); toast.success("Created"); }
      setDialogOpen(false); load();
    } catch { toast.error("Failed to save"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;
    try { await deleteSupplier(id); toast.success("Deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  const columns: ColumnDef<Record<string, unknown>>[] = [
    {
      accessorKey: "name",
      header: "Supplier",
      cell: ({ row }) => <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{row.getValue("name") as string}</span></div>,
    },
    { accessorKey: "email", header: "Email", cell: ({ row }) => (row.getValue("email") as string) ?? "-" },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => (row.getValue("phone") as string) ?? "-" },
    { accessorKey: "address", header: "Address", cell: ({ row }) => (row.getValue("address") as string) ?? "-" },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)}><Edit2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id as string)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Suppliers</h1><p className="text-muted-foreground">Manage your suppliers</p></div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Supplier</Button>
      </div>
      {loading ? <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div> :
        <DataTable columns={columns} data={suppliers} searchPlaceholder="Search suppliers..." page={page} totalPages={totalPages} onPageChange={setPage} onSearch={(v) => { setSearch(v); setPage(1); setLoading(true); }} />
      }
      {dialogOpen && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit Supplier" : "Add Supplier"}</DialogTitle><DialogDescription>Enter supplier details.</DialogDescription></DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div><label className="text-sm font-medium">Name</label><Input {...form.register("name")} />{form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}</div>
              <div><label className="text-sm font-medium">Email</label><Input {...form.register("email")} /></div>
              <div><label className="text-sm font-medium">Phone</label><Input {...form.register("phone")} /></div>
              <div><label className="text-sm font-medium">Address</label><Input {...form.register("address")} /></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">{editing ? "Update" : "Create"}</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}