'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, FileText, Calendar, Search, ClipboardList, Bell } from 'lucide-react';

const dashboardLinks = [
  { title: 'My Vehicles', href: '/dashboard/vehicles', desc: 'View registered vehicles', icon: Car },
  { title: 'My Licenses', href: '/dashboard/licenses', desc: 'View driving licenses', icon: FileText },
  { title: 'Appointments', href: '/services/appointment', desc: 'Book or view appointments', icon: Calendar },
  { title: 'Applications', href: '/dashboard/applications', desc: 'Track your applications', icon: Search },
  { title: 'Challans', href: '/services/challan', desc: 'View pending challans', icon: ClipboardList },
  { title: 'Notifications', href: '/dashboard/notifications', desc: 'View alerts and notices', icon: Bell },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user.name}</p>
        </div>
        <Link href="/login" onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }} className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors no-underline">
            Sign Out
          </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.title} href={link.href} className="no-underline">
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 group cursor-pointer">
                <CardHeader>
                  <Icon className="h-8 w-8 text-primary group-hover:text-primary/80" />
                  <CardTitle className="group-hover:text-primary">{link.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{link.desc}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
