"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { DataTable } from "@/src/components/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, createCategory, getProduct } from "@/src/features/products/actions";
import { Plus, Edit2, Trash2, Package } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";

interface ProductRow {
  id: string;
  name: string;
  barcode?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  active: boolean;
  categoryId?: string;
  supplierId?: string;
  description?: string;
  image?: string;
  category?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
  createdAt: Date | string;
}

interface ProductFormState {
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  barcode: string;
  categoryId: string;
  supplierId: string;
  active: boolean;
}

const emptyForm: ProductFormState = { name: "", description: "", price: 0, cost: 0, stock: 0, minStock: 5, barcode: "", categoryId: "", supplierId: "", active: true };

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      const result = await getProducts({ page, pageSize: 10, search });
      setProducts(result.data as unknown as ProductRow[]);
      setTotalPages(result.totalPages);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = async (id: string) => {
    try {
      const product = await getProduct(id);
      setEditingId(id);
      setForm({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        minStock: product.minStock,
        barcode: product.barcode ?? "",
        categoryId: product.categoryId ?? "",
        supplierId: product.supplierId ?? "",
        active: product.active,
      });
      setDialogOpen(true);
    } catch { toast.error("Failed to load product"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    try {
      const data = {
        name: form.name,
        description: form.description || undefined,
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        barcode: form.barcode || undefined,
        categoryId: form.categoryId || undefined,
        supplierId: form.supplierId || undefined,
        active: form.active,
      };
      if (editingId) { await updateProduct(editingId, data); toast.success("Product updated"); }
      else { await createProduct(data); toast.success("Product created"); }
      setDialogOpen(false); loadProducts();
    } catch { toast.error("Failed to save product"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try { await deleteProduct(id); toast.success("Product deleted"); loadProducts(); }
    catch { toast.error("Failed to delete"); }
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;
    try { await createCategory({ name: categoryName }); toast.success("Category created"); setCategoryName(""); setCategoryDialog(false); getCategories().then(setCategories); }
    catch { toast.error("Failed to create category"); }
  };

  const columns: ColumnDef<ProductRow>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{row.getValue("name") as string}</p>
            <p className="text-xs text-muted-foreground">{row.original.barcode ?? "No barcode"}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category?.name ?? "-",
    },
    { accessorKey: "price", header: "Price", cell: ({ row }) => formatCurrency(row.getValue("price") as number) },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number;
        const minStock = row.original.minStock ?? 5;
        return <Badge variant={stock <= minStock ? "destructive" : "success"}>{stock}</Badge>;
      },
    },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.getValue("createdAt") as string) },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original.id)}><Edit2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Products</h1><p className="text-muted-foreground">Manage your product inventory</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoryDialog(true)}><Plus className="mr-2 h-4 w-4" /> Category</Button>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Product</Button>
        </div>
      </div>

      {loading ? <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div> :
        <DataTable columns={columns} data={products} searchPlaceholder="Search products..." page={page} totalPages={totalPages} onPageChange={setPage} onSearch={(v) => { setSearch(v); setPage(1); setLoading(true); }} />
      }

      {dialogOpen && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
              <DialogDescription>Fill in the product details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-sm font-medium">Name</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name" required /></div>
              <div><label className="text-sm font-medium">Description</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Price</label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                <div><label className="text-sm font-medium">Cost</label><Input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Stock</label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
                <div><label className="text-sm font-medium">Min Stock</label><Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} /></div>
              </div>
              <div><label className="text-sm font-medium">Barcode</label><Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} placeholder="Optional" /></div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {categoryDialog && (
        <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category name" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCategoryDialog(false)}>Cancel</Button>
                <Button onClick={handleAddCategory}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}