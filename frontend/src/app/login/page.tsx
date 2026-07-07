'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import { LogIn, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

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
    <>
      <PageHero title="Sign In" subtitle="Access your RTO online account" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-md mx-auto px-4 py-12">
          <FadeInSection>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
              <CardHeader className="text-center pb-2">
                <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
                  <LogIn className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>Sign in to your RTO account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20" role="alert">
                      {error}
                    </div>
                  )}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    <LogIn className="w-4 h-4 mr-2" />
                    {submitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-primary font-medium hover:underline">Create Account</Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
