'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { FileText, CheckCircle, ArrowRight } from 'lucide-react';

// ── DuplicateRCPage: Request a replacement Registration Certificate when the original is lost,
//     damaged, or stolen. Captures reg number, owner name, and reason (LOST / DAMAGED / STOLEN)
//     so the RTO knows what documents (e.g. FIR copy) to require. ──
export default function DuplicateRCPage() {
  // ── Form State: vehicle reg number, owner name, and reason dropdown — drives doc requirements ──
  const [form, setForm] = useState({ regNo: '', fullName: '', reason: '' });
  // ── submitted: toggles to confirmation card showing a generated Request ID ──
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) { e.preventDefault(); setSubmitted(true); }

  // ── Success Confirmation: green card with Request ID; mentions 7-day processing window ──
  if (submitted) {
    return (
      <RequireAuth>
        <>
          <PageHero title="Request Submitted" subtitle="Your duplicate RC request has been received" />
        <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
          <div className="max-w-2xl mx-auto px-4 py-12">
            <Card className="border-0 shadow-xl overflow-hidden"><div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8 text-green-500" /></div>
                <CardTitle className="text-2xl text-green-700">Request Submitted</CardTitle>
                <CardDescription>Your duplicate RC will be processed within 7 working days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                  <p className="text-sm text-muted-foreground">Request ID</p>
                  <p className="font-semibold text-lg font-mono">RTO-DRC-{Date.now().toString(36).toUpperCase()}</p>
                </div>
                <Button className="w-full" onClick={() => setSubmitted(false)}>Submit Another</Button>
              </CardContent>
            </Card>
          </div>
        </section>
        </>
      </RequireAuth>
    );
  }

  // ── Duplicate RC Form: reg number, owner name, and reason dropdown (lost/damaged/stolen) ──
  return (
    <RequireAuth>
      <>
        <PageHero title="Duplicate RC" subtitle="Request a duplicate Registration Certificate if lost or damaged" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="border-0 shadow-xl overflow-hidden"><div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
            <CardHeader>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
                <div><CardTitle>Request Duplicate RC</CardTitle><CardDescription>Fill in the details</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1.5">Registration No.</label><Input value={form.regNo} onChange={(e) => setForm({ ...form, regNo: e.target.value })} required placeholder="e.g. PY-01-AB-1234" /></div>
                <div><label className="block text-sm font-medium mb-1.5">Full Name (as on RC)</label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
                <div><label className="block text-sm font-medium mb-1.5">Reason</label>
                  <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select reason</option>
                    <option value="LOST">Lost RC</option>
                    <option value="DAMAGED">Damaged RC</option>
                    <option value="STOLEN">Stolen RC</option>
                  </select>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  <p className="font-medium">Required: FIR copy (if stolen), ID proof, fee of ₹300</p>
                </div>
                <Button type="submit" className="w-full"><ArrowRight className="w-4 h-4 mr-2" />Submit Request</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
      </>
    </RequireAuth>
  );
}
