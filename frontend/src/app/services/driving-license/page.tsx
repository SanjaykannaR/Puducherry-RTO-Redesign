'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import { FileText, CheckCircle, ArrowRight } from 'lucide-react';

export default function DrivingLicensePage() {
  const [form, setForm] = useState({ fullName: '', llNo: '', dob: '', vehicleType: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) { e.preventDefault(); setSubmitted(true); }

  if (submitted) {
    return (
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
                <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100"><p className="text-sm text-muted-foreground">Application ID</p><p className="font-semibold text-lg font-mono">RTO-DL-{Date.now().toString(36).toUpperCase()}</p></div>
                <Button className="w-full mt-4"><ArrowRight className="w-4 h-4 mr-2" />Book Driving Test</Button>
                <Button className="w-full mt-2" variant="outline" onClick={() => setSubmitted(false)}>Submit Another</Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </>
    );
  }

  return (
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
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1.5">Full Name</label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></div>
                  <div><label className="block text-sm font-medium mb-1.5">Date of Birth</label><Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required /></div>
                </div>
                <div><label className="block text-sm font-medium mb-1.5">Learner's License No.</label><Input value={form.llNo} onChange={(e) => setForm({ ...form, llNo: e.target.value })} required placeholder="e.g. PY-012025..." /></div>
                <div><label className="block text-sm font-medium mb-1.5">Vehicle Type</label>
                  <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} required className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select type</option>
                    <option value="MCWG">Motorcycle with Gear (MCWG)</option>
                    <option value="MCWOG">Motorcycle without Gear (MCWOG)</option>
                    <option value="LMV">Light Motor Vehicle (LMV)</option>
                  </select>
                </div>
                <Button type="submit" className="w-full"><ArrowRight className="w-4 h-4 mr-2" />Submit Application</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
