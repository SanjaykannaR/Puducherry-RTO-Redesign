'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

const applications = [
  { id: 'RTO-A1B2C3', type: 'Vehicle Registration', status: 'UNDER_REVIEW', date: '2026-06-28' },
  { id: 'RTO-D4E5F6', type: 'Learner\'s License', status: 'APPROVED', date: '2026-06-15' },
  { id: 'RTO-G7H8I9', type: 'Duplicate RC', status: 'SUBMITTED', date: '2026-07-01' },
];

const statusColor: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_REVIEW: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function ApplicationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Search className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">My Applications</h1>
      </div>
      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{app.id}</CardTitle>
                <Badge className={statusColor[app.status]}>{app.status.replace('_', ' ')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Type:</span> {app.type}</p>
              <p><span className="text-muted-foreground">Date:</span> {app.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
