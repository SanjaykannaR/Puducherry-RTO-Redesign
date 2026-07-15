'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import PaymentModal from '@/components/payment/PaymentModal';
import { ClipboardList, CheckCircle, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ChallanPage() {
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ challans: any[] }>('/challans');
        setChallans(res.challans);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function openPayment(challan: any) {
    setSelectedChallan(challan);
    setPaymentOpen(true);
  }

  function handlePaymentSuccess() {
    if (selectedChallan) {
      setChallans((prev) => prev.map((c) => c.id === selectedChallan.id ? { ...c, status: 'COMPLETED' } : c));
    }
    toast.success('Challan payment successful');
    setPaymentOpen(false);
    setSelectedChallan(null);
  }

  return (
    <RequireAuth>
      <>
        <PageHero title="Traffic Challans" subtitle="View and pay traffic violation challans online" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <FadeInSection>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Your Challans</CardTitle>
                    <p className="text-sm text-muted-foreground">Total pending: {challans.filter(c => c.status === 'PENDING').length}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Offense</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      ))
                    ) : challans.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No challans found</TableCell></TableRow>
                    ) : challans.map((c: any) => {
                      const isPaid = c.status === 'COMPLETED' || c.status === 'PAID';
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.vehicleNo || c.description}</TableCell>
                          <TableCell>{c.offense || c.description}</TableCell>
                          <TableCell>{c.date || c.createdAt?.split('T')[0]}</TableCell>
                          <TableCell className="text-right font-medium">₹{c.amount}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isPaid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {isPaid ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                              {c.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {!isPaid && (
                              <Button size="sm" onClick={() => openPayment(c)} className="whitespace-nowrap">
                                Pay Now
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </FadeInSection>
        </div>
      </section>

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={selectedChallan?.amount || 0}
        title="Pay Challan"
        description={`Challan for ${selectedChallan?.vehicleNo || selectedChallan?.description || ''}`}
        onSuccess={handlePaymentSuccess}
        onError={(err) => toast.error(err)}
      />
      </>
    </RequireAuth>
  );
}
