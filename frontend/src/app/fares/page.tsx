import type { Metadata } from 'next';
// ── shadcn/ui Table component for clean tabular fee display ──
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';

export const metadata: Metadata = {
  title: 'Fees & Fares',
  description: 'Puducherry RTO fee structure for driving license, vehicle registration, permits, and taxes.',
};

// ── Fee categories ──
// Each category groups related services together so users can find pricing for
// their specific transaction (license, registration, permit, tax) in one place.
// Fees are in INR and formatted with Indian numbering (toLocaleString('en-IN')).
const feeCategories = [
  {
    title: 'Driving License Fees',
    items: [
      { type: "Learner's License Application", fee: 200 },
      { type: "Learner's License Test", fee: 50 },
      { type: 'Permanent License (MCWG)', fee: 500 },
      { type: 'Permanent License (LMV)', fee: 500 },
      { type: 'International Driving Permit', fee: 1000 },
      { type: 'License Renewal', fee: 400 },
      { type: 'Duplicate License', fee: 300 },
    ],
  },
  {
    title: 'Vehicle Registration Fees',
    items: [
      { type: 'New Registration (Motorcycle)', fee: 1500 },
      { type: 'New Registration (LMV)', fee: 3000 },
      { type: 'New Registration (Commercial)', fee: 5000 },
      { type: 'Transfer of Ownership', fee: 500 },
      { type: 'Duplicate RC', fee: 300 },
      { type: 'Hypothecation Termination', fee: 200 },
    ],
  },
  {
    title: 'Permit Fees',
    items: [
      { type: 'National Permit (Goods)', fee: 5000 },
      { type: 'National Permit (Passenger)', fee: 7500 },
      { type: 'State Permit', fee: 2000 },
      { type: 'Tourist Permit', fee: 3000 },
    ],
  },
  {
    title: 'Road Tax',
    items: [
      { type: 'One-time Tax (MC < 15 HP)', fee: 500 },
      { type: 'One-time Tax (MC 15-25 HP)', fee: 1000 },
      { type: 'One-time Tax (MC > 25 HP)', fee: 2000 },
      { type: 'Quarterly Tax (Commercial)', fee: 1500 },
    ],
  },
];

export default function FaresPage() {
  return (
    <>
      <PageHero title="Fees & Fares" subtitle="Official fee structure for RTO services in Puducherry. Fees are subject to change as per government notifications." />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="space-y-8">
            {feeCategories.map((cat, i) => (
              <FadeInSection key={i} delay={i * 100}>
                {/* ── Fee table card ── */}
                {/* Each category is wrapped in a card with a gradient bar. Inside, a two-column
                    table lists every service type and its fee, right-aligned for easy number comparison.
                    Using Indian locale formatting (toLocaleString('en-IN')) ensures ₹ amounts
                    display with the correct comma grouping (e.g. 7,500). */}
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                  <CardHeader>
                    <CardTitle>{cat.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service Type</TableHead>
                          <TableHead className="text-right w-32">Fee (₹)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cat.items.map((item, j) => (
                          <TableRow key={j}>
                            <TableCell>{item.type}</TableCell>
                            <TableCell className="text-right font-medium">
                              ₹{item.fee.toLocaleString('en-IN')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </FadeInSection>
            ))}
          </div>
          {/* ── Disclaimer ── */}
          {/* Government fees change periodically; a disclaimer sets expectations and
              directs users to verify current rates at their local office. */}
          <FadeInSection delay={400}>
            <p className="text-xs text-muted-foreground mt-8 border-t pt-4">
              Note: These fees are indicative. Please verify current rates at your nearest RTO office or check official government notifications. Additional service charges and GST may apply where applicable.
            </p>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
