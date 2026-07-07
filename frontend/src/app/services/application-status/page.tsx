'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function ApplicationStatusPage() {
  const [appId, setAppId] = useState('');
  const [status, setStatus] = useState<null | { id: string; type: string; status: string; date: string }>(null);

  function handleSearch() {
    if (!appId.trim()) return;
    setStatus({
      id: appId,
      type: 'Vehicle Registration',
      status: 'UNDER_REVIEW',
      date: '2026-06-28',
    });
  }

  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
    UNDER_REVIEW: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-6">Application Status</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Track Your Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Enter Application ID"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
            />
            <Button onClick={handleSearch}><Search className="h-4 w-4 mr-2" />Search</Button>
          </div>
        </CardContent>
      </Card>

      {status && (
        <Card>
          <CardHeader>
            <CardTitle>Application #{status.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{status.type}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{status.date}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <span className={`px-3 py-1 rounded text-sm font-medium ${statusColor[status.status]}`}>
                {status.status.replace('_', ' ')}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
