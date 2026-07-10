'use client';

import { useState, useEffect } from 'react';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ vehicles: any[] }>('/vehicles')
      .then(res => setVehicles(res.vehicles))
      .catch(() => toast.error('Failed to load vehicles'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <RequireAuth>
      <>
        {/* ── Hero banner ── */}
        {/* Consistent gradient header across all dashboard sub-pages creates a unified brand feel. */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]">
        <div className="relative mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold text-white">My Vehicles</h1>
          <p className="text-blue-200 mt-1">View your registered vehicles</p>
        </div>
      </section>
        {/* ── Vehicle list ── */}
        {/* Each vehicle is rendered as a card with a gradient top bar, status badge,
            and insurance indicator. The hover shadow gives tactile feedback that the card
            is interactive (future: click to see full details). */}
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-muted-foreground py-8">Loading...</div>
            ) : vehicles.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No vehicles found</div>
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
