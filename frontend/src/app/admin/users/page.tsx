'use client';

// ── React hooks for data fetching and state management ──
import { useEffect, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
// ── Confirmation dialog before destructive actions ──
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
// ── Icons for promote/demote admin and delete actions ──
import { Shield, ShieldOff, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
}

export default function AdminUsers() {
  // ── State: user list, loading/error, and the user pending deletion ──
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  // ── Add Admin form state ──
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [addSubmitting, setAddSubmitting] = useState(false);

  // ── Fetch users from API ──
  // Wrapped in useCallback so it can be safely passed as a dependency.
  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get<{ users: AdminUser[] }>('/admin/users');
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Toggle admin role ──
  // Optimistic update: immediately flip the role in local state, then send the PATCH.
  // If the API call fails, the error is surfaced via alert (could be replaced with toast).
  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'CITIZEN' : 'ADMIN';
    try {
      await api.patch<AdminUser>(`/admin/users/${id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ── Delete user ──
  // Removes the user both from the database and from the local list after confirmation.
  const deleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/users/${deleteTarget.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ── Create admin user ──
  const createAdmin = async () => {
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
      const newUser = await api.post<AdminUser>('/admin/users', addForm);
      setUsers((prev) => [newUser, ...prev]);
      setAddForm({ name: '', email: '', mobile: '', password: '' });
      setAddOpen(false);
      toast.success(`${newUser.name} added as admin`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAddSubmitting(false);
    }
  };

  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Users Management</h1>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>
      {/* ── Users table ── */}
      {/* Admin-oriented table with columns for name, email, mobile, role badge,
          and action buttons. Skeleton rows are shown during loading; an empty state
          is shown when no users exist. Each row has "Make Admin/Remove Admin" and
          "Delete" buttons, the latter triggering a confirmation dialog. */}
      <div className="rounded-lg border bg-white overflow-x-auto">
        {/* ── Desktop: Table view (sm+) ── */}
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
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.mobile}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                        {user.role === 'ADMIN' ? 'Admin' : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => toggleRole(user.id, user.role)} aria-label={user.role === 'ADMIN' ? 'Remove admin privileges' : 'Make admin'}>
                          {user.role === 'ADMIN' ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                          {user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(user)} aria-label={`Delete user ${user.name}`}>
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

        {/* ── Mobile: Card view (<sm) ── */}
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
            <p className="text-center text-muted-foreground py-8">No users found.</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.mobile}</p>
                  </div>
                  <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'} className="text-[10px]">
                    {user.role === 'ADMIN' ? 'Admin' : 'User'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleRole(user.id, user.role)} className="flex-1 min-h-[44px]" aria-label={user.role === 'ADMIN' ? 'Remove admin privileges' : 'Make admin'}>
                    {user.role === 'ADMIN' ? <ShieldOff className="h-4 w-4 mr-1" /> : <Shield className="h-4 w-4 mr-1" />}
                    {user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(user)} className="min-h-[44px] min-w-[44px]" aria-label={`Delete user ${user.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Add Admin dialog ── */}
      <Dialog open={addOpen} onOpenChange={(open) => { if (!open) { setAddOpen(false); setAddErrors({}); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin Account</DialogTitle>
            <DialogDescription>
              Create a new admin account with email and password. They can log in at /login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label htmlFor="admin-name" className="block text-sm font-medium mb-1">Name</label>
              <Input id="admin-name" placeholder="Full name" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="h-12 rounded-xl" />
              {addErrors.name && <p className="text-destructive text-xs mt-1">{addErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium mb-1">Email</label>
              <Input id="admin-email" type="email" placeholder="user@rto.gov.in" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="h-12 rounded-xl" />
              {addErrors.email && <p className="text-destructive text-xs mt-1">{addErrors.email}</p>}
            </div>
            <div>
              <label htmlFor="admin-mobile" className="block text-sm font-medium mb-1">Mobile</label>
              <Input id="admin-mobile" placeholder="10-digit mobile number" value={addForm.mobile} onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })} className="h-12 rounded-xl" />
              {addErrors.mobile && <p className="text-destructive text-xs mt-1">{addErrors.mobile}</p>}
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium mb-1">Password</label>
              <Input id="admin-password" type="password" placeholder="Min 6 characters" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="h-12 rounded-xl" />
              {addErrors.password && <p className="text-destructive text-xs mt-1">{addErrors.password}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setAddErrors({}); }}>Cancel</Button>
            <Button onClick={createAdmin} disabled={addSubmitting}>
              {addSubmitting ? 'Creating...' : 'Create Admin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation dialog ── */}
      {/* Modal that shows the user's name and warns the action is irreversible.
          Prevents accidental deletions by requiring explicit confirmation. */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
