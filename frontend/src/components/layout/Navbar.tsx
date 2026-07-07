'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { Menu, X, Home, Info, LayoutGrid, Building2, DollarSign, Phone } from 'lucide-react';

// ── Navigation entries: shared between desktop and mobile ──
// Each entry has an icon for visual recognition and a i18n key for translation.
const navLinks = [
  { href: '/', key: 'nav.home', icon: Home },
  { href: '/about', key: 'nav.about', icon: Info },
  { href: '/services', key: 'nav.services', icon: LayoutGrid },
  { href: '/directory', key: 'nav.directory', icon: Building2 },
  { href: '/fares', key: 'nav.fares', icon: DollarSign },
  { href: '/contact', key: 'nav.contact', icon: Phone },
];

export default function Navbar() {
  // ── usePathname lets us highlight the current route ──
  const pathname = usePathname();
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);

  // ── Close mobile menu on every route change so user sees the fresh page ──
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="border-t border-white/10" aria-label="Main navigation">
      <div className="flex items-center">
        {/* ── Desktop horizontal nav: visible from lg breakpoint ── */}
        <ul className="hidden lg:flex list-none m-0 p-0 gap-1 flex-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all no-underline ${
                    isActive
                      ? 'bg-white text-primary shadow-sm'        // Active: white tab that feels "pushed in"
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(link.key, locale)}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── Mobile hamburger toggle: invisible on desktop via lg:hidden ── */}
        <div className="lg:hidden flex-1" />
        <button
          className="lg:hidden text-white p-2 mr-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Mobile dropdown panel: animated via max-h and opacity ── */}
      {/* max-h transitions from 0 → 80 so the menu smoothly slides open/collapses */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="list-none m-0 p-0 pb-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg no-underline transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(link.key, locale)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
