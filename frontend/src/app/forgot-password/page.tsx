'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark shrink-0" />
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
          <CardHeader className="text-center pb-3 pt-6">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">If an account exists with that email, we&apos;ve sent a password reset link.</p>
                <Link href="/login" className="inline-flex items-center gap-2 text-primary hover:underline">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" className="pl-10" />
                </div>
                <Button type="submit" className="w-full">Send Reset Link</Button>
                <div className="text-center">
                  <Link href="/login" className="text-sm text-primary hover:underline">Back to Login</Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
