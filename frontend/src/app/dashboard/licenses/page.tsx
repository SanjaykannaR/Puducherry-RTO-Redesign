'use client';

// ── My Licenses page ──
// Displays driving licenses in a card list and provides an inline form
// to add a new license. Connects to GET/POST /api/licenses.

import { useState, useEffect } from 'react';
import RequireAuth from '@/components/auth/RequireAuth';
import FadeInSection from '@/components/ui/fade-in-section';
import { FileText, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ── Empty form shape — matches POST /api/licenses body ──
const emptyForm = {
  licenseNo: '',
  type: 'MCWG',
  name: '',
  dob: '',
  address: '',
  issueDate: '',
  expiryDate: '',
};

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // ── Fetch existing licenses on mount ──
  useEffect(() => {
    api.get<{ licenses: any[] }>('/licenses')
      .then(res => setLicenses(res.licenses))
      .catch(() => toast.error('Failed to load licenses'))
      .finally(() => setLoading(false));
  }, []);

  // ── Handle input changes ──
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // ── Submit new license ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const license = await api.post<any>('/licenses', form);
      setLicenses(prev => [license, ...prev]); // newest first
      setForm({ ...emptyForm });
      setShowForm(false);
      toast.success('License added successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add license');
    } finally {
      setSaving(false);
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
                <h1 className="text-2xl sm:text-3xl font-bold text-white">My Licenses</h1>
                <p className="text-blue-200 mt-1">View &amp; add your driving licenses</p>
              </div>
              {/* ── Add License toggle button ── */}
              <button
                onClick={() => setShowForm(prev => !prev)}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-sm font-semibold transition-all shadow-lg hover:shadow-amber-500/30 no-underline"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? 'Cancel' : 'Add License'}
              </button>
            </div>
          </div>
        </section>

        <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
          <div className="max-w-4xl mx-auto px-4 py-10">
            {/* ── Inline Add License Form ── */}
            {showForm && (
              <FadeInSection>
                <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden mb-8">
                  <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-primary mb-4">Add New License</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* License Number — unique identifier for the DL/LL document */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">License Number *</label>
                        <input name="licenseNo" value={form.licenseNo} onChange={handleChange} required placeholder="e.g. PY-012024123456" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* License Type — dropdown of common RTO categories */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select name="type" value={form.type} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none">
                          <option value="MCWG">MCWG (MotorCycle With Gear)</option>
                          <option value="MCWOG">MCWOG (MotorCycle Without Gear)</option>
                          <option value="LMV">LMV (Light Motor Vehicle)</option>
                          <option value="LMV-NT">LMV-NT (LMV — Non Transport)</option>
                          <option value="LMV-TR">LMV-TR (LMV — Transport)</option>
                          <option value="HMV">HMV (Heavy Motor Vehicle)</option>
                          <option value="LLR">LLR (Learner&apos;s License)</option>
                        </select>
                      </div>
                      {/* Full Name — as printed on the license document */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name *</label>
                        <input name="name" value={form.name} onChange={handleChange} required placeholder="Name on license" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                        <input name="dob" type="date" value={form.dob} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Address — textarea for longer address strings */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Address *</label>
                        <textarea name="address" value={form.address} onChange={handleChange} required placeholder="Full address as per license" rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Issue Date */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Issue Date *</label>
                        <input name="issueDate" type="date" value={form.issueDate} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Expiry Date */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Expiry Date *</label>
                        <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* ── Submit ── */}
                      <div className="md:col-span-2 flex justify-end mt-2">
                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-50">
                          {saving ? 'Adding...' : 'Add License'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* ── License list ── */}
            {/* Each card shows type, license number, and validity period with a colour-coded
                gradient bar (green = active, red = expired). */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : licenses.length === 0 && !showForm ? (
                /* ── Empty state ── */
                <div className="text-center py-16">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-1">No licenses yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add your driving license to keep track of renewals</p>
                  <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-5 py-2.5 text-sm font-semibold transition-all">
                    <Plus className="w-4 h-4" /> Add License
                  </button>
                </div>
              ) : licenses.map((l, i) => (
                <FadeInSection key={l.id || l.licenseNo} delay={i * 100}>
                  <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Colour-coded status bar — green for active, red for expired */}
                    <div className={`h-2 bg-gradient-to-r ${l.status === 'ACTIVE' ? 'from-green-400 to-emerald-500' : 'from-red-400 to-rose-500'}`} />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-primary">{l.type}</h2>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          l.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {l.status}
                        </span>
                      </div>
                      {/* Three-column metadata grid for license details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="bg-primary/5 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">License No.</p>
                          <p className="font-medium">{l.licenseNo}</p>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Holder</p>
                          <p className="font-medium">{l.name}</p>
                        </div>
                        <div className="bg-primary/5 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Validity</p>
                          <p className="font-medium">{l.issueDate?.split('T')[0] || l.issueDate} — {l.expiryDate?.split('T')[0] || l.expiryDate}</p>
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
