'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n/translations';
import { Home, Info, LayoutGrid, Building2, DollarSign, Phone } from 'lucide-react';

const navLinks = [
  { href: '/', key: 'nav.home', icon: Home },
  { href: '/about', key: 'nav.about', icon: Info },
  { href: '/services', key: 'nav.services', icon: LayoutGrid },
  { href: '/directory', key: 'nav.directory', icon: Building2 },
  { href: '/fares', key: 'nav.fares', icon: DollarSign },
  { href: '/contact', key: 'nav.contact', icon: Phone },
];

export default function Navbar({ searchOpen }: { searchOpen?: boolean }) {
  const pathname = usePathname();
  const { locale } = useLanguage();

  return (
    <nav aria-label="Main navigation">
      <ul className="flex list-none m-0 p-0 gap-0.5">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-1.5 px-2.5 xl:px-4 py-2 text-sm font-medium rounded-lg transition-all no-underline ${
                  isActive
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={`transition-all duration-300 ${
                  searchOpen ? 'hidden opacity-0' : 'inline opacity-100'
                }`}>
                  {t(link.key, locale)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
