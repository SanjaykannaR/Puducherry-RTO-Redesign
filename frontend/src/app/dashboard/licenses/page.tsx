'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

const licenses = [
  { no: 'PY-0120241234567', type: 'MCWG', name: 'Learner\'s License', issueDate: '2025-01-15', expiryDate: '2026-01-14', status: 'EXPIRED' },
  { no: 'PY-0120252345678', type: 'MCWG', name: 'Permanent License', issueDate: '2026-03-20', expiryDate: '2036-03-19', status: 'ACTIVE' },
];

export default function LicensesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">My Licenses</h1>
      </div>
      <div className="space-y-4">
        {licenses.map((l) => (
          <Card key={l.no}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{l.type}</CardTitle>
                <Badge variant={l.status === 'ACTIVE' ? 'default' : 'destructive'}>{l.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><span className="text-muted-foreground">License No:</span> {l.no}</p>
              <p><span className="text-muted-foreground">Type:</span> {l.name}</p>
              <p><span className="text-muted-foreground">Valid:</span> {l.issueDate} to {l.expiryDate}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
