'use client';

// ── Payment History page ──
// Shows all past payments (GRAS + challan) for the authenticated user.
// Status badges: COMPLETED (green), PENDING (yellow), FAILED (red).

import { useState, useEffect } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Payment {
  id: string;
  amount: number;
  transactionId: string;
  gatewayRefNo: string | null;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
};

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ payments: Payment[] }>('/payments/history')
      .then((data) => setPayments(data.payments))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <RequireAuth>
      <PageHero title="Payment History" subtitle="View all your past and pending payments" />
      <section className="max-w-4xl mx-auto px-4 py-12">
        <FadeInSection>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No payments yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Transaction ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{new Date(p.createdAt).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell className="font-medium">₹{p.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Badge className={statusColor[p.status] || ''}>{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {p.transactionId}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </FadeInSection>
      </section>
    </RequireAuth>
  );
}
