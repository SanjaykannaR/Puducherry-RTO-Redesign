'use client';

// ── DigiLocker OAuth Callback ──
// DigiLocker redirects here after the backend completes the OAuth flow.
// The backend puts the JWT + return URL in query params. We store the token
// in localStorage and redirect the user to their intended destination.

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const returnUrl = searchParams.get('return') || '/';

  useEffect(() => {
    if (!token) return;

    // Store the JWT exactly like AuthContext.login() does
    localStorage.setItem('token', token);
    // Redirect to the intended page (dashboard by default)
    window.location.replace(returnUrl);
  }, [token, returnUrl]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-destructive">!</span>
          </div>
          <h1 className="text-xl font-bold mb-2">Authentication Failed</h1>
          <p className="text-muted-foreground mb-4">No authentication token received from DigiLocker.</p>
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
        <p className="text-muted-foreground mt-1">Completing DigiLocker authentication</p>
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
