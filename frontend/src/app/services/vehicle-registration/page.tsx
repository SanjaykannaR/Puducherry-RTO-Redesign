'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Application Submitted</CardTitle>
            <CardDescription>Your vehicle registration request has been received.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Application ID: RTO-{Date.now().toString(36).toUpperCase()}</p>
            <Button className="mt-4" onClick={() => setSubmitted(false)}>Submit Another</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">Vehicle Registration</h1>
      <Card>
        <CardHeader>
          <CardTitle>New Vehicle Registration</CardTitle>
          <CardDescription>Fill in the details of your vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Make</label>
                <Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fuel Type</label>
                <Input value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chassis No.</label>
                <Input value={form.chassisNo} onChange={(e) => setForm({ ...form, chassisNo: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Engine No.</label>
                <Input value={form.engineNo} onChange={(e) => setForm({ ...form, engineNo: e.target.value })} required />
              </div>
            </div>
            <Button type="submit" className="w-full">Submit Application</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
