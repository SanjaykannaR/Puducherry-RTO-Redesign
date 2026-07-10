'use client';

import { useState, useEffect } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import FadeInSection from '@/components/ui/fade-in-section';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const statusColor: Record<string, string> = {
  SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ applications: any[] }>('/applications')
      .then(res => setApplications(res.applications))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <RequireAuth>
      <>
        {/* ── Hero banner ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]">
        <div className="relative mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold text-white">My Applications</h1>
          <p className="text-blue-200 mt-1">Track your submitted applications</p>
        </div>
      </section>
        {/* ── Application list ── */}
        {/* Each application is a card with a monospace ID (easy to copy for reference),
            a colour-coded status badge, and a two-column breakdown of type + submission date.
            The gradient bar and hover shadow match the pattern used across other dashboard pages. */}
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No applications found</div>
            ) : applications.map((app, i) => (
              <FadeInSection key={app.id} delay={i * 100}>
                <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-bold text-primary font-mono">{app.id}</h2>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColor[app.status] || 'bg-gray-50 border-gray-200'}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-medium">{app.type}</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{app.createdAt?.split('T')[0] || app.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
      </>
    </RequireAuth>
  );
}
