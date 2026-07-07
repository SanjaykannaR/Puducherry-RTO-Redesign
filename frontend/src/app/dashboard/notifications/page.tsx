'use client';

// ── Local state for tracking read/unread status ──
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import FadeInSection from '@/components/ui/fade-in-section';
import RequireAuth from '@/components/auth/RequireAuth';
// ── Icon per type helps users triage urgency without reading the full message ──
import { Bell, AlertTriangle, Info, CheckCheck } from 'lucide-react';

// ── Seed notifications ──
// Each notification carries a type (WARNING, ALERT, INFO) that controls icon, border,
// and background colour. The `isRead` flag toggles visual prominence and the "Mark Read" action.
const initialNotifs = [
  { id: '1', title: 'Insurance Expiring Soon', message: 'Your vehicle PY-01-AB-1234 insurance expires in 15 days.', type: 'WARNING', isRead: false, date: '2026-07-01' },
  { id: '2', title: 'License Renewal Due', message: 'Your driving license expires on 2026-09-15. Please renew.', type: 'INFO', isRead: false, date: '2026-06-28' },
  { id: '3', title: 'PUC Expired', message: 'Your PUC certificate has expired. Get a fresh PUC test.', type: 'ALERT', isRead: true, date: '2026-06-15' },
];

export default function NotificationsPage() {
  // ── State: notification list (allows local mark-as-read without a server round-trip) ──
  const [notifs, setNotifs] = useState(initialNotifs);

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }

  // ── Visual mapping per notification type ──
  // Each type gets an icon, a background/border combo, and a text colour so severity
  // is communicated through multiple visual channels (not colour alone).
  const typeIcon: Record<string, React.ReactNode> = {
    WARNING: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    ALERT: <AlertTriangle className="h-5 w-5 text-destructive" />,
    INFO: <Info className="h-5 w-5 text-primary" />,
  };

  const typeBg: Record<string, string> = {
    WARNING: 'bg-amber-50 border-amber-200',
    ALERT: 'bg-red-50 border-red-200',
    INFO: 'bg-blue-50 border-blue-200',
  };

  const typeText: Record<string, string> = {
    WARNING: 'text-amber-700',
    ALERT: 'text-red-700',
    INFO: 'text-blue-700',
  };

  return (
    <RequireAuth>
      <>
        {/* ── Hero banner ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-blue-200 mt-1">View alerts and notices</p>
        </div>
      </section>
        {/* ── Notification feed ── */}
        {/* Each notification card uses a type-specific gradient bar, icon, and badge.
            Read notifications are dimmed (opacity-60) to visually deprioritise them,
            while unread ones keep full opacity and show a "Mark Read" button. */}
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="space-y-4">
            {notifs.map((n, i) => (
              <FadeInSection key={n.id} delay={i * 80}>
                <div className={`bg-white rounded-xl border-0 shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl ${n.isRead ? 'opacity-60' : ''}`}>
                  <div className={`h-2 bg-gradient-to-r ${n.type === 'WARNING' ? 'from-amber-400 to-amber-500' : n.type === 'ALERT' ? 'from-red-400 to-rose-500' : 'from-blue-400 to-blue-500'}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${typeBg[n.type]} flex items-center justify-center shrink-0`}>
                          {typeIcon[n.type]}
                        </div>
                        <div>
                          <h3 className="font-semibold">{n.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.date}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeBg[n.type]} ${typeText[n.type]}`}>
                        {n.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 ml-13">{n.message}</p>
                    {!n.isRead && (
                      <div className="mt-3 ml-13">
                        <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>
                          <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                          Mark Read
                        </Button>
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
