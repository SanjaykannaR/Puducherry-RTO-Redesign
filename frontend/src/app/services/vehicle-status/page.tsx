'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Activity } from 'lucide-react';

export default function VehicleStatusPage() {
  const [regNo, setRegNo] = useState('');
  const [result, setResult] = useState<null | {
    registrationNo: string; make: string; model: string; year: number;
    insuranceUpto: string; fitnessUpto: string; taxPaidUpto: string; status: string;
  }>(null);

  function handleSearch() {
    if (!regNo.trim()) return;
    setResult({
      registrationNo: regNo,
      make: 'Honda',
      model: 'Activa 6G',
      year: 2024,
      insuranceUpto: '2027-03-15',
      fitnessUpto: '2029-03-15',
      taxPaidUpto: '2027-03-15',
      status: 'ACTIVE',
    });
  }

  function daysLeft(date: string): number {
    const diff = new Date(date).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Vehicle Lifecycle Status</h1>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter Registration No. (e.g. PY-01-AB-1234)"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
            />
            <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" />Search</Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{result.registrationNo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Make</span><p className="font-medium">{result.make}</p></div>
              <div><span className="text-muted-foreground">Model</span><p className="font-medium">{result.model}</p></div>
              <div><span className="text-muted-foreground">Year</span><p className="font-medium">{result.year}</p></div>
              <div><span className="text-muted-foreground">Status</span><p><Badge variant="default">{result.status}</Badge></p></div>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Lifecycle Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div><span className="font-medium">Insurance</span><p className="text-xs text-muted-foreground">Valid until {result.insuranceUpto}</p></div>
                  <Badge variant="secondary">{daysLeft(result.insuranceUpto)} days left</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div><span className="font-medium">Fitness</span><p className="text-xs text-muted-foreground">Valid until {result.fitnessUpto}</p></div>
                  <Badge variant="secondary">{daysLeft(result.fitnessUpto)} days left</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div><span className="font-medium">Road Tax</span><p className="text-xs text-muted-foreground">Paid until {result.taxPaidUpto}</p></div>
                  <Badge variant="secondary">{daysLeft(result.taxPaidUpto)} days left</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
