'use client';

// ── Imports ──

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LogIn } from 'lucide-react';
import { toast } from 'sonner';

// ── Route Guard ──
// Wraps pages that require authentication. Shows a spinner while AuthContext is resolving
// the session, a login-prompt card if the user is unauthenticated, or the protected children.
// Uses useRef to prevent duplicate toast firings caused by React StrictMode double-mounting.
export default function RequireAuth({ children, message = 'Please sign in to access this service' }: { children: React.ReactNode; message?: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const shown = useRef(false);          // Ensures the toast fires only once per mount

  // ── Toast Notification ──
  // Fire a sonner toast when the user is not authenticated so they get immediate feedback
  // even if the page has already rendered some content behind the guard.
  useEffect(() => {
    if (!loading && !user && !shown.current) {
      shown.current = true;
      toast.error('Authentication required', {
        description: message,
        duration: 8000,                 // Long enough for the user to notice and act
        action: {
          label: 'Sign In',
          onClick: () => router.push('/login'),
        },
      });
    }
  }, [user, loading, message, router]);

  // ── Loading State ──
  // Show a centered spinner while AuthContext performs the initial /auth/me check.
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // ── Unauthenticated State ──
  // Render a login-prompt card with a gentle visual hierarchy (gradient bar, lock icon, description).
  // Provides two clear CTAs: "Sign In to Continue" and "Back to Home".
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl overflow-hidden text-center">
          <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
          <CardHeader>
            <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-xl">Sign In Required</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/login" className="block">
              <Button className="w-full" size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Continue
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Authenticated State ──
  return <>{children}</>;
}
