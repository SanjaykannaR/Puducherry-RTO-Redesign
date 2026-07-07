'use client';

// ── Imports ──

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Mail, Lock, Smartphone, User, Fingerprint, Shield, Check } from 'lucide-react';

// ── Register Page ──
// Same full-viewport layout as Login but with a packed two-column form that keeps
// the card compact enough to feel like a quick sign-up, not a long application.

export default function RegisterPage() {
  // ── Form State ──
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // ── Submit Handler ──
  // Client-side password-match check before hitting the API so the server isn't
  // bothered with obviously invalid submissions.
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, mobile: form.mobile, password: form.password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  // Benefits strip shown to encourage sign-up by listing what the user gains
  const benefits = ['Track application status', 'Book appointments online', 'View vehicle & license details', 'Pay challans digitally'];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top Accent Bar ── */}
      <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark shrink-0" />

      {/* ── RTO Logo / Home Link ── */}
      <div className="px-4 pt-5">
        <Link href="/" className="flex items-center gap-3 no-underline w-fit mx-auto group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
            <span className="text-white font-bold text-sm">RTO</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-foreground">Puducherry RTO</h1>
            <p className="text-xs text-muted-foreground">Office of the Transport Commissioner</p>
          </div>
        </Link>
      </div>

      {/* ── Registration Card ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
          <CardHeader className="text-center pb-2 pt-6">
            <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>Create your RTO account in seconds</CardDescription>

            {/* ── Benefits Badge Strip ── */}
            {/* A compact row of check-marked items that tell the user *why* they should register.
                Positioned just below the subtitle so it's visible without scrolling. */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4 pt-3 border-t">
              {benefits.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-primary" />
                  {b}
                </span>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {/* ── Registration Form ── */}
            {/* Uses two-column grid groups (Email/Mobile, Password/Confirm) to fit all 5 fields
                into a compact card without scrolling on desktop. */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20" role="alert">
                  {error}
                </div>
              )}
              {/* Full Name — full-width since it's always visible first */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="John Doe" className="pl-10" />
                </div>
              </div>
              {/* Email + Mobile side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="reg-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" className="pl-10" />
                  </div>
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium mb-1">Mobile</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="mobile" type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required placeholder="9876543210" className="pl-10" />
                  </div>
                </div>
              </div>
              {/* Password + Confirm side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="reg-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" className="pl-10" />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirm-password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required placeholder="••••••••" className="pl-10" />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* ── Divider ── */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">or register with</span></div>
            </div>

            {/* ── Alternative Registration Methods ── */}
            {/* Aadhaar / DigiLocker as quicker alternatives to manual form entry (future). */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="gap-2 h-11" onClick={() => alert('Aadhaar registration coming soon')}>
                <Fingerprint className="w-4 h-4 text-orange-600" />
                <span className="text-sm">Aadhaar</span>
              </Button>
              <Button variant="outline" className="gap-2 h-11" onClick={() => alert('DigiLocker registration coming soon')}>
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm">DigiLocker</span>
              </Button>
            </div>

            {/* ── Login Link ── */}
            <div className="mt-4 pt-3 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">Sign In</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
