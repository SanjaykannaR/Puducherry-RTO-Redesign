'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { Calculator, CheckCircle } from 'lucide-react';
import PaymentModal from '@/components/payment/PaymentModal';

// ── Fee-calculator Data: static catalog of services with their base fees.
//     Each entry has a unique ID, display label, and fee amount used for calculation.
//     Adding a new service here automatically makes it selectable in the UI. ──
const services = [
  { id: 'learners-license', label: "Learner's License", fee: 250 },
  { id: 'permanent-license-mcwg', label: 'Permanent License (MCWG)', fee: 500 },
  { id: 'permanent-license-lmv', label: 'Permanent License (LMV)', fee: 500 },
  { id: 'international-permit', label: 'International Permit', fee: 1000 },
  { id: 'license-renewal', label: 'License Renewal', fee: 400 },
  { id: 'new-registration-mc', label: 'New Registration (MC)', fee: 1500 },
  { id: 'new-registration-lmv', label: 'New Registration (LMV)', fee: 3000 },
  { id: 'transfer-ownership', label: 'Transfer of Ownership', fee: 500 },
  { id: 'duplicate-rc', label: 'Duplicate RC', fee: 300 },
// ── End of fee data ──
];

// ── FeeCalculatorPage: Two-panel layout — left side lists all services with checkboxes,
//     right side shows a real-time fee summary (subtotal + 18% GST + total).
//     Users tick the services they need and the total updates instantly. No submission needed;
//     this is purely an estimation tool. ──
export default function FeeCalculatorPage() {
  // ── Selected Services: array of service IDs, toggled on/off via checkbox ──
  const [selected, setSelected] = useState<string[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // ── toggle: adds or removes a service ID from the selection array ──
  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  // ── Derived totals: map selected IDs to fee data, then compute subtotal, 18% GST, and total ──
  const items = selected.map((id) => {
    const svc = services.find((s) => s.id === id)!;
    return { id, label: svc.label, fee: svc.fee };
  });
  const subtotal = items.reduce((sum, i) => sum + i.fee, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <RequireAuth>
      <>
        <PageHero title="Fee Calculator" subtitle="Calculate fees for various RTO services and permits" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── Left Panel: checkbox list of all services with their individual fees ── */}
            <FadeInSection>
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Select Services</CardTitle>
                      <CardDescription>Choose the services you need</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {services.map((s) => (
                      <label key={s.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors border border-transparent hover:border-primary/10">
                        <input
                          type="checkbox"
                          checked={selected.includes(s.id)}
                          onChange={() => toggle(s.id)}
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="flex-1 text-sm">{s.label}</span>
                        <span className="text-sm font-medium text-primary">₹{s.fee}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>

            {/* ── Right Panel: live fee summary table — shows line items, subtotal, 18% GST, total.
                 Empty state prompts user to select services first. ── */}
            <FadeInSection delay={100}>
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                      <Calculator className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Fee Summary</CardTitle>
                      <CardDescription>Estimated total charges</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Select services to calculate fees.</p>
                  ) : (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead className="text-right">Fee</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((i) => (
                            <TableRow key={i.id}>
                              <TableCell className="text-sm">{i.label}</TableCell>
                              <TableCell className="text-right">₹{i.fee}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="mt-4 space-y-1.5 text-sm border-t pt-4">
                        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span>₹{gst}</span></div>
                        <div className="flex justify-between font-bold text-base pt-2 border-t">
                          <span>Total</span><span className="text-primary">₹{total}</span>
                        </div>
                        <button
                          onClick={() => setPaymentOpen(true)}
                          className="w-full mt-4 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                          Pay ₹{total} Now
                        </button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </div>
      </section>

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        amount={total}
        title="Pay RTO Service Fees"
        description={`Payment for ${items.map(i => i.label).join(', ')}`}
        onSuccess={() => { setPaymentOpen(false); setSelected([]); }}
        onError={(err) => console.error(err)}
      />
      </>
    </RequireAuth>
  );
}
