'use client';

// ── Dashboard home ──
// Shows a welcome header with summary stats, quick-link cards, and a
// round notification bell (top-right) that opens an inline dropdown.

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { api } from '@/lib/api';
import { Car, FileText, Calendar, Search, ClipboardList, Bell, ArrowRight, LogOut, AlertTriangle, User, AlertTriangle as AlertIcon, Info, CheckCheck, Mail, MailOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

// ── Dashboard service links ──
// Notifications removed from here — it lives as an inline bell icon in the hero.
const dashboardLinks = [
  { title: 'My Vehicles', href: '/dashboard/vehicles', desc: 'View registered vehicles', icon: Car, color: 'from-blue-400 to-blue-500' },
  { title: 'My Licenses', href: '/dashboard/licenses', desc: 'View driving licenses', icon: FileText, color: 'from-green-400 to-emerald-500' },
  { title: 'Appointments', href: '/services/appointment', desc: 'Book or view appointments', icon: Calendar, color: 'from-amber-400 to-amber-500' },
  { title: 'Applications', href: '/dashboard/applications', desc: 'Track your applications', icon: Search, color: 'from-purple-400 to-purple-500' },
  { title: 'Challans', href: '/services/challan', desc: 'View pending challans', icon: ClipboardList, color: 'from-red-400 to-rose-500' },
];

// ── Type-specific icon + dot colour for notifications ──
const notifConfig: Record<string, { icon: React.ReactNode; dot: string }> = {
  WARNING: { icon: <AlertIcon className="h-4 w-4 text-amber-500" />, dot: 'bg-amber-500' },
  ALERT:   { icon: <AlertIcon className="h-4 w-4 text-red-500" />,    dot: 'bg-red-500' },
  INFO:    { icon: <Info className="h-4 w-4 text-blue-500" />,        dot: 'bg-blue-500' },
};

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

  // ── Notification bell state ──
  const [notifs, setNotifs] = useState<any[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(true);
  const [bellOpen, setBellOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter(n => !n.isRead).length;

  // ── Redirect to login if not authenticated ──
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // ── Fetch summary + notifications on mount ──
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
        if (notifsRes.status === 'fulfilled') setNotifs(notifsRes.value.notifications);
      } catch {
        // Silently fail
      } finally {
        setSummaryLoading(false);
        setNotifsLoading(false);
      }
    }
    loadSummary();
  }, [user]);

  // ── Click-outside to close bell dropdown ──
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
        setExpanded(null);
      }
    }
    if (bellOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [bellOpen]);

  // ── Notification actions ──
  async function markRead(id: string) {
    setMarking(id);
    try { await api.patch(`/notifications/${id}/read`, {}); setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n)); } catch {}
    finally { setMarking(null); }
  }

  function toggleExpand(id: string) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    const n = notifs.find(x => x.id === id);
    if (n && !n.isRead) markRead(id);
  }

  async function markAllRead() {
    const ids = notifs.filter(n => !n.isRead).map(n => n.id);
    if (!ids.length) return;
    await Promise.allSettled(ids.map(id => api.patch(`/notifications/${id}/read`, {})));
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success(`Marked ${ids.length} notification${ids.length > 1 ? 's' : ''} as read`);
  }

  if (loading || !user) return null;

  const summaryCards = [
    { label: 'Pending Challans', value: summary.pendingChallans, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Active Applications', value: summary.activeApplications, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Unread Notifications', value: summary.unreadNotifications, icon: Bell, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <RequireAuth>
      <>
        {/* ── Hero banner ── */}
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">My Dashboard</h1>
                  <p className="text-blue-200 text-sm mt-0.5">{user.email} &middot; {user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* ── Round notification bell icon ── */}
                <div ref={bellRef} className="relative">
                  <button
                    onClick={() => setBellOpen(prev => !prev)}
                    className="relative w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 border-2 border-white/25 flex items-center justify-center transition-all"
                    title="Notifications"
                  >
                    <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-amber-300' : 'text-white'}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* ── Bell dropdown panel ── */}
                  {bellOpen && (
                    <div className="absolute right-0 mt-3 w-[380px] max-w-[90vw] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <span className="text-sm font-semibold text-gray-700">
                          {notifsLoading ? 'Loading...' : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                        </span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                        {notifsLoading ? (
                          <div className="text-center text-muted-foreground py-8 text-sm">Loading...</div>
                        ) : notifs.length === 0 ? (
                          <div className="text-center text-muted-foreground py-8 text-sm">No notifications yet</div>
                        ) : notifs.map(n => {
                          const cfg = notifConfig[n.type] || notifConfig.INFO;
                          return (
                            <div key={n.id}>
                              <button onClick={() => toggleExpand(n.id)} className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${n.isRead ? 'opacity-60' : ''}`}>
                                <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">{cfg.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    {!n.isRead && <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />}
                                    <h3 className={`text-sm truncate ${n.isRead ? 'font-normal' : 'font-semibold'}`}>{n.title}</h3>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">{n.createdAt?.split('T')[0] || n.date}</p>
                                  {expanded === n.id && n.message && (
                                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg p-2.5 whitespace-pre-wrap">{n.message}</p>
                                  )}
                                </div>
                                <div className="shrink-0 mt-1">
                                  {expanded === n.id ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Sign Out button ── */}
                <button
                  onClick={() => { logout(); router.push('/'); }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium transition-all no-underline"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`${card.bg} backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 flex items-center gap-3`}>
                    <div className={`${card.color} p-2 rounded-lg bg-white/80`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">{card.label}</p>
                      <p className="text-xl font-bold text-gray-900">
                        {summaryLoading ? '...' : card.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Quick-link cards ── */}
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
