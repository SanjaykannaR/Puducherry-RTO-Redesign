'use client';

// ── My Vehicles page ──
// Displays registered vehicles in a card list and provides an inline form
// to register a new vehicle. All data is fetched/submitted via the /api/vehicles endpoints.

import { useState, useEffect } from 'react';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { Shield, Plus, X, Car } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ── Form fields shared across vehicle creation ──
// Matches the expected POST /api/vehicles body (see backend/src/routes/vehicles.ts)
const emptyForm = {
  registrationNo: '',
  chassisNo: '',
  engineNo: '',
  make: '',
  model: '',
  manufactureYear: new Date().getFullYear(),
  fuelType: 'PETROL',
  color: '',
  ownerName: '',
  ownerAddress: '',
  insuranceUpto: '',
  taxPaidUpto: '',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Toggle to show/hide the "Add Vehicle" form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // ── Fetch existing vehicles on mount ──
  useEffect(() => {
    api.get<{ vehicles: any[] }>('/vehicles')
      .then(res => setVehicles(res.vehicles))
      .catch(() => toast.error('Failed to load vehicles'))
      .finally(() => setLoading(false));
  }, []);

  // ── Handle form field changes ──
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  // ── Submit new vehicle to backend ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const vehicle = await api.post<any>('/vehicles', form);
      setVehicles(prev => [vehicle, ...prev]); // prepend so newest shows first
      setForm({ ...emptyForm });
      setShowForm(false);
      toast.success('Vehicle registered successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to register vehicle');
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">My Vehicles</h1>
                <p className="text-blue-200 mt-1">View &amp; register your vehicles</p>
              </div>
              {/* ── Add Vehicle button — floats on the right side of the hero ── */}
              <button
                onClick={() => setShowForm(prev => !prev)}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-sm font-semibold transition-all shadow-lg hover:shadow-amber-500/30 no-underline"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? 'Cancel' : 'Add Vehicle'}
              </button>
            </div>
          </div>
        </section>

        <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
          <div className="max-w-4xl mx-auto px-4 py-10">
            {/* ── Inline Add Vehicle Form ── */}
            {/* Slides in below the hero when the user clicks "Add Vehicle".
                Fields are grouped into a clean card with a gradient top bar. */}
            {showForm && (
              <FadeInSection>
                <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden mb-8">
                  <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-primary mb-4">Register New Vehicle</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Row 1: Registration Number — the unique plate identifier */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Registration Number *</label>
                        <input name="registrationNo" value={form.registrationNo} onChange={handleChange} required placeholder="e.g. PY-01-AB-1234" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Chassis Number */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Chassis Number *</label>
                        <input name="chassisNo" value={form.chassisNo} onChange={handleChange} required placeholder="17-character VIN" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Engine Number */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Engine Number *</label>
                        <input name="engineNo" value={form.engineNo} onChange={handleChange} required placeholder="Engine serial" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Make (Manufacturer) */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Make *</label>
                        <input name="make" value={form.make} onChange={handleChange} required placeholder="e.g. Honda, Maruti" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Model */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Model *</label>
                        <input name="model" value={form.model} onChange={handleChange} required placeholder="e.g. City, Swift" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Manufacture Year — numeric, current year as default */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Manufacture Year *</label>
                        <input name="manufactureYear" type="number" value={form.manufactureYear} onChange={handleChange} required min="1990" max={new Date().getFullYear() + 1} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Fuel Type — dropdown with common options */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Fuel Type *</label>
                        <select name="fuelType" value={form.fuelType} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none">
                          <option value="PETROL">Petrol</option>
                          <option value="DIESEL">Diesel</option>
                          <option value="CNG">CNG</option>
                          <option value="ELECTRIC">Electric</option>
                          <option value="LPG">LPG</option>
                        </select>
                      </div>
                      {/* Color — text input for flexibility */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Color *</label>
                        <input name="color" value={form.color} onChange={handleChange} required placeholder="e.g. White, Red" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Owner Name */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Owner Name</label>
                        <input name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="As per RC" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Owner Address */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Owner Address</label>
                        <input name="ownerAddress" value={form.ownerAddress} onChange={handleChange} placeholder="Registered address" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Insurance Valid Until — date picker */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Insurance Valid Until</label>
                        <input name="insuranceUpto" type="date" value={form.insuranceUpto} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* Tax Paid Until — date picker */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Tax Paid Until</label>
                        <input name="taxPaidUpto" type="date" value={form.taxPaidUpto} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
                      </div>
                      {/* ── Submit button — spans full width on mobile, half on desktop ── */}
                      <div className="md:col-span-2 flex justify-end mt-2">
                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-50">
                          {saving ? 'Registering...' : 'Register Vehicle'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </FadeInSection>
            )}

            {/* ── Vehicle List ── */}
            {/* Cards with gradient top bar, status badge, and insurance indicator. */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : vehicles.length === 0 && !showForm ? (
                /* ── Empty state — prompt user to add their first vehicle ── */
                <div className="text-center py-16">
                  <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-1">No vehicles yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Register your first vehicle to get started</p>
                  <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white px-5 py-2.5 text-sm font-semibold transition-all">
                    <Plus className="w-4 h-4" /> Add Vehicle
                  </button>
                </div>
              ) : vehicles.map((v, i) => (
                <FadeInSection key={v.id || v.registrationNo} delay={i * 100}>
                  <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold text-primary">{v.registrationNo}</h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          {v.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{v.make} {v.model} ({v.manufactureYear})</p>
                      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>Insurance valid until: <strong>{v.insuranceUpto?.split('T')[0] || v.insuranceUpto}</strong></span>
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
