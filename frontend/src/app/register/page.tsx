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
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

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

  return (
    <>
      <PageHero title="Create Account" subtitle="Register for RTO online services" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-md mx-auto px-4 py-12">
          <FadeInSection>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
              <CardHeader className="text-center pb-2">
                <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-2xl">Get Started</CardTitle>
                <CardDescription>Create your RTO account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20" role="alert">
                      {error}
                    </div>
                  )}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5">Full Name</label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="John Doe" />
                  </div>
                  <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5">Email</label>
                    <Input id="reg-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" />
                  </div>
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium mb-1.5">Mobile</label>
                    <Input id="mobile" type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required placeholder="9876543210" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5">Password</label>
                      <Input id="reg-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" />
                    </div>
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium mb-1.5">Confirm</label>
                      <Input id="confirm-password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required placeholder="••••••••" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {submitting ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary font-medium hover:underline">Sign In</Link>
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
