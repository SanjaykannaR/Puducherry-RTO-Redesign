'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { Car, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ── TransferOwnershipPage: Form to initiate vehicle ownership transfer from seller to buyer.
//     Captures both parties' names, the registration number, and the sale date.
//     Requires Form 29 & 30. Submission flow is placeholder — flips to a success card. ──
export default function TransferOwnershipPage() {
  // ── Form State: seller/buyer names, reg number, and date of sale — all needed for Form 29/30 ──
  const [form, setForm] = useState({ sellerName: '', buyerName: '', regNo: '', saleDate: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post<{ id: string }>('/applications', { type: 'TRANSFER_OWNERSHIP', formData: form });
      setSubmittedId(res.id);
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    }
  }

  // ── Success Confirmation: shows Reference ID after submission ──
  if (submitted) {
    return (
      <RequireAuth>
        <>
          <PageHero title="Transfer Initiated" subtitle="Your ownership transfer request has been received" />
        <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
          <div className="max-w-2xl mx-auto px-4 py-12">
            <FadeInSection>
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl text-green-700">Submitted Successfully</CardTitle>
                  <CardDescription>Transfer of ownership application is being processed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                    <p className="text-sm text-muted-foreground">Reference ID</p>
                    <p className="font-semibold text-lg font-mono">RTO-{submittedId.toUpperCase()}</p>
                  </div>
                  <Button className="w-full" onClick={() => setSubmitted(false)}>Submit Another</Button>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>
        </>
      </RequireAuth>
    );
  }

  // ── Transfer Form: captures seller/buyer names, reg number, and sale date for Form 29/30 ──
  return (
    <RequireAuth>
      <>
        <PageHero title="Transfer of Ownership" subtitle="Transfer vehicle ownership from seller to buyer" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <FadeInSection>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center"><Car className="h-5 w-5 text-primary" /></div>
                  <div><CardTitle>Transfer Vehicle Ownership</CardTitle><CardDescription>Fill in the details below</CardDescription></div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label htmlFor="to-seller" className="block text-sm font-medium mb-1.5">Seller Name</label><Input id="to-seller" value={form.sellerName} onChange={(e) => setForm({ ...form, sellerName: e.target.value })} required placeholder="Seller's full name" className="h-12 rounded-xl" /></div>
                    <div><label htmlFor="to-buyer" className="block text-sm font-medium mb-1.5">Buyer Name</label><Input id="to-buyer" value={form.buyerName} onChange={(e) => setForm({ ...form, buyerName: e.target.value })} required placeholder="Buyer's full name" className="h-12 rounded-xl" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label htmlFor="to-reg" className="block text-sm font-medium mb-1.5">Registration No.</label><Input id="to-reg" value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} required placeholder="e.g. PY-01-AB-1234" className="h-12 rounded-xl" /></div>
                    <div><label htmlFor="to-date" className="block text-sm font-medium mb-1.5">Sale Date</label><Input id="to-date" type="date" value={form.saleDate} onChange={(e) => setForm({ ...form, saleDate: e.target.value })} required className="h-12 rounded-xl" /></div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <p className="font-medium">Required: Form 29 & 30, sale letter, ID proofs of both parties</p>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold"><ArrowRight className="w-4 h-4 mr-2" />Submit Application</Button>
                </form>
              </CardContent>
            </Card>
          </FadeInSection>
        </div>
      </section>
      </>
    </RequireAuth>
  );
}
