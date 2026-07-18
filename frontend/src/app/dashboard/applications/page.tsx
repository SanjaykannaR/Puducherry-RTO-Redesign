'use client';

// ── My Applications page ──
// Lists submitted service applications (vehicle reg, license, etc.) and provides
// a form to submit a new application. Uses GET/POST /api/applications.

import { useState, useEffect } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import FadeInSection from '@/components/ui/fade-in-section';
import { FileText, Plus, X, ClipboardList } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ── Colour-coded status badge styles ──
const statusColor: Record<string, string> = {
  SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-50 text-gray-700 border-gray-200',
};

// ── Application types the user can select when creating a new application ──
const appTypes = [
  'VEHICLE_REGISTRATION',
  'DRIVING_LICENSE',
  'LEARNERS_LICENSE',
  'LICENSE_RENEWAL',
  'INTERNATIONAL_PERMIT',
  'TRANSFER_OWNERSHIP',
  'DUPLICATE_RC',
  'APPOINTMENT',
  'OTHER',
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // Form state: type dropdown + free-form textarea for formData (JSON)
  const [appType, setAppType] = useState(appTypes[0]);
  const [formData, setFormData] = useState('{}');
  const [saving, setSaving] = useState(false);
  // Tracks which application ID is being cancelled (shows spinner on that card)
  const [cancelling, setCancelling] = useState<string | null>(null);

  // ── Fetch existing applications on mount ──
  useEffect(() => {
    api.get<{ applications: any[] }>('/applications')
      .then(res => setApplications(res.applications))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, []);

  // ── Submit a new application ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // Parse formData as JSON if it's a valid object string
      let parsedData: any = {};
      try { parsedData = JSON.parse(formData); } catch { parsedData = { notes: formData }; }
      const app = await api.post<any>('/applications', { type: appType, formData: parsedData });
      setApplications(prev => [app, ...prev]); // prepend newest
      setAppType(appTypes[0]);
      setFormData('{}');
      setShowForm(false);
      toast.success('Application submitted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setSaving(false);
    }
  }

  // ── Cancel an application ──
  async function handleCancel(id: string) {
    setCancelling(id);
    try {
      await api.patch(`/applications/${id}/cancel`, {});
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));
      toast.success('Application cancelled');
    } catch {
      toast.error('Failed to cancel application');
    } finally {
      setCancelling(null);
    }
  }

  return (
    <RequireAuth>
      <>
        {/* ── Hero banner ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]">
          <div className="relative mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">My Applications</h1>
                <p className="text-blue-200 mt-1">Submit &amp; track your service applications</p>
              </div>
              <button
                onClick={() => setShowForm(prev => !prev)}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-sm font-semibold transition-all shadow-lg hover:shadow-amber-500/30 no-underline"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? 'Cancel' : 'New Application'}
              </button>
            </div>
          </div>
        </section>

        <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
          <div className="max-w-4xl mx-auto px-4 py-10">
            {/* ── New Application Form ── */}
            {showForm && (
              <FadeInSection>
                <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden mb-8">
                  <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-primary mb-4">New Application</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* ── Application Type ── */}
                      {/* Dropdown of all supported service types from the RTO portal */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Application Type *</label>
                        <select value={appType} onChange={e => setAppType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none">
                          {appTypes.map(t => (
                            <option key={t} value={t}>{t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</option>
                          ))}
                        </select>
                      </div>
                      {/* ── Form Data (optional JSON) ── */}
                      {/* Free-form textarea where the user can paste key=value or JSON
                          payload. The frontend attempts JSON.parse first; if that fails it
                          wraps the raw text as `{ notes: "..." }`. */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Form Data <span className="text-muted-foreground font-normal">(optional JSON)</span></label>
                        <textarea value={formData} onChange={e => setFormData(e.target.value)} rows={4} placeholder='{"name": "John", "service": "license"}' className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-50">
                          {saving ? 'Submitting...' : 'Submit Application'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* ── Application List ── */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : applications.length === 0 && !showForm ? (
                /* ── Empty state ── */
                <div className="text-center py-16">
                  <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-1">No applications yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start a new application for any RTO service</p>
                  <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-5 py-2.5 text-sm font-semibold transition-all">
                    <Plus className="w-4 h-4" /> New Application
                  </button>
                </div>
              ) : applications.map((app, i) => (
                <FadeInSection key={app.id} delay={i * 100}>
                  <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        {/* Application ID shown in monospace for easy copy-paste reference */}
                        <h2 className="text-lg font-bold text-primary font-mono truncate max-w-[300px]" title={app.id}>{app.id}</h2>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColor[app.status] || 'bg-gray-50 border-gray-200'}`}>
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {/* Two-column metadata: type + date */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-primary/5 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="font-medium">{app.type?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase()) || app.type}</p>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Submitted</p>
                          <p className="font-medium">{app.createdAt?.split('T')[0] || app.date}</p>
                        </div>
                      </div>
                      {/* ── Cancel button — only shown for cancellable statuses ── */}
                      {app.status !== 'CANCELLED' && app.status !== 'APPROVED' && app.status !== 'REJECTED' && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleCancel(app.id)}
                            disabled={cancelling === app.id}
                            className="text-xs text-red-600 hover:text-red-800 font-medium underline disabled:opacity-50"
                          >
                            {cancelling === app.id ? 'Cancelling...' : 'Cancel Application'}
                          </button>
                        </div>
                      )}
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
