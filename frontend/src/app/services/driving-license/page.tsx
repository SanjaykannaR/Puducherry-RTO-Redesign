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

// ── DrivingLicensePage: Application for a permanent driving license, after holding a Learner's
//     License for at least 30 days. Collects name, LL number, DOB, and desired vehicle type
//     (MCWG / MCWOG / LMV). On submit it suggests booking a driving test. ──
export default function DrivingLicensePage() {
  // ── Form State: LL number links back to existing learner record; vehicle type determines test ──
  const [form, setForm] = useState({ fullName: '', llNo: '', dob: '', vehicleType: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post<{ id: string }>('/applications', { type: 'DRIVING_LICENSE', formData: form });
      setSubmittedId(res.id);
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    }
  }

  // ── Success Confirmation: shows DL Application ID with a "Book Driving Test" CTA ──
  if (submitted) {
    return (
      <RequireAuth>
        <>
          <PageHero title="Application Submitted" subtitle="Your Permanent License application has been received" />
        <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
          <div className="max-w-2xl mx-auto px-4 py-12">
            <Card className="border-0 shadow-xl overflow-hidden"><div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3"><CheckCircle className="w-8 h-8 text-green-500" /></div>
                <CardTitle className="text-2xl text-green-700">Applied Successfully</CardTitle>
                <CardDescription>Schedule your driving test at the nearest RTO</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100"><p className="text-sm text-muted-foreground">Application ID</p><p className="font-semibold text-lg font-mono">RTO-{submittedId.toUpperCase()}</p></div>
                <Button className="w-full mt-4"><ArrowRight className="w-4 h-4 mr-2" />Book Driving Test</Button>
                <Button className="w-full mt-2" variant="outline" onClick={() => setSubmitted(false)}>Submit Another</Button>
              </CardContent>
            </Card>
          </div>
        </section>
        </>
      </RequireAuth>
    );
  }

  // ── Permanent DL Form: name, DOB, LL number (linked to existing record), vehicle type dropdown ──
  return (
    <RequireAuth>
      <>
        <PageHero title="Permanent Driving License" subtitle="Apply for a permanent driving license after completing your LL period" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="border-0 shadow-xl overflow-hidden"><div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
            <CardHeader>
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center"><FileText className="h-5 w-5 text-primary" /></div>
                <div><CardTitle>Permanent License Application</CardTitle><CardDescription>You must hold a valid Learner's License (30+ days old)</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label htmlFor="dl-name" className="block text-sm font-medium mb-1.5">Full Name</label><Input id="dl-name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required className="h-12 rounded-xl" /></div>
                  <div><label htmlFor="dl-dob" className="block text-sm font-medium mb-1.5">Date of Birth</label><Input id="dl-dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required className="h-12 rounded-xl" /></div>
                </div>
                <div><label htmlFor="dl-llno" className="block text-sm font-medium mb-1.5">Learner's License No.</label><Input id="dl-llno" value={form.llNo} onChange={(e) => setForm({ ...form, llNo: e.target.value })} required placeholder="e.g. PY-012025..." className="h-12 rounded-xl" /></div>
                <div><label className="block text-sm font-medium mb-1.5">Vehicle Type</label>
                  <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} required className="flex w-full h-12 rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select type</option>
                    <option value="MCWG">Motorcycle with Gear (MCWG)</option>
                    <option value="MCWOG">Motorcycle without Gear (MCWOG)</option>
                    <option value="LMV">Light Motor Vehicle (LMV)</option>
                  </select>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold"><ArrowRight className="w-4 h-4 mr-2" />Submit Application</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
      </>
    </RequireAuth>
  );
}
