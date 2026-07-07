'use client';

// ── Auth guard ensures only logged-in users see this page ──
import RequireAuth from '@/components/auth/RequireAuth';
import FadeInSection from '@/components/ui/fade-in-section';

// ── Static license data ──
// Shows both Learner's and Permanent licenses with their validity windows.
// The status drives both the gradient bar colour and the badge style so users
// instantly spot expired vs active documents.
const licenses = [
  { no: 'PY-0120241234567', type: 'MCWG', name: 'Learner\'s License', issueDate: '2025-01-15', expiryDate: '2026-01-14', status: 'EXPIRED' },
  { no: 'PY-0120252345678', type: 'MCWG', name: 'Permanent License', issueDate: '2026-03-20', expiryDate: '2036-03-19', status: 'ACTIVE' },
];

export default function LicensesPage() {
  return (
    <RequireAuth>
      <>
        {/* ── Hero banner ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold text-white">My Licenses</h1>
          <p className="text-blue-200 mt-1">View your driving licenses</p>
        </div>
      </section>
        {/* ── License cards ── */}
        {/* Each card groups license number, type, and validity period into a cohesive
            block. The gradient top bar changes colour based on status (green = active,
            red = expired) so users get a quick visual health-check without reading text. */}
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="space-y-4">
            {licenses.map((l, i) => (
              <FadeInSection key={l.no} delay={i * 100}>
                <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
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
                    {/* ── Detail grid ── */}
                    {/* Three evenly-spaced panels break the metadata into scannable chunks:
                        license number, type name, and validity range. */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">License No.</p>
                        <p className="font-medium">{l.no}</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-medium">{l.name}</p>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Validity</p>
                        <p className="font-medium">{l.issueDate} - {l.expiryDate}</p>
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
