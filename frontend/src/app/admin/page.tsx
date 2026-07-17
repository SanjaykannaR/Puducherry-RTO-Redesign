'use client';

// ── Admin Dashboard — overview with stats, recent users, and quick actions ──
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, CalendarCheck, FileText, ClipboardList,
  UserPlus, Settings, BarChart3, DollarSign,
  Wrench, ArrowRight, Shield, Mail, Clock
} from 'lucide-react';
import { api } from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalAppointments: number;
  totalApplications: number;
  totalChallans: number;
}

interface RecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [statsData, usersData] = await Promise.all([
        api.get<AdminStats>('/admin/stats'),
        api.get<{ users: RecentUser[] }>('/admin/users'),
      ]);
      setStats(statsData);
      // Show last 5 users (API returns all, we take the end of the list)
      setRecentUsers(usersData.users.slice(-5).reverse());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error) return <div className="text-red-500">Error: {error}</div>;

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Appointments', value: stats?.totalAppointments, icon: CalendarCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Applications', value: stats?.totalApplications, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Challans', value: stats?.totalChallans, icon: ClipboardList, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const quickActions = [
    { label: 'Manage Users', href: '/admin/users', icon: Users, color: 'text-blue-600' },
    { label: 'Review Applications', href: '/admin/applications', icon: FileText, color: 'text-amber-600' },
    { label: 'Edit Fares', href: '/admin/fares', icon: DollarSign, color: 'text-green-600' },
    { label: 'Edit Services', href: '/admin/services', icon: Wrench, color: 'text-amber-600' },
    { label: 'View Reports', href: '/admin/reports', icon: BarChart3, color: 'text-purple-600' },
    { label: 'Settings', href: '/admin/settings', icon: Settings, color: 'text-gray-600' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-xl sm:text-2xl font-bold text-primary">Dashboard</h1>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="transition-all hover:shadow-md hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-3xl font-bold">{(card.value ?? 0).toLocaleString('en-IN')}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Recent Users ── */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Users</CardTitle>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No users yet.</p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {u.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant={u.role === 'ADMIN' ? 'destructive' : 'secondary'} className="text-xs">
                      {u.role === 'ADMIN' ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Quick Actions ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-sm font-medium hover:bg-primary/5">
                    <Icon className={`h-4 w-4 ${action.color}`} />
                    {action.label}
                    <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
                  </Button>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── System Info ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-muted-foreground mb-1">Backend</p>
              <p className="font-medium">Express + Prisma</p>
              <p className="text-xs text-muted-foreground">Railway (production)</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-muted-foreground mb-1">Frontend</p>
              <p className="font-medium">Next.js 16</p>
              <p className="text-xs text-muted-foreground">Vercel (production)</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <p className="text-muted-foreground mb-1">AI Proctoring</p>
              <p className="font-medium">FastAPI + MediaPipe</p>
              <p className="text-xs text-muted-foreground">Railway (production)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
