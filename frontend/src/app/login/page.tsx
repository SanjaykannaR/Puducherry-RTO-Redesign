'use client';

import { Suspense, useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, Mail, Lock, Fingerprint, Shield, ShieldCheck, Clock, Users } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import Link from 'next/link';
import { toast } from 'sonner';
import { validators } from '@/lib/validation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast.success('Account created successfully! Please sign in.');
    }
    const oauthError = searchParams.get('error');
    if (oauthError) {
      const detail = searchParams.get('detail') || '';
      const messages: Record<string, string> = {
        invalid_state: 'Authentication session expired. Please try signing in again.',
        no_code: 'Authorization was denied. Please try again.',
        token_exchange_failed: 'Authentication failed during token exchange.',
        no_user_id: 'Could not retrieve user identity from the provider.',
        google_conflict: 'This Google account is already linked to another user.',
        google_error: detail || 'Google authentication failed.',
        digilocker_error: detail || 'DigiLocker authentication failed.',
      };
      toast.error(messages[oauthError] || `Authentication error: ${oauthError}`);
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const errs: Record<string, string> = {};
    const emailErr = validators.email(email);
    const passErr = validators.password(password);
    if (emailErr) errs.email = emailErr;
    if (passErr) errs.password = passErr;
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Branding (hidden on mobile, visible lg+) ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        {/* Gradient fade at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-10 xl:p-14">
          {/* Top: Logo */}
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105 bg-white/10 backdrop-blur-sm p-1">
              <img
                src="/puducherry-emblem.svg"
                alt="Government of Puducherry Emblem"
                className="w-full h-full object-contain"
                width="48"
                height="48"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">Puducherry RTO</h1>
              <p className="text-xs text-blue-200">Office of the Transport Commissioner</p>
            </div>
          </Link>

          {/* Middle: Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
                Digital Transport<br />Services Portal
              </h2>
              <p className="text-blue-200 text-base leading-relaxed max-w-md">
                Access all RTO services online — from license applications to vehicle registration, challan payments, and appointment booking.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, text: 'Secure & government-verified authentication' },
                { icon: Clock, text: '24/7 online access — no queues, no waiting' },
                { icon: Users, text: 'Trusted by thousands of Puducherry citizens' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-blue-200" />
                  </div>
                  <p className="text-sm text-blue-100">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Footer */}
          <p className="text-xs text-blue-300/60">
            &copy; {new Date().getFullYear()} Office of the Transport Commissioner, Puducherry
          </p>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header (visible only on small screens) */}
        <div className="lg:hidden px-4 pt-5">
          <Link href="/" className="flex items-center gap-3 no-underline w-fit mx-auto group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all group-hover:scale-105 flex-shrink-0">
              <img
                src="/puducherry-emblem.svg"
                alt="Government of Puducherry Emblem"
                className="w-full h-full object-contain"
                width="40"
                height="40"
              />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-foreground">Puducherry RTO</h1>
              <p className="text-[10px] text-muted-foreground">Office of the Transport Commissioner</p>
            </div>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 lg:py-0">
          <div className="w-full max-w-md">
            {/* Form header */}
            <div className="text-center lg:text-left mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto lg:mx-0 mb-4">
                <LogIn className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your RTO account</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl border border-destructive/20 mb-4" role="alert">
                {error}
              </div>
            )}

            {/* Email + Password form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="pl-10 h-12 rounded-xl" />
                  {fieldErrors.email && <p className="text-destructive text-xs mt-1">{fieldErrors.email}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="pl-10 h-12 rounded-xl" />
                  {fieldErrors.password && <p className="text-destructive text-xs mt-1">{fieldErrors.password}</p>}
                </div>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-3 text-muted-foreground">or continue with</span></div>
            </div>

            {/* OAuth buttons */}
            <div className="space-y-2.5">
              <Button
                variant="outline"
                className="w-full justify-center gap-3 h-11 rounded-xl"
                onClick={() => window.location.href = `${API_BASE}/auth/google/login?return=/`}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Sign in with <strong>Google</strong></span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-center gap-3 h-11 rounded-xl"
                onClick={() => window.location.href = `${API_BASE}/auth/digilocker/login?return=/dashboard`}
              >
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Sign in with <strong>DigiLocker</strong></span>
              </Button>
              <Button variant="outline" className="w-full justify-center gap-3 h-11 rounded-xl" onClick={() => alert('Aadhaar OTP login coming soon')}>
                <Fingerprint className="w-5 h-5 text-orange-600" />
                <span>Sign in with <strong>Aadhaar</strong></span>
              </Button>
            </div>

            {/* Register link */}
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary font-semibold hover:underline">Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
