'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, CalendarCheck, FileText, ClipboardList } from 'lucide-react';
import { api } from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalAppointments: number;
  totalApplications: number;
  totalChallans: number;
}

const reportItems = [
  { key: 'totalUsers', label: 'Total Users', icon: Users },
  { key: 'totalAppointments', label: 'Total Appointments', icon: CalendarCheck },
  { key: 'totalApplications', label: 'Total Applications', icon: FileText },
  { key: 'totalChallans', label: 'Total Challans', icon: ClipboardList },
] as const;

export default function AdminReports() {
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportItems.map((item) => {
          const Icon = item.icon;
          const value = stats ? stats[item.key as keyof AdminStats] : undefined;
          return (
            <Card
              key={item.key}
              className="transition-all hover:shadow-md hover:border-primary/30"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </CardTitle>
                <Icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <p className="text-4xl font-bold">{(value ?? 0).toLocaleString('en-IN')}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportItems.map((item) => {
                  const value = stats ? stats[item.key as keyof AdminStats] : 0;
                  return (
                    <TableRow key={item.key}>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell className="text-right font-mono text-lg">
                        {(value ?? 0).toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
