'use client';

// ── OAuth Callback (DigiLocker + Google) ──
// Both OAuth providers redirect here after the backend completes the flow.
// The backend puts the JWT + return URL in query params. We store the token
// in localStorage and redirect the user to their intended destination.

import { useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/api';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const refreshToken = searchParams.get('refreshToken');
  const returnUrl = searchParams.get('return') || '/';
  const error = searchParams.get('error');
  const handled = useRef(false); // Prevent double-fire in StrictMode

  useEffect(() => {
    if (handled.current) return; // StrictMode guard
    handled.current = true;

    // ── Handle OAuth errors ──
    if (error) {
      const detail = searchParams.get('detail') || '';
      const errorMessages: Record<string, string> = {
        invalid_state: 'Authentication failed: invalid security token. Please try again.',
        no_code: 'Authentication failed: no authorization code received.',
        token_exchange_failed: 'Authentication failed: could not exchange authorization code.',
        no_user_id: 'Authentication failed: no user ID from identity provider.',
        google_conflict: 'This Google account is already linked to another user.',
        google_error: 'Google authentication failed. Please try again.',
      };
      toast.error(errorMessages[error] || `Authentication failed: ${error}${detail ? ' — ' + detail : ''}`);
      return;
    }

    if (!token) return;

    // Store the JWT exactly like AuthContext.login() does
    localStorage.setItem('token', token);
    // Store refresh token for automatic token rotation (same as login/register)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    // ── Welcome toast + redirect ──
    // Fetch the user profile so we can show their name in the greeting.
    // We delay the redirect slightly so the toast has time to appear
    // before the page navigates away.
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const name = data?.user?.name?.split(' ')[0] || 'User';
        toast.success(`Welcome back, ${name}!`, {
          description: 'You have successfully signed in.',
          duration: 4000,
        });
      })
      .catch(() => {
        toast.success('Signed in successfully!');
      })
      .finally(() => {
        // Give the toast ~800ms to render before navigating away
        setTimeout(() => window.location.replace(returnUrl), 800);
      });
  }, [token, refreshToken, returnUrl, error, searchParams]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-destructive">!</span>
          </div>
          <h1 className="text-xl font-bold mb-2">Authentication Failed</h1>
          <p className="text-muted-foreground mb-4">No authentication token received from the identity provider.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-primary hover:underline font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-xl font-bold">Signing you in...</h1>
        <p className="text-muted-foreground mt-1">Completing authentication</p>
      </div>
    </div>
  );
}

export default function DigiLockerCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
