'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { Calendar, Clock, ClipboardCheck, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import PaymentModal from '@/components/payment/PaymentModal';

// ── AppointmentPage: 2-step stepper for booking an RTO appointment.
//     Step 1 picks date + time slot; Step 2 picks purpose and shows document checklist.
//     Uses conditional rendering (step === 1 vs step === 2) to toggle form sections.
//     On submit, switches to a success confirmation view. ──
export default function AppointmentPage() {
  // ── Form State: tracks date, time slot, purpose across both steps ──
  const [form, setForm] = useState({ date: '', timeSlot: '', purpose: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [step, setStep] = useState(1);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const APPOINTMENT_FEE = 100; // ₹100 booking fee

  // ── Static options for dropdowns, kept here so the form fields are easy to modify ──
  const timeSlots = ['10:00-10:30', '10:30-11:00', '11:00-11:30', '12:00-12:30', '14:00-14:30', '15:00-15:30'];
  const purposes = ['Driving Test', 'License Renewal', 'Vehicle Inspection', 'Document Verification', 'General Inquiry'];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post<{ id: string }>('/appointments', { date: form.date, timeSlot: form.timeSlot, purpose: form.purpose });
      setSubmittedId(res.id);
      // Open payment modal — appointment is created but not confirmed until payment
      setPaymentOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Booking failed');
    }
  }

  // ── Success View: shown after submission. Displays the confirmed date, time, and purpose
  //     in a green-tinted card with a "Book Another" button that resets the form + step. ──
  if (submitted) {
    return (
      <RequireAuth>
        <>
          <PageHero title="Appointment Booked" subtitle="Your appointment has been scheduled successfully" />
        <section className="py-12" style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
          <div className="max-w-2xl mx-auto px-4">
            <FadeInSection>
              <Card className="overflow-hidden border-0 shadow-xl">
                <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl text-green-700">Confirmed!</CardTitle>
                  <CardDescription>Your appointment details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50/50 rounded-xl p-5 space-y-3 border border-blue-100">
                    <p className="text-xs text-muted-foreground">Booking ID: {submittedId}</p>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-semibold">{form.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-semibold">{form.timeSlot}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Purpose</p>
                        <p className="font-semibold">{form.purpose}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <p className="font-medium">Please arrive 15 minutes before your slot with original documents.</p>
                  </div>
                  <Button className="w-full" onClick={() => { setSubmitted(false); setStep(1); }}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Another Appointment
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

  // ── Booking Form View: shown before submission. Two-column layout — left is the 2-step form,
  //     right has sidebar cards with office hours and tips. ──
  return (
    <RequireAuth>
      <>
        <PageHero title="Book Appointment" subtitle="Schedule your RTO visit for driving tests, license services, vehicle inspection, and inquiries">
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-xs rounded-full px-3 py-1 border border-white/10">
            <Clock className="w-3 h-3" />
            Fast & Easy Booking
          </span>
          <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white/80 text-xs rounded-full px-3 py-1 border border-white/10">
            <ClipboardCheck className="w-3 h-3" />
            No Queue Required
          </span>
        </div>
      </PageHero>

      <section className="py-12" style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ── Main Form Column (2/3 width): contains the 2-step stepper card ── */}
            <div className="md:col-span-2">
              <FadeInSection>
                <Card className="overflow-hidden border-0 shadow-xl">
                  <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Schedule Your Visit</CardTitle>
                        <CardDescription>Fill in the details below</CardDescription>
                      </div>
                      {/* ── Step Indicator: circles 1 and 2 with a connecting line.
                           Filled primary = completed or current step ── */}
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-muted'}`}>1</span>
                        <span className="w-6 h-px bg-border" />
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-muted'}`}>2</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* ── Step 1: Date & Time Slot selection. "Continue" advances to step 2 ── */}
                      {step === 1 && (
                        <FadeInSection>
                          <div className="space-y-5">
                            <div>
                              <label className="block text-sm font-medium mb-1.5">Select Date</label>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                                  className="pl-10" required />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1.5">Time Slot</label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                                <select
                                  value={form.timeSlot}
                                  onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                                  required
                                  className="flex w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  <option value="">Select a time slot</option>
                                  {timeSlots.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                            </div>
                            <Button type="button" className="w-full" onClick={() => setStep(2)}>
                              Continue
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </FadeInSection>
                      )}
                      {/* ── Step 2: Purpose selection + required documents note.
                           "Back" returns to step 1; "Book Appointment" submits. ── */}
                      {step === 2 && (
                        <FadeInSection>
                          <div className="space-y-5">
                            <div>
                              <label className="block text-sm font-medium mb-1.5">Purpose of Visit</label>
                              <div className="relative">
                                <ClipboardCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                                <select
                                  value={form.purpose}
                                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                                  required
                                  className="flex w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                  <option value="">Select purpose</option>
                                  {purposes.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                              <p className="text-sm text-blue-800 font-medium">Required Documents</p>
                              <ul className="text-sm text-blue-600 mt-1 space-y-0.5 list-disc list-inside">
                                <li>Valid ID proof (Aadhaar / Voter ID / Passport)</li>
                                <li>Address proof</li>
                                <li>Passport size photographs (2 copies)</li>
                              </ul>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                              <p>Booking fee: <strong>₹{APPOINTMENT_FEE}</strong> (non-refundable)</p>
                            </div>
                            <div className="flex gap-3">
                              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                              </Button>
                              <Button type="submit" className="flex-1">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Book Appointment
                              </Button>
                            </div>
                          </div>
                        </FadeInSection>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </FadeInSection>
            </div>

            {/* ── Sidebar (1/3 width): office hours card and tips card for user convenience ── */}
            <div className="space-y-4">
              <FadeInSection delay={100}>
                <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Office Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Mon - Fri</span><span className="font-medium">9:00 AM - 5:00 PM</span></div>
                    <div className="flex justify-between"><span>Saturday</span><span className="font-medium">9:00 AM - 1:00 PM</span></div>
                    <div className="flex justify-between"><span>Sunday</span><span className="text-destructive font-medium">Closed</span></div>
                  </CardContent>
                </Card>
              </FadeInSection>

              <FadeInSection delay={200}>
                <Card className="border-0 shadow-md overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4 text-primary" />
                      Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>✓ Arrive 15 minutes early</p>
                    <p>✓ Carry original documents</p>
                    <p>✓ Avoid lunch hours (1-2 PM)</p>
                    <p>✓ Weekends are walk-in only</p>
                  </CardContent>
                </Card>
              </FadeInSection>
            </div>
          </div>
        </div>
      </section>
      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={APPOINTMENT_FEE}
        title="Appointment Booking Fee"
        description={`Booking: ${form.purpose} on ${form.date} at ${form.timeSlot}`}
        applicationId={submittedId}
        onSuccess={() => { setPaymentOpen(false); setSubmitted(true); }}
        onError={(err) => toast.error(err)}
      />
      </>
    </RequireAuth>
  );
}
