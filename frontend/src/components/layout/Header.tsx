'use client';

import Link from 'next/link';
import Navbar from './Navbar';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { Languages } from 'lucide-react';

export default function Header() {
  const { locale, setLocale } = useLanguage();

  return (
    <header className="bg-primary text-white print:hidden sticky top-0 z-50 shadow-lg backdrop-blur-sm bg-primary/95">
      <a href="#main-content" className="skip-to-content">
        {t('skip.content', locale)}
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 no-underline text-white group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105">
              <span className="text-primary font-bold text-sm">RTO</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold leading-tight">{t('site.title', locale)}</h1>
              <p className="text-xs text-blue-200">{t('site.subtitle', locale)}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <SearchBar />
            <div className="relative">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'en' | 'ta' | 'fr')}
                className="appearance-none bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg pl-8 pr-3 py-1.5 border border-white/20 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
                aria-label={t('select.language', locale)}
              >
                <option value="en" className="bg-primary text-white">English</option>
                <option value="ta" className="bg-primary text-white">தமிழ்</option>
                <option value="fr" className="bg-primary text-white">Français</option>
              </select>
              <Languages className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-200 pointer-events-none" />
            </div>
            <Link href="/login" className="no-underline">
              <Button variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm hover:shadow-md transition-all">
                {t('sign.in', locale)}
              </Button>
            </Link>
          </div>
        </div>
        <Navbar />
      </div>
    </header>
  );
}
