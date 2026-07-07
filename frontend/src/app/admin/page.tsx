'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, CalendarCheck, FileText, ClipboardList } from 'lucide-react';
import { api } from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalAppointments: number;
  totalApplications: number;
  totalChallans: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AdminStats>('/admin/stats')
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <div className="text-red-500">Error: {error}</div>;

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers, icon: Users },
    { title: 'Total Appointments', value: stats?.totalAppointments, icon: CalendarCheck },
    { title: 'Total Applications', value: stats?.totalApplications, icon: FileText },
    { title: 'Total Challans', value: stats?.totalChallans, icon: ClipboardList },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="transition-all hover:shadow-md hover:border-primary/30"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold">
                    {(card.value ?? 0).toLocaleString('en-IN')}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
