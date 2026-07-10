'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { api } from '@/lib/api';
import { Car, FileText, Calendar, Search, ClipboardList, Bell, ArrowRight, LogOut, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

const dashboardLinks = [
  { title: 'My Vehicles', href: '/dashboard/vehicles', desc: 'View registered vehicles', icon: Car, color: 'from-blue-400 to-blue-500' },
  { title: 'My Licenses', href: '/dashboard/licenses', desc: 'View driving licenses', icon: FileText, color: 'from-green-400 to-emerald-500' },
  { title: 'Appointments', href: '/services/appointment', desc: 'Book or view appointments', icon: Calendar, color: 'from-amber-400 to-amber-500' },
  { title: 'Applications', href: '/dashboard/applications', desc: 'Track your applications', icon: Search, color: 'from-purple-400 to-purple-500' },
  { title: 'Challans', href: '/services/challan', desc: 'View pending challans', icon: ClipboardList, color: 'from-red-400 to-rose-500' },
  { title: 'Notifications', href: '/dashboard/notifications', desc: 'View alerts and notices', icon: Bell, color: 'from-pink-400 to-pink-500' },
];

interface Summary {
  pendingChallans: number;
  upcomingAppointments: number;
  activeApplications: number;
  unreadNotifications: number;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<Summary>({ pendingChallans: 0, upcomingAppointments: 0, activeApplications: 0, unreadNotifications: 0 });
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    async function loadSummary() {
      try {
        const [challansRes, appsRes, notifsRes] = await Promise.allSettled([
          api.get<{ challans: any[] }>('/challans'),
          api.get<{ applications: any[] }>('/applications'),
          api.get<{ notifications: any[] }>('/notifications'),
        ]);
        setSummary({
          pendingChallans: challansRes.status === 'fulfilled' ? challansRes.value.challans.filter((c: any) => c.status === 'PENDING').length : 0,
          upcomingAppointments: 0,
          activeApplications: appsRes.status === 'fulfilled' ? appsRes.value.applications.filter((a: any) => a.status !== 'APPROVED' && a.status !== 'REJECTED').length : 0,
          unreadNotifications: notifsRes.status === 'fulfilled' ? notifsRes.value.notifications.filter((n: any) => !n.isRead).length : 0,
        });
      } catch {
        // Silently fail — summary just shows zeros
      } finally {
        setSummaryLoading(false);
      }
    }
    loadSummary();
  }, [user]);

  if (loading || !user) return null;

  const summaryCards = [
    { label: 'Pending Challans', value: summary.pendingChallans, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Active Applications', value: summary.activeApplications, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Unread Notifications', value: summary.unreadNotifications, icon: Bell, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <RequireAuth>
      <>
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]">
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
          <div className="relative mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center border-2 border-white/25">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, {user.name}</h1>
                  <p className="text-blue-200 text-sm mt-0.5">{user.email} &middot; {user.role}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium transition-all no-underline"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`${card.bg} backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 flex items-center gap-3`}>
                    <div className={`${card.color} p-2 rounded-lg bg-white/80`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/70">{card.label}</p>
                      <p className="text-xl font-bold text-white">
                        {summaryLoading ? '...' : card.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-gray-50 to-white">
          <div className="mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <FadeInSection key={link.title} delay={i * 80}>
                    <Link href={link.href} className="no-underline group block">
                      <Card className="h-full border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                        <div className={`h-2 bg-gradient-to-r ${link.color}`} />
                        <CardHeader>
                          <div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-2 transition-colors">
                            <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors">{link.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>{link.desc}</CardDescription>
                        </CardContent>
                        <div className="px-6 pb-4 flex items-center gap-1 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Access <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </Card>
                    </Link>
                  </FadeInSection>
                );
              })}
            </div>
          </div>
        </section>
      </>
    </RequireAuth>
  );
}
