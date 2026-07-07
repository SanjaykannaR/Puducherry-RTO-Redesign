'use client';

// ── Imports ──

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Mail, Lock, Fingerprint, Shield } from 'lucide-react';
import Link from 'next/link';

// ── Login Page ──
// Full-viewport centered layout without Header/Footer (the LayoutWrapper hides them
// when pathname === '/login'). The only navigation is the RTO logo linking back home.

export default function LoginPage() {
  // ── Form State ──
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');               // API error message to display inline
  const [submitting, setSubmitting] = useState(false);   // Disables button during network request
  const { login } = useAuth();
  const router = useRouter();

  // ── Submit Handler ──
  // Calls AuthContext.login which posts to /auth/login and persists the JWT.
  // On success the user is redirected to the dashboard; errors surface inside the card.
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // min-h-screen + flex-col keeps the card vertically centered even on short viewports
    <div className="min-h-screen flex flex-col">
      {/* ── Top Accent Bar ── */}
      {/* A thin gradient bar at the very top gives the page a polished, branded feel */}
      <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark shrink-0" />

      {/* ── RTO Logo / Home Link ── */}
      {/* Clicking the branded logo block navigates back to the homepage. */}
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

      {/* ── Login Card ── */}
      {/* Vertically + horizontally centered on the remaining viewport space */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
          <CardHeader className="text-center pb-3 pt-6">
            <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
              <LogIn className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your RTO account</CardDescription>
          </CardHeader>
          <CardContent>
            {/* ── Email / Password Form ── */}
            {/* Inline icons inside each input help the user quickly identify the field's purpose */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20" role="alert">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="pl-10" />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="pl-10" />
                </div>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* ── Divider ── */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">or continue with</span></div>
            </div>

            {/* ── Alternative Login Methods ── */}
            {/* Aadhaar OTP and DigiLocker are future integrations; currently shown as placeholders
                so users know alternative login paths are planned. */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-center gap-3 h-12 text-base" onClick={() => alert('Aadhaar OTP login coming soon')}>
                <Fingerprint className="w-5 h-5 text-orange-600" />
                <span>Sign in with <strong>Aadhaar</strong></span>
              </Button>
              <Button variant="outline" className="w-full justify-center gap-3 h-12 text-base" onClick={() => alert('DigiLocker integration coming soon')}>
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Sign in with <strong>DigiLocker</strong></span>
              </Button>
            </div>

            {/* ── Register Link ── */}
            <div className="mt-5 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary font-medium hover:underline">Create Account</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
