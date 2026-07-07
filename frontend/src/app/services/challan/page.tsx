'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClipboardList } from 'lucide-react';

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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Traffic Challans</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Challans</CardTitle>
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
                  <TableCell>{c.vehicleNo}</TableCell>
                  <TableCell>{c.offense}</TableCell>
                  <TableCell>{c.date}</TableCell>
                  <TableCell className="text-right">₹{c.amount}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === 'PAID' ? 'secondary' : 'destructive'}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {c.status === 'PENDING' && (
                      <Button size="sm" onClick={() => payChallan(c.id)}>Pay Now</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
