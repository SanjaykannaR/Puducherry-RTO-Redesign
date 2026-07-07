'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { Menu, X, Home, Info, LayoutGrid, Building2, DollarSign, Phone } from 'lucide-react';

const navLinks = [
  { href: '/', key: 'nav.home', icon: Home },
  { href: '/about', key: 'nav.about', icon: Info },
  { href: '/services', key: 'nav.services', icon: LayoutGrid },
  { href: '/directory', key: 'nav.directory', icon: Building2 },
  { href: '/fares', key: 'nav.fares', icon: DollarSign },
  { href: '/contact', key: 'nav.contact', icon: Phone },
];

export default function Navbar() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="border-t border-white/10" aria-label="Main navigation">
      <div className="flex items-center justify-between -mx-4 sm:mx-0">
        <ul className="hidden lg:flex list-none m-0 p-0 gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all no-underline ${
                    isActive
                      ? 'bg-white text-primary shadow-sm'
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

        <button
          className="lg:hidden text-white p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

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
