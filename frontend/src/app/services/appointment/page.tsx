'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AppointmentPage() {
  const [form, setForm] = useState({ date: '', timeSlot: '', purpose: '' });
  const [submitted, setSubmitted] = useState(false);

  const timeSlots = ['10:00-10:30', '10:30-11:00', '11:00-11:30', '12:00-12:30', '14:00-14:30', '15:00-15:30'];
  const purposes = ['Driving Test', 'License Renewal', 'Vehicle Inspection', 'Document Verification', 'General Inquiry'];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Booked</CardTitle>
            <CardDescription>Your appointment has been scheduled.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm"><strong>Date:</strong> {form.date}</p>
            <p className="text-sm"><strong>Time:</strong> {form.timeSlot}</p>
            <p className="text-sm"><strong>Purpose:</strong> {form.purpose}</p>
            <Button className="mt-4" onClick={() => setSubmitted(false)}>Book Another</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">Book Appointment</h1>
      <Card>
        <CardHeader>
          <CardTitle>Schedule Your Visit</CardTitle>
          <CardDescription>Choose a date, time, and purpose</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time Slot</label>
              <select
                value={form.timeSlot}
                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                required
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              >
                <option value="">Select a slot</option>
                {timeSlots.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purpose</label>
              <select
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                required
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              >
                <option value="">Select purpose</option>
                {purposes.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Button type="submit" className="w-full">Book Appointment</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
