'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, AlertTriangle, Info } from 'lucide-react';

const initialNotifs = [
  { id: '1', title: 'Insurance Expiring Soon', message: 'Your vehicle PY-01-AB-1234 insurance expires in 15 days.', type: 'WARNING', isRead: false, date: '2026-07-01' },
  { id: '2', title: 'License Renewal Due', message: 'Your driving license expires on 2026-09-15. Please renew.', type: 'INFO', isRead: false, date: '2026-06-28' },
  { id: '3', title: 'PUC Expired', message: 'Your PUC certificate has expired. Get a fresh PUC test.', type: 'ALERT', isRead: true, date: '2026-06-15' },
];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(initialNotifs);

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }

  const typeIcon: Record<string, React.ReactNode> = {
    WARNING: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    ALERT: <AlertTriangle className="h-5 w-5 text-destructive" />,
    INFO: <Info className="h-5 w-5 text-primary" />,
  };

  const typeColor: Record<string, string> = {
    WARNING: 'bg-amber-100 text-amber-700',
    ALERT: 'bg-red-100 text-red-700',
    INFO: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Notifications</h1>
      </div>

      <div className="space-y-4">
        {notifs.map((n) => (
          <Card key={n.id} className={n.isRead ? 'opacity-70' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {typeIcon[n.type]}
                  <div>
                    <CardTitle className="text-base">{n.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{n.date}</p>
                  </div>
                </div>
                <Badge className={typeColor[n.type]}>{n.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{n.message}</p>
              {!n.isRead && (
                <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>
                  Mark Read
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
