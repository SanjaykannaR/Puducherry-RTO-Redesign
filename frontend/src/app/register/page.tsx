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
import { API_BASE } from '@/lib/api';
import { validators, validateForm } from '@/lib/validation';

// ── Register Page ──
// Same full-viewport layout as Login but with a packed two-column form that keeps
// the card compact enough to feel like a quick sign-up, not a long application.

export default function RegisterPage() {
  // ── Form State ──
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  // ── Submit Handler ──
  // Client-side password-match check before hitting the API so the server isn't
  // bothered with obviously invalid submissions.
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const { valid, errors: errs } = validateForm(form, {
      name: validators.name,
      email: validators.email,
      mobile: validators.mobile,
      password: validators.password,
    });
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!valid || Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.mobile, form.password);
      router.push('/login?registered=true');
      setError('');
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
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all group-hover:scale-105 flex-shrink-0">
            <img 
              src="/puducherry-emblem.svg" 
              alt="Government of Puducherry Emblem" 
              className="w-full h-full object-contain"
              width="48"
              height="48"
            />
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
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20" role="alert">
                  {error}
                </div>
              )}
              {/* Full Name — full-width */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="John Doe" className="pl-10 h-12 rounded-xl" />
                  {fieldErrors.name && <p className="text-destructive text-xs mt-1">{fieldErrors.name}</p>}
                </div>
              </div>
              {/* Email + Mobile — side-by-side on sm+, stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="reg-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" className="pl-10 h-12 rounded-xl" />
                    {fieldErrors.email && <p className="text-destructive text-xs mt-1">{fieldErrors.email}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium mb-1.5">Mobile</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="mobile" type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required placeholder="9876543210" className="pl-10 h-12 rounded-xl" />
                    {fieldErrors.mobile && <p className="text-destructive text-xs mt-1">{fieldErrors.mobile}</p>}
                  </div>
                </div>
              </div>
              {/* Password + Confirm — side-by-side on sm+, stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="reg-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" className="pl-10 h-12 rounded-xl" />
                    {fieldErrors.password && <p className="text-destructive text-xs mt-1">{fieldErrors.password}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium mb-1.5">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirm-password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required placeholder="••••••••" className="pl-10 h-12 rounded-xl" />
                    {fieldErrors.confirmPassword && <p className="text-destructive text-xs mt-1">{fieldErrors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={submitting}>
                {submitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* ── Divider ── */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">or register with</span></div>
            </div>

            {/* ── Alternative Registration Methods ── */}
            {/* Aadhaar / DigiLocker / Google — Google works immediately with .env creds */}
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="gap-1.5 h-11 px-2" onClick={() => alert('Aadhaar registration coming soon')}>
                <Fingerprint className="w-4 h-4 text-orange-600 shrink-0" />
                <span className="text-xs">Aadhaar</span>
              </Button>
              <Button
                variant="outline"
                className="gap-1.5 h-11 px-2"
                onClick={() => window.location.href = `${API_BASE}/auth/digilocker/login?return=/dashboard`}
              >
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs">DigiLocker</span>
              </Button>
              {/* Google — real OAuth, works without org registration */}
              <Button
                variant="outline"
                className="gap-1.5 h-11 px-2"
                onClick={() => window.location.href = `${API_BASE}/auth/google/login?return=/`}
              >
                {/* Inline Google "G" logo */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-xs">Google</span>
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
