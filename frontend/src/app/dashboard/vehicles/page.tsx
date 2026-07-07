'use client';

import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
import { Shield } from 'lucide-react';

const vehicles = [
  { regNo: 'PY-01-AB-1234', make: 'Honda', model: 'Activa 6G', year: 2024, status: 'ACTIVE', insurance: '2027-03-15' },
  { regNo: 'PY-01-CD-5678', make: 'Maruti', model: 'Swift VXi', year: 2023, status: 'ACTIVE', insurance: '2026-11-20' },
];

export default function VehiclesPage() {
  return (
    <RequireAuth>
      <>
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold text-white">My Vehicles</h1>
          <p className="text-blue-200 mt-1">View your registered vehicles</p>
        </div>
      </section>
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="space-y-4">
            {vehicles.map((v, i) => (
              <FadeInSection key={v.regNo} delay={i * 100}>
                <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-bold text-primary">{v.regNo}</h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        {v.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{v.make} {v.model} ({v.year})</p>
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span>Insurance valid until: <strong>{v.insurance}</strong></span>
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
