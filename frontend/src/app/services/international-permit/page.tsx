'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ── InternationalPermitPage: Apply for an International Driving Permit (IDP) valid in 150+
//     countries under the UN Convention. Requires a valid Indian driving license and passport.
//     The "countries to visit" field helps the RTO determine which convention to apply. ──
export default function InternationalPermitPage() {
  // ── Form State: DL number ties to existing license record; passport + countries for the permit ──
  const [form, setForm] = useState({ licenseNo: '', fullName: '', passportNo: '', countries: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post<{ id: string }>('/applications', { type: 'INTERNATIONAL_PERMIT', formData: form });
      setSubmittedId(res.id);
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    }
  }

  // ── Success Confirmation: green card with Permit ID; mentions 3-5 day issuance window ──
  if (submitted) {
    return (
      <RequireAuth>
        <>
          <PageHero title="Permit Submitted" subtitle="Your International Driving Permit request has been received" />
        <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
          <div className="max-w-2xl mx-auto px-4 py-12">
            <Card className="border-0 shadow-xl overflow-hidden"><div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8 text-green-500" /></div>
                <CardTitle className="text-2xl text-green-700">Permit Initiated</CardTitle>
                <CardDescription>Your IDP will be issued within 3-5 working days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100"><p className="text-sm text-muted-foreground">Permit ID</p><p className="font-semibold text-lg font-mono">RTO-{submittedId.toUpperCase()}</p></div>
                <Button className="w-full mt-4" onClick={() => setSubmitted(false)}>Submit Another</Button>
              </CardContent>
            </Card>
          </div>
        </section>
        </>
      </RequireAuth>
    );
  }

  // ── IDP Application Form: DL number, name, passport, and target countries ──
  return (
    <RequireAuth>
      <>
        <PageHero title="International Driving Permit" subtitle="Apply for an IDP to drive abroad" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="border-0 shadow-xl overflow-hidden"><div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
            <CardHeader>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
                <div><CardTitle>International Driving Permit</CardTitle><CardDescription>Valid for 1 year from date of issue</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1.5">Full Name</label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
                  <div><label className="block text-sm font-medium mb-1.5">DL No.</label><Input value={form.licenseNo} onChange={(e) => setForm({ ...form, licenseNo: e.target.value })} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1.5">Passport No.</label><Input value={form.passportNo} onChange={(e) => setForm({ ...form, passportNo: e.target.value })} required /></div>
                  <div><label className="block text-sm font-medium mb-1.5">Countries to Visit</label><Input value={form.countries} onChange={(e) => setForm({ ...form, countries: e.target.value })} required placeholder="e.g. USA, Canada" /></div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  <p className="font-medium">Fee: ₹1,000. Valid in 150+ countries under UN Convention.</p>
                </div>
                <Button type="submit" className="w-full"><ArrowRight className="w-4 h-4 mr-2" />Submit Application</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
      </>
    </RequireAuth>
  );
}
