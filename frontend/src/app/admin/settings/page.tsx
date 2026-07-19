'use client';

// ── Admin Settings — Account credentials + create admin/staff ──
import { useState, FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, UserPlus } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  // ── Email form ──
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  // ── Password form ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSubmitting, setPwSubmitting] = useState(false);

  // ── Create account form ──
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'STAFF'>('ADMIN');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // ── Change Email ──
  async function handleEmailChange(e: FormEvent) {
    e.preventDefault();
    setEmailSubmitting(true);
    try {
      await api.patch('/admin/settings/email', { email, currentPassword: emailPassword });
      toast.success('Email updated successfully');
      setEmail('');
      setEmailPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update email');
    } finally {
      setEmailSubmitting(false);
    }
  }

  // ── Change Password ──
  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setPwSubmitting(true);
    try {
      await api.patch('/admin/settings/password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setPwSubmitting(false);
    }
  }

  // ── Create admin/staff account ──
  async function handleCreateAccount(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) { toast.error('Name is required'); return; }
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { toast.error('Valid email is required'); return; }
    if (!/^\d{10}$/.test(newMobile.replace(/\D/g, ''))) { toast.error('Enter 10-digit mobile number'); return; }
    if (staffPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }

    setCreateSubmitting(true);
    try {
      await api.post('/admin/users', {
        name: newName.trim(),
        email: newEmail.trim(),
        mobile: newMobile.trim(),
        password: staffPassword,
        role: newRole,
      });
      toast.success(`${newName} created as ${newRole === 'STAFF' ? 'Staff' : 'Admin'}`);
      setNewName('');
      setNewEmail('');
      setNewMobile('');
      setStaffPassword('');
      setNewRole('ADMIN');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account');
    } finally {
      setCreateSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-muted-foreground">Manage your account and create admin/staff accounts.</p>
      </div>

      {/* ── Current Account Info ── */}
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Two-column grid: Email + Password ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Change Email ── */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-primary" />
              Change Email
            </CardTitle>
            <CardDescription>Update the email address associated with your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label htmlFor="new-email" className="block text-sm font-medium mb-1">New Email</label>
                <Input id="new-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="email-pw" className="block text-sm font-medium mb-1">Current Password</label>
                <Input id="email-pw" type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={emailSubmitting}>
                {emailSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                {emailSubmitting ? 'Updating...' : 'Update Email'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Change Password ── */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 to-amber-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>Set a new password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="current-pw" className="block text-sm font-medium mb-1">Current Password</label>
                <Input id="current-pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-pw" className="block text-sm font-medium mb-1">New Password</label>
                  <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
                </div>
                <div>
                  <label htmlFor="confirm-pw" className="block text-sm font-medium mb-1">Confirm Password</label>
                  <Input id="confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="••••••••" minLength={6} />
                </div>
              </div>
              <Button type="submit" disabled={pwSubmitting}>
                {pwSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                {pwSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ── Create Admin/Staff Account ── */}
      <Card className="border-0 shadow-md overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-primary" />
            Create Admin / Staff Account
          </CardTitle>
          <CardDescription>
            Add a new admin or staff member. They will be able to log in at /login with email &amp; password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAccount}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="staff-name" className="block text-sm font-medium mb-1">Full Name</label>
                <Input id="staff-name" placeholder="e.g. Rajesh Kumar" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div>
                <label htmlFor="staff-role" className="block text-sm font-medium mb-1">Role</label>
                <select id="staff-role" value={newRole} onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'STAFF')} className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm">
                  <option value="ADMIN">Admin (RTO)</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
              <div>
                <label htmlFor="staff-email" className="block text-sm font-medium mb-1">Email</label>
                <Input id="staff-email" type="email" placeholder="user@rto.gov.in" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div>
                <label htmlFor="staff-mobile" className="block text-sm font-medium mb-1">Mobile</label>
                <Input id="staff-mobile" placeholder="10-digit mobile number" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div>
                <label htmlFor="staff-password" className="block text-sm font-medium mb-1">Password</label>
                <Input id="staff-password" type="password" placeholder="Min 6 characters" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} className="h-12 rounded-xl" minLength={6} />
              </div>
            </div>
            <div className="mt-5">
              <Button type="submit" disabled={createSubmitting} className="gap-2">
                {createSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {createSubmitting ? 'Creating...' : `Create ${newRole === 'STAFF' ? 'Staff' : 'Admin'} Account`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
