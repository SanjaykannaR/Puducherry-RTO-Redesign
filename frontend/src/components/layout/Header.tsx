'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/lib/i18n/translations';
import { Menu, X, Home, Info, LayoutGrid, Building2, DollarSign, Phone, LayoutDashboard, Languages, User } from 'lucide-react';

const navLinks = [
  { href: '/', key: 'nav.home', icon: Home },
  { href: '/about', key: 'nav.about', icon: Info },
  { href: '/services', key: 'nav.services', icon: LayoutGrid },
  { href: '/directory', key: 'nav.directory', icon: Building2 },
  { href: '/fares', key: 'nav.fares', icon: DollarSign },
  { href: '/contact', key: 'nav.contact', icon: Phone },
];

export default function Header() {
  const { locale, setLocale } = useLanguage();
  const { user } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close mobile menu on every route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header className="bg-primary text-white print:hidden sticky top-0 z-50 shadow-lg backdrop-blur-sm bg-primary/95">
      <a href="#main-content" className="skip-to-content">
        {t('skip.content', locale)}
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* ── Left: Hamburger + Logo ── */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              className="lg:hidden text-white p-2 -ml-1 hover:bg-white/10 rounded-lg transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span className={`absolute transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}>
                  <Menu className="w-6 h-6" />
                </span>
                <span className={`absolute transition-all duration-300 ease-in-out ${menuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}>
                  <X className="w-6 h-6" />
                </span>
              </div>
            </button>

            <Link href="/" className="flex items-center gap-2 sm:gap-3 no-underline text-white group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
                <span className="text-primary font-bold text-xs sm:text-sm">RTO</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold leading-tight">{t('site.title', locale)}</h1>
                <p className="text-xs text-blue-200">{t('site.subtitle', locale)}</p>
              </div>
            </Link>
          </div>

          {/* ── Center: Desktop nav links ── */}
          <div className="hidden lg:flex items-center">
            <Navbar searchOpen={searchOpen} />
          </div>

          {/* ── Right: Search, Language, Auth ── */}
          <div className="flex items-center gap-1 sm:gap-2">
            <SearchBar onToggle={setSearchOpen} />

            <div className="relative">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'en' | 'ta' | 'fr')}
                className="appearance-none bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg pl-7 pr-2 sm:pl-8 sm:pr-3 py-1.5 border border-white/20 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 w-9 sm:w-auto"
                aria-label={t('select.language', locale)}
              >
                <option value="en" className="bg-primary text-white">EN</option>
                <option value="ta" className="bg-primary text-white">த</option>
                <option value="fr" className="bg-primary text-white">FR</option>
              </select>
              <Languages className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-200 pointer-events-none hidden sm:block" />
            </div>

            {user ? (
              <Link href="/dashboard" className="no-underline">
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm hover:shadow-md transition-all gap-1.5 sm:gap-2 px-2 sm:px-4">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </Button>
              </Link>
            ) : (
              <Link href="/login" className="no-underline">
                <Button variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm hover:shadow-md transition-all px-2 sm:px-4">
                  <span className="hidden sm:inline">{t('sign.in', locale)}</span>
                  <span className="sm:hidden"><User className="w-4 h-4" /></span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <ul className="list-none m-0 p-0 pb-3 space-y-1 border-t border-white/10 pt-2">
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
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    {t(link.key, locale)}
                  </Link>
                </li>
              );
            })}
          </ul>

          {user && (
            <div className="border-t border-white/10 pb-3 pt-2 px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 py-2.5 text-sm rounded-lg text-blue-100 hover:bg-white/10 no-underline transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
