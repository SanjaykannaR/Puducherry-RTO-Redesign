'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { Car, CheckCircle, ArrowRight } from 'lucide-react';

export default function VehicleRegistrationPage() {
  const [form, setForm] = useState({
    make: '', model: '', year: '', fuelType: '', color: '', chassisNo: '', engineNo: '',
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <RequireAuth>
        <>
          <PageHero title="Application Submitted" subtitle="Your vehicle registration request has been received" />
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
                  <CardDescription>Your vehicle registration application is being processed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                    <p className="text-sm text-muted-foreground">Application ID</p>
                    <p className="font-semibold text-lg font-mono">RTO-{Date.now().toString(36).toUpperCase()}</p>
                  </div>
                  <Button className="w-full" onClick={() => setSubmitted(false)}>
                    <Car className="w-4 h-4 mr-2" />
                    Submit Another
                  </Button>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </section>
        </>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <>
        <PageHero title="Vehicle Registration" subtitle="Register your new vehicle with Puducherry RTO" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <FadeInSection>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>New Vehicle Registration</CardTitle>
                    <CardDescription>Fill in the details of your vehicle</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Make</label>
                      <Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required placeholder="e.g. Honda" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Model</label>
                      <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required placeholder="e.g. Activa 6G" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Year</label>
                      <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required placeholder="e.g. 2026" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Fuel Type</label>
                      <Input value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} required placeholder="e.g. Petrol" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Color</label>
                    <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} required placeholder="e.g. Red" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Chassis No.</label>
                      <Input value={form.chassisNo} onChange={(e) => setForm({ ...form, chassisNo: e.target.value })} required placeholder="17-character VIN" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Engine No.</label>
                      <Input value={form.engineNo} onChange={(e) => setForm({ ...form, engineNo: e.target.value })} required />
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <p className="font-medium">Required Documents:</p>
                    <ul className="mt-1 space-y-0.5 list-disc list-inside">
                      <li>Original invoice / sale letter from dealer</li>
                      <li>Form 20 (Application for registration)</li>
                      <li>Form 21 (Sale certificate)</li>
                      <li>Form 22 (Road worthiness certificate)</li>
                      <li>Insurance certificate</li>
                      <li>Address & ID proof</li>
                    </ul>
                  </div>
                  <Button type="submit" className="w-full">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Submit Application
                  </Button>
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
