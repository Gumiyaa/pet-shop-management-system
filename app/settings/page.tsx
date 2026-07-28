"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { getStore, updateStore, getUsers, createUser, updateUser, deleteUser } from "@/src/features/settings/actions";
import { useTheme } from "@/src/lib/theme-context";
import { Store, Users, Sun, Moon, Save, Plus, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface StoreForm {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxRate: number;
  currency: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "CASHIER";
  active: boolean;
}

const emptyUserForm: UserForm = { name: "", email: "", password: "", role: "CASHIER", active: true };

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDialog, setUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<UserForm>(emptyUserForm);
  const [storeForm, setStoreForm] = useState<StoreForm>({ name: "", address: "", phone: "", email: "", taxRate: 0, currency: "VND" });
  const [activeTab, setActiveTab] = useState<"store" | "users">("store");

  const load = useCallback(async () => {
    try {
      const [s, u] = await Promise.all([getStore(), getUsers()]);
      setStoreForm({ name: s.name, address: s.address ?? "", phone: s.phone ?? "", email: s.email ?? "", taxRate: Number(s.taxRate), currency: s.currency });
      setUsers(u as UserRow[]);
    } catch { toast.error("Failed to load settings"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await updateStore(storeForm); toast.success("Store updated"); }
    catch { toast.error("Failed to update"); }
  };

  const openCreateUser = () => { setEditingUser(null); setUserForm(emptyUserForm); setUserDialog(true); };

  const openEditUser = (u: UserRow) => {
    setEditingUser(u.id);
    setUserForm({ name: u.name, email: u.email, password: "", role: u.role as "ADMIN" | "CASHIER", active: u.active });
    setUserDialog(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) { await updateUser(editingUser, userForm); toast.success("User updated"); }
      else { await createUser(userForm); toast.success("User created"); }
      setUserDialog(false); load();
    } catch { toast.error("Failed to save user"); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    try { await deleteUser(id); toast.success("Deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Settings</h1><p className="text-muted-foreground">Manage store and system preferences</p></div>

      <div className="flex gap-2">
        <Button variant={activeTab === "store" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("store")}><Store className="mr-2 h-4 w-4" /> Store</Button>
        <Button variant={activeTab === "users" ? "default" : "outline"} size="sm" onClick={() => setActiveTab("users")}><Users className="mr-2 h-4 w-4" /> Users</Button>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>
        </div>
      </div>

      {activeTab === "store" && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> Store Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleStoreSubmit} className="space-y-4 max-w-md">
              <div><label className="text-sm font-medium">Store Name</label><Input value={storeForm.name} onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })} required /></div>
              <div><label className="text-sm font-medium">Address</label><Input value={storeForm.address} onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Phone</label><Input value={storeForm.phone} onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })} /></div>
              <div><label className="text-sm font-medium">Email</label><Input value={storeForm.email} onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Tax Rate (%)</label><Input type="number" value={storeForm.taxRate} onChange={(e) => setStoreForm({ ...storeForm, taxRate: Number(e.target.value) })} /></div>
                <div><label className="text-sm font-medium">Currency</label><Input value={storeForm.currency} onChange={(e) => setStoreForm({ ...storeForm, currency: e.target.value })} /></div>
              </div>
              <Button type="submit"><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "users" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> User Management</CardTitle>
            <Button size="sm" onClick={openCreateUser}><Plus className="mr-2 h-4 w-4" /> Add User</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{u.role}</Badge>
                    <Badge variant={u.active ? "success" : "destructive"}>{u.active ? "Active" : "Inactive"}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => openEditUser(u)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {userDialog && (
        <Dialog open={userDialog} onOpenChange={setUserDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle></DialogHeader>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div><label className="text-sm font-medium">Name</label><Input value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} required /></div>
              <div><label className="text-sm font-medium">Email</label><Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required /></div>
              <div><label className="text-sm font-medium">Password {editingUser && "(leave blank to keep)"}</label><Input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder={editingUser ? "Leave blank" : "Min 6 chars"} /></div>
              <div><label className="text-sm font-medium">Role</label>
                <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value as "ADMIN" | "CASHIER" })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="CASHIER">Cashier</option><option value="ADMIN">Admin</option>
                </select>
              </div>
              <div><label className="text-sm font-medium">Active</label>
                <select value={String(userForm.active)} onChange={(e) => setUserForm({ ...userForm, active: e.target.value === "true" })} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="true">Active</option><option value="false">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setUserDialog(false)}>Cancel</Button><Button type="submit">{editingUser ? "Update" : "Create"}</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}