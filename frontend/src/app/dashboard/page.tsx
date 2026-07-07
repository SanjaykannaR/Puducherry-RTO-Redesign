'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FadeInSection from '@/components/ui/fade-in-section';
import { Car, FileText, Calendar, Search, ClipboardList, Bell, ArrowRight, LogOut } from 'lucide-react';

const dashboardLinks = [
  { title: 'My Vehicles', href: '/dashboard/vehicles', desc: 'View registered vehicles', icon: Car, color: 'from-blue-400 to-blue-500' },
  { title: 'My Licenses', href: '/dashboard/licenses', desc: 'View driving licenses', icon: FileText, color: 'from-green-400 to-emerald-500' },
  { title: 'Appointments', href: '/services/appointment', desc: 'Book or view appointments', icon: Calendar, color: 'from-amber-400 to-amber-500' },
  { title: 'Applications', href: '/dashboard/applications', desc: 'Track your applications', icon: Search, color: 'from-purple-400 to-purple-500' },
  { title: 'Challans', href: '/services/challan', desc: 'View pending challans', icon: ClipboardList, color: 'from-red-400 to-rose-500' },
  { title: 'Notifications', href: '/dashboard/notifications', desc: 'View alerts and notices', icon: Bell, color: 'from-pink-400 to-pink-500' },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-blue-200 mt-1">Welcome, {user.name}</p>
            </div>
            <Link href="/login" onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium transition-all no-underline">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Link>
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
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
  );
}
