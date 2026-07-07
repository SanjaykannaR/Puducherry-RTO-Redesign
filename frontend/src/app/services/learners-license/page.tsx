'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { FileText, CheckCircle, ArrowRight } from 'lucide-react';

export default function LearnersLicensePage() {
  const [form, setForm] = useState({ fullName: '', dob: '', address: '', mobile: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) { e.preventDefault(); setSubmitted(true); }

  if (submitted) {
    return (
      <RequireAuth>
        <>
          <PageHero title="Application Submitted" subtitle="Your Learner's License application has been received" />
        <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
          <div className="max-w-2xl mx-auto px-4 py-12">
            <Card className="border-0 shadow-xl overflow-hidden"><div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8 text-green-500" /></div>
                <CardTitle className="text-2xl text-green-700">Applied Successfully</CardTitle>
                <CardDescription>Appear for the LL test at your nearest RTO office</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100"><p className="text-sm text-muted-foreground">Application ID</p><p className="font-semibold text-lg font-mono">RTO-LL-{Date.now().toString(36).toUpperCase()}</p></div>
                <Button className="w-full mt-4" onClick={() => setSubmitted(false)}>Submit Another</Button>
              </CardContent>
            </Card>
          </div>
        </section>
        </>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <>
        <PageHero title="Learner's License" subtitle="Apply for a Learner's License to start your driving journey" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="border-0 shadow-xl overflow-hidden"><div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
            <CardHeader>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
                <div><CardTitle>Learner's License Application</CardTitle><CardDescription>Fill in your details</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1.5">Full Name</label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
                  <div><label className="block text-sm font-medium mb-1.5">Date of Birth</label><Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1.5">Address</label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required /></div>
                <div><label className="block text-sm font-medium mb-1.5">Mobile</label><Input type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required /></div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  <p className="font-medium">Eligibility: Minimum 16 years (MC 50cc) or 18 years (all others)</p>
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
