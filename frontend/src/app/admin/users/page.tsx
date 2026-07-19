'use client';

// ── Admin Users — Manage Admin & Staff accounts only ──
import { useEffect, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { Shield, Trash2, UserPlus, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'ADMIN' | 'STAFF';
}

export default function AdminUsers() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<StaffUser | null>(null);

  // ── Add form ──
  const [addOpen, setAddOpen] = useState(false);
  const [addRole, setAddRole] = useState<'ADMIN' | 'STAFF'>('ADMIN');
  const [addForm, setAddForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [addSubmitting, setAddSubmitting] = useState(false);

  // ── Edit form ──
  const [editTarget, setEditTarget] = useState<StaffUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', mobile: '', role: '', password: '' });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get<{ users: StaffUser[] }>('/admin/users');
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Create user ──
  const createUser = async () => {
    const errs: Record<string, string> = {};
    if (!addForm.name.trim()) errs.name = 'Name is required';
    if (!addForm.email.trim()) errs.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addForm.email)) errs.email = 'Invalid email';
    if (!addForm.mobile.trim()) errs.mobile = 'Mobile is required';
    if (!/^\d{10}$/.test(addForm.mobile.replace(/\D/g, ''))) errs.mobile = 'Enter 10-digit mobile';
    if (addForm.password.length < 6) errs.password = 'Min 6 characters';
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return; }
    setAddErrors({});
    setAddSubmitting(true);
    try {
      const newUser = await api.post<StaffUser>('/admin/users', { ...addForm, role: addRole });
      setUsers((prev) => [newUser, ...prev]);
      setAddForm({ name: '', email: '', mobile: '', password: '' });
      setAddOpen(false);
      toast.success(`${newUser.name} added as ${addRole === 'STAFF' ? 'Staff' : 'Admin'}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddSubmitting(false);
    }
  };

  // ── Delete user ──
  const deleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success(`${deleteTarget.name} deleted`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ── Update user ──
  const updateUser = async () => {
    if (!editTarget) return;
    const errs: Record<string, string> = {};
    if (!editForm.name.trim()) errs.name = 'Name is required';
    if (!editForm.email.trim()) errs.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) errs.email = 'Invalid email';
    if (!editForm.mobile.trim()) errs.mobile = 'Mobile is required';
    if (editForm.password && editForm.password.length < 6) errs.password = 'Min 6 characters';
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    setEditErrors({});
    setEditSubmitting(true);
    try {
      const updated = await api.put<StaffUser>(`/admin/users/${editTarget.id}`, editForm);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditTarget(null);
      toast.success(`${updated.name} updated`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const openAdd = (role: 'ADMIN' | 'STAFF') => {
    setAddRole(role);
    setAddForm({ name: '', email: '', mobile: '', password: '' });
    setAddErrors({});
    setAddOpen(true);
  };

  const openEdit = (user: StaffUser) => {
    setEditTarget(user);
    setEditForm({ name: user.name, email: user.email, mobile: user.mobile, role: user.role, password: '' });
    setEditErrors({});
  };

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Staff & Admin Accounts</h1>
        <div className="flex gap-2">
          <Button onClick={() => openAdd('STAFF')} variant="outline" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Staff
          </Button>
          <Button onClick={() => openAdd('ADMIN')} className="gap-2">
            <Shield className="h-4 w-4" />
            Add Admin
          </Button>
        </div>
      </div>

      {/* ── Desktop: Table ── */}
      <div className="rounded-lg border bg-white overflow-x-auto">
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No admin or staff accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.mobile}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'ADMIN' ? 'destructive' : 'default'}>
                        {u.role === 'ADMIN' ? 'Admin' : 'Staff'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(u)} aria-label={`Edit ${u.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(u)} aria-label={`Delete ${u.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Mobile: Cards ── */}
        <div className="sm:hidden divide-y">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No admin or staff accounts found.</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.mobile}</p>
                  </div>
                  <Badge variant={u.role === 'ADMIN' ? 'destructive' : 'default'} className="text-[10px]">
                    {u.role === 'ADMIN' ? 'Admin' : 'Staff'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(u)} className="min-h-[44px] min-w-[44px]" aria-label={`Edit ${u.name}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(u)} className="min-h-[44px] min-w-[44px]" aria-label={`Delete ${u.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Add Account dialog ── */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) { setAddOpen(false); setAddErrors({}); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create {addRole === 'STAFF' ? 'Staff' : 'Admin'} Account</DialogTitle>
            <DialogDescription>
              New {addRole === 'STAFF' ? 'staff' : 'admin'} will be able to log in at /login with email &amp; password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label htmlFor="add-name" className="block text-sm font-medium mb-1">Name</label>
              <Input id="add-name" placeholder="Full name" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="h-12 rounded-xl" />
              {addErrors.name && <p className="text-destructive text-xs mt-1">{addErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="add-email" className="block text-sm font-medium mb-1">Email</label>
              <Input id="add-email" type="email" placeholder="user@rto.gov.in" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="h-12 rounded-xl" />
              {addErrors.email && <p className="text-destructive text-xs mt-1">{addErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="add-mobile" className="block text-sm font-medium mb-1">Mobile</label>
              <Input id="add-mobile" placeholder="10-digit mobile number" value={addForm.mobile} onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })} className="h-12 rounded-xl" />
              {addErrors.mobile && <p className="text-destructive text-xs mt-1">{addErrors.mobile}</p>}
            </div>
            <div>
              <label htmlFor="add-password" className="block text-sm font-medium mb-1">Password</label>
              <Input id="add-password" type="password" placeholder="Min 6 characters" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="h-12 rounded-xl" />
              {addErrors.password && <p className="text-destructive text-xs mt-1">{addErrors.password}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setAddErrors({}); }}>Cancel</Button>
            <Button onClick={createUser} disabled={addSubmitting}>
              {addSubmitting ? 'Creating...' : `Create ${addRole === 'STAFF' ? 'Staff' : 'Admin'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ── */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) { setEditTarget(null); setEditErrors({}); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update details for <strong>{editTarget?.name}</strong>. Leave password blank to keep current.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium mb-1">Name</label>
              <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-12 rounded-xl" />
              {editErrors.name && <p className="text-destructive text-xs mt-1">{editErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium mb-1">Email</label>
              <Input id="edit-email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="h-12 rounded-xl" />
              {editErrors.email && <p className="text-destructive text-xs mt-1">{editErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="edit-mobile" className="block text-sm font-medium mb-1">Mobile</label>
              <Input id="edit-mobile" value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} className="h-12 rounded-xl" />
              {editErrors.mobile && <p className="text-destructive text-xs mt-1">{editErrors.mobile}</p>}
            </div>
            <div>
              <label htmlFor="edit-role" className="block text-sm font-medium mb-1">Role</label>
              <select id="edit-role" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm">
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit-password" className="block text-sm font-medium mb-1">New Password (optional)</label>
              <Input id="edit-password" type="password" placeholder="Leave blank to keep current" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="h-12 rounded-xl" />
              {editErrors.password && <p className="text-destructive text-xs mt-1">{editErrors.password}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditTarget(null); setEditErrors({}); }}>Cancel</Button>
            <Button onClick={updateUser} disabled={editSubmitting}>
              {editSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteUser}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
