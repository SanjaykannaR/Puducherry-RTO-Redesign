'use client';

// ── Payment Success page ──
// Shown after a successful GRAS payment. Displays confirmation
// details and provides navigation to dashboard or payment history.

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import RequireAuth from '@/components/auth/RequireAuth';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, History } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const grn = searchParams.get('grn');
  const brn = searchParams.get('brn');

  return (
    <section className="max-w-xl mx-auto px-4 py-12">
      <FadeInSection>
        <Card className="border-green-200">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-700">Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Your payment has been successfully processed via GRAS. A confirmation has been sent to your registered email.
            </p>

            {(grn || brn) && (
              <div className="bg-muted p-3 rounded-lg space-y-1">
                {grn && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GRN</span>
                    <span className="font-mono">{grn}</span>
                  </div>
                )}
                {brn && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">BRN</span>
                    <span className="font-mono">{brn}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services/payment-history" className="flex-1">
                <Button variant="outline" className="w-full">
                  <History className="mr-2 h-4 w-4" /> Payment History
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </FadeInSection>
    </section>
  );
}

export default function PaymentSuccessPage() {
  return (
    <RequireAuth>
      <PageHero title="Payment Successful" subtitle="Your payment has been processed" />
      <Suspense fallback={<div className="max-w-xl mx-auto px-4 py-12 text-center text-muted-foreground">Loading...</div>}>
        <PaymentSuccessContent />
      </Suspense>
    </RequireAuth>
  );
}
