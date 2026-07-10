'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { Phone, Mail } from 'lucide-react';

// ── Quick links for returning visitors to jump to key areas ──
const quickLinks = [
  { href: '/about', key: 'nav.about' },
  { href: '/services', key: 'nav.services' },
  { href: '/directory', key: 'nav.directory' },
  { href: '/fares', key: 'nav.fares' },
  { href: '/contact', key: 'nav.contact' },
];

// ── Citizen-facing service links: the most common tasks users come for ──
const citizenLinks = [
  { href: '/services/vehicle-registration', key: 'services.vr' },
  { href: '/services/driving-license', key: 'services.dl' },
  { href: '/services/appointment', key: 'services.appt' },
  { href: '/services/fee-calculator', key: 'services.calc' },
  { href: '/services/application-status', key: 'services.track' },
];

export default function Footer() {
  const { locale } = useLanguage();

  return (
    <footer className="bg-primary-dark text-white print:hidden" role="contentinfo">
      <div className="mx-auto px-4 sm:px-6 py-12">
        {/* ── 4-column grid: about → quick links → citizen services → contact ── */}
        {/* Responsively collapses: 1 col on mobile, 2 on sm, 4 on lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* ── Column 1: Brand & description ── */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="text-primary font-bold text-sm">RTO</span>
              </div>
              <div>
                <h3 className="font-bold text-white">{t('site.title', locale)}</h3>
                <p className="text-xs text-blue-300">{t('site.subtitle', locale)}</p>
              </div>
            </div>
            <p className="text-sm text-blue-200 leading-relaxed">
              {t('hero.subtitle', locale)}
            </p>
          </div>

          {/* ── Column 2: Quick links — broad site navigation ── */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full inline-block" />
              {t('footer.quick', locale)}
            </h3>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-blue-200 hover:text-white text-sm no-underline transition-colors flex items-center gap-1.5 group">
                    {/* Small dot bullet that changes colour on hover as a micro-interaction */}
                    <span className="w-1 h-1 rounded-full bg-blue-400 group-hover:bg-amber-400 transition-colors" />
                    {t(link.key, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Citizen services — task-oriented links ── */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full inline-block" />
              {t('footer.citizen', locale)}
            </h3>
            <ul className="space-y-2.5 list-none m-0 p-0">
              {citizenLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-blue-200 hover:text-white text-sm no-underline transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-blue-400 group-hover:bg-amber-400 transition-colors" />
                    {t(link.key, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Contact info + social media ── */}
          <div>
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full inline-block" />
              {t('footer.contact', locale)}
            </h3>
            <address className="not-italic text-sm text-blue-200 space-y-2 leading-relaxed">
              <p>{t('contact.address', locale)}</p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                {t('contact.phone', locale)}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                {t('contact.email', locale)}
              </p>
              <p>{t('contact.hours', locale)}</p>
            </address>
            {/* Social icons: external links to government social media channels */}
            <div className="mt-4">
              <h4 className="text-xs font-medium text-blue-300 uppercase tracking-wider mb-2">{t('footer.social', locale)}</h4>
              <div className="flex gap-2">
                <a href="#" className="bg-blue-700 hover:bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center transition-colors" aria-label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="bg-blue-700 hover:bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center transition-colors" aria-label="X (Twitter)">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="bg-blue-700 hover:bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center transition-colors" aria-label="YouTube">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 4-8 4z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom bar: copyright year + legal links ── */}
        <div className="border-t border-blue-700/50 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-blue-300">
              &copy; {new Date().getFullYear()} {t('site.title', locale)}.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <Link href="/accessibility" className="text-blue-200 hover:text-white no-underline transition-colors">{t('footer.accessibility', locale)}</Link>
              <Link href="/privacy" className="text-blue-200 hover:text-white no-underline transition-colors">{t('footer.privacy', locale)}</Link>
              <Link href="/terms" className="text-blue-200 hover:text-white no-underline transition-colors">{t('footer.terms', locale)}</Link>
              <Link href="/sitemap" className="text-blue-200 hover:text-white no-underline transition-colors">{t('footer.sitemap', locale)}</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
