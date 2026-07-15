'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { Search, FileText, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ── ApplicationStatusPage: Track the real-time status of an RTO application by entering
//     its application ID. Shows type, submission date, and current status with colour-coded
//     badges (DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED / REJECTED).
//     Uses mock data; a real API would replace handleSearch. ──
export default function ApplicationStatusPage() {
  // ── Search Input ──
  const [appId, setAppId] = useState('');
  // ── Status Result: populated after search with id, type, status code, and date ──
  const [status, setStatus] = useState<null | { id: string; type: string; status: string; date: string }>(null);

  async function handleSearch() {
    if (!appId.trim()) return;
    try {
      const res = await api.get<{ id: string; type: string; status: string; createdAt: string }>(`/applications/${appId}`);
      setStatus({ id: res.id, type: res.type, status: res.status, date: res.createdAt.split('T')[0] });
    } catch (err: any) {
      toast.error(err.message || 'Application not found');
    }
  }

  // ── Status Colour Map: each pipeline status gets a distinct colour scheme so users
  //     can instantly gauge progress (amber = pending, green = approved, red = rejected) ──
  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
    SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
    UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-green-50 text-green-700 border-green-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <RequireAuth>
      <>
        <PageHero title="Application Status" subtitle="Track your RTO application status in real-time" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* ── Search Card: text input for application ID, searches on button click or Enter ── */}
          <FadeInSection>
            <Card className="border-0 shadow-xl overflow-hidden mb-6">
              <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Track Your Application
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter Application ID (e.g. RTO-A1B2C3)"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    aria-label="Application ID"
                  />
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeInSection>

          {/* ── Status Result Card: shows application type, date, and colour-coded status badge.
               The status colour is picked from statusColor map (DRAFT=gray, UNDER_REVIEW=amber, etc.).
               If UNDER_REVIEW, an additional info note is shown. ── */}
          {status && (
            <FadeInSection>
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Application #{status.id}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-primary/5 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">Type</p>
                      <p className="font-semibold">{status.type}</p>
                    </div>
                    <div className="bg-primary/5 rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {status.date}
                      </p>
                    </div>
                  </div>
                  <div className={`rounded-xl p-4 border ${statusColor[status.status] || 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-xs text-muted-foreground mb-1">Current Status</p>
                    <p className="font-bold text-lg">{status.status.replace('_', ' ')}</p>
                  </div>
                  {status.status === 'UNDER_REVIEW' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                      Your application is under review. Please check back after 3-5 working days.
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeInSection>
          )}
        </div>
      </section>
      </>
    </RequireAuth>
  );
}
