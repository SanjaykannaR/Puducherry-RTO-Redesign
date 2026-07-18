'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between w-full p-10 xl:p-14">
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

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4">
                Account Recovery
              </h2>
              <p className="text-blue-200 text-base leading-relaxed max-w-md">
                Don&apos;t worry — we&apos;ll send you a link to reset your password. Just enter the email address associated with your account.
              </p>
            </div>
          </div>

          <p className="text-xs text-blue-300/60">
            &copy; {new Date().getFullYear()} Office of the Transport Commissioner, Puducherry
          </p>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
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
            <div className="text-center lg:text-left mb-6">
              <h2 className="text-2xl font-bold text-foreground">Forgot Password?</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter your email and we&apos;ll send a reset link</p>
            </div>

            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-muted-foreground">If an account exists with that email, we&apos;ve sent a password reset link.</p>
                <Link href="/login" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl border border-destructive/20 mb-4" role="alert">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="fp-email" className="block text-sm font-medium mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="fp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="pl-10 h-12 rounded-xl" aria-label="Email address for password reset" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                    {submitting ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </form>
                <div className="mt-6 pt-4 border-t text-center">
                  <Link href="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
