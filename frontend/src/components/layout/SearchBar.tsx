'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n/translations';

// ── Master service index for search ──
// Each entry has keywords so the search feels smart (e.g. typing "fine" matches Challan).
// The intent is a single source of truth that can also power an autocomplete feature later.
const serviceLinks = [
  { label: 'Vehicle Registration', href: '/services/vehicle-registration', keywords: ['vehicle', 'registration', 'rc', 'new vehicle', 'register'] },
  { label: "Learner's License", href: '/services/learners-license', keywords: ['learner', 'license', 'driving', 'll', 'learning'] },
  { label: 'Permanent License', href: '/services/driving-license', keywords: ['permanent', 'license', 'driving', 'dl', 'driver'] },
  { label: 'License Renewal', href: '/services/license-renewal', keywords: ['renewal', 'license', 'renew', 'extend'] },
  { label: 'Book Appointment', href: '/services/appointment', keywords: ['appointment', 'book', 'schedule', 'visit', 'slot'] },
  { label: 'Fee Calculator', href: '/services/fee-calculator', keywords: ['fee', 'calculator', 'cost', 'price', 'charge', 'payment'] },
  { label: 'Application Status', href: '/services/application-status', keywords: ['application', 'status', 'track', 'follow up'] },
  { label: 'Challan Status', href: '/services/challan', keywords: ['challan', 'fine', 'traffic', 'violation', 'penalty', 'pay'] },
  { label: 'Vehicle Status', href: '/services/vehicle-status', keywords: ['vehicle', 'status', 'fc', 'fitness', 'puc', 'insurance', 'tax', 'lifecycle'] },
  { label: 'Transfer of Ownership', href: '/services/transfer-ownership', keywords: ['transfer', 'ownership', 'sale', 'buy', 'sell'] },
  { label: 'Duplicate RC', href: '/services/duplicate-rc', keywords: ['duplicate', 'rc', 'certificate', 'lost'] },
  { label: 'International Permit', href: '/services/international-permit', keywords: ['international', 'permit', 'driving', 'abroad', 'idp'] },
  { label: 'About Us', href: '/about', keywords: ['about', 'rto', 'puducherry', 'history'] },
  { label: 'Contact Us', href: '/contact', keywords: ['contact', 'phone', 'email', 'address', 'help'] },
  { label: 'Fees & Fares', href: '/fares', keywords: ['fee', 'fare', 'price', 'cost', 'tax', 'charge'] },
  { label: 'Directory', href: '/directory', keywords: ['directory', 'office', 'address', 'phone'] },
];

export default function SearchBar({ onToggle }: { onToggle?: (open: boolean) => void }) {
  const { locale } = useLanguage();
  const router = useRouter();
  const [open, setOpen] = useState(false);       // Toggle: search icon vs expanded input
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof serviceLinks>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Auto-focus the input when search panel opens ──
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    onToggle?.(open);
  }, [open, onToggle]);

  // ── Filter results on every keystroke ──
  // Matches both the display label and the curated keywords array for forgiving search.
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const matches = serviceLinks.filter(
      (s) => s.label.toLowerCase().includes(q) || s.keywords.some((k) => k.includes(q))
    ).slice(0, 6);   // Cap at 6 results to avoid overwhelming the dropdown
    setResults(matches);
  }, [query]);

  // ── Click-away listener: closes the search panel when user clicks outside ──
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    setQuery('');
    router.push(href);
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* ── Mobile: full-width overlay search ── */}
      {open ? (
        <div className="fixed inset-0 z-[60] bg-primary/95 backdrop-blur-sm sm:static sm:z-auto sm:bg-transparent sm:backdrop-blur-none">
          <div className="flex items-center h-16 px-4 sm:static sm:h-auto sm:px-0">
            <div className="flex items-center w-full sm:w-auto bg-white/10 rounded-lg border border-white/20 sm:max-w-none">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder', locale)}
                className="bg-transparent text-white text-sm px-3 py-2 flex-1 sm:w-48 sm:flex-initial outline-none placeholder:text-blue-200"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && results.length > 0) navigate(results[0].href);
                }}
              />
              <button onClick={() => { setOpen(false); setQuery(''); }} className="p-2 text-blue-200 hover:text-white" aria-label="Close search">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* ── Results dropdown (mobile: below the overlay bar, desktop: below search icon) ── */}
          {results.length > 0 && (
            <div className="sm:absolute sm:top-full sm:right-0 sm:mt-1 w-full sm:w-72 bg-white rounded-none sm:rounded-xl shadow-xl border overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
              {results.map((r) => (
                <button
                  key={r.href}
                  onClick={() => navigate(r.href)}
                  className="w-full text-left px-4 py-3 text-sm text-foreground hover:bg-primary/5 transition-colors border-b last:border-0"
                >
                  <p className="font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.href}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="p-2 text-white/80 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Open search">
          <Search className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
