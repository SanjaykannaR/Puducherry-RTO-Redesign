'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car } from 'lucide-react';

const vehicles = [
  { regNo: 'PY-01-AB-1234', make: 'Honda', model: 'Activa 6G', year: 2024, status: 'ACTIVE', insurance: '2027-03-15' },
  { regNo: 'PY-01-CD-5678', make: 'Maruti', model: 'Swift VXi', year: 2023, status: 'ACTIVE', insurance: '2026-11-20' },
];

export default function VehiclesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Car className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">My Vehicles</h1>
      </div>
      <div className="space-y-4">
        {vehicles.map((v) => (
          <Card key={v.regNo}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{v.regNo}</CardTitle>
                <Badge>{v.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>{v.make} {v.model} ({v.year})</p>
              <p className="text-muted-foreground">Insurance valid until: {v.insurance}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
