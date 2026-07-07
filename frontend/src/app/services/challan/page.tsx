'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { ClipboardList, CheckCircle, AlertTriangle } from 'lucide-react';

const initialChallans = [
  { id: '1', vehicleNo: 'PY-01-AB-1234', offense: 'No parking', amount: 500, date: '2026-06-15', status: 'PENDING' },
  { id: '2', vehicleNo: 'PY-01-CD-5678', offense: 'Helmet not worn', amount: 1000, date: '2026-06-20', status: 'PAID' },
];

export default function ChallanPage() {
  const [challans, setChallans] = useState(initialChallans);

  function payChallan(id: string) {
    setChallans((prev) => prev.map((c) => c.id === id ? { ...c, status: 'PAID' } : c));
  }

  return (
    <RequireAuth>
      <>
        <PageHero title="Traffic Challans" subtitle="View and pay traffic violation challans online" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <FadeInSection>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Your Challans</CardTitle>
                    <p className="text-sm text-muted-foreground">Total pending: {challans.filter(c => c.status === 'PENDING').length}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Offense</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {challans.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.vehicleNo}</TableCell>
                        <TableCell>{c.offense}</TableCell>
                        <TableCell>{c.date}</TableCell>
                        <TableCell className="text-right font-medium">₹{c.amount}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            c.status === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {c.status === 'PAID' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {c.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {c.status === 'PENDING' && (
                            <Button size="sm" onClick={() => payChallan(c.id)} className="whitespace-nowrap">
                              Pay Now
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </FadeInSection>
        </div>
      </section>
      </>
    </RequireAuth>
  );
}
