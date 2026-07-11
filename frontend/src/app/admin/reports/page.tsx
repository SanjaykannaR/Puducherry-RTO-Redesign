'use client';

// ── Admin Reports — visual charts + summary table ──
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, CalendarCheck, FileText, ClipboardList } from 'lucide-react';
import { api } from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';

interface AdminStats {
  totalUsers: number;
  totalAppointments: number;
  totalApplications: number;
  totalChallans: number;
}

const reportItems = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: '#3b82f6' },
  { key: 'totalAppointments', label: 'Total Appointments', icon: CalendarCheck, color: '#22c55e' },
  { key: 'totalApplications', label: 'Total Applications', icon: FileText, color: '#f59e0b' },
  { key: 'totalChallans', label: 'Total Challans', icon: ClipboardList, color: '#ef4444' },
] as const;

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

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

  // ── Chart data ──
  const barData = reportItems.map((item) => ({
    name: item.label.replace('Total ', ''),
    value: stats ? stats[item.key as keyof AdminStats] : 0,
    fill: item.color,
  }));

  const pieData = reportItems
    .map((item) => ({
      name: item.label.replace('Total ', ''),
      value: stats ? stats[item.key as keyof AdminStats] : 0,
    }))
    .filter((d) => d.value > 0);  // Hide zero-value slices

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-primary">Reports</h1>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {reportItems.map((item) => {
          const Icon = item.icon;
          const value = stats ? stats[item.key as keyof AdminStats] : undefined;
          return (
            <Card key={item.key} className="transition-all hover:shadow-md hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Bar Chart ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* ── Pie Chart ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-72 w-full" />
            ) : pieData.length === 0 ? (
              <p className="text-muted-foreground text-center py-16">No data to display.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Summary Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Summary</CardTitle>
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
