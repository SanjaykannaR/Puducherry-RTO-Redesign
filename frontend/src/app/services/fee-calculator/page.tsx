'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
];

export default function FeeCalculatorPage() {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  const items = selected.map((id) => {
    const svc = services.find((s) => s.id === id)!;
    return { id, label: svc.label, fee: svc.fee };
  });
  const subtotal = items.reduce((sum, i) => sum + i.fee, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">Fee Calculator</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Services</CardTitle>
            <CardDescription>Choose the services you need</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={() => toggle(s.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="flex-1 text-sm">{s.label}</span>
                  <span className="text-sm font-medium">₹{s.fee}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Summary</CardTitle>
            <CardDescription>Estimated total charges</CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Select services to calculate fees.</p>
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
                <div className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
                  <div className="flex justify-between"><span>GST (18%)</span><span>₹{gst}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-1">
                    <span>Total</span><span>₹{total}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
