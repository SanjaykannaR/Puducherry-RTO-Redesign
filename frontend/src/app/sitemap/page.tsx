import type { Metadata } from 'next';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import Link from 'next/link';
// ── Category-specific icons help users locate the right section faster ──
import { Home, FileText, Calendar, Calculator, Search, ClipboardList, Activity, Info, MapPin, DollarSign, Mail, Car, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Complete sitemap of Puducherry RTO portal - find all pages and services.',
};

// ── Sitemap groups ──
// Links are organised into thematic groups (main pages, registration, licensing,
// online tools, account) so users can browse by task rather than by URL structure.
// Each group has an icon that represents the category.
const sections = [
  {
    title: 'Main Pages', icon: Home,
    links: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About Us' },
      { href: '/services', label: 'Services' },
      { href: '/directory', label: 'Directory' },
      { href: '/fares', label: 'Fees & Fares' },
      { href: '/contact', label: 'Contact Us' },
    ],
  },
  {
    title: 'Registration Services', icon: Car,
    links: [
      { href: '/services/vehicle-registration', label: 'New Vehicle Registration' },
      { href: '/services/transfer-ownership', label: 'Transfer of Ownership' },
      { href: '/services/duplicate-rc', label: 'Duplicate RC' },
      { href: '/services/vehicle-status', label: 'Vehicle Status (FC/PUC)' },
    ],
  },
  {
    title: 'Licensing Services', icon: FileText,
    links: [
      { href: '/services/learners-license', label: "Learner's License" },
      { href: '/services/driving-license', label: 'Permanent License' },
      { href: '/services/license-renewal', label: 'License Renewal' },
      { href: '/services/international-permit', label: 'International Permit' },
    ],
  },
  {
    title: 'Online Tools', icon: Calculator,
    links: [
      { href: '/services/appointment', label: 'Book Appointment' },
      { href: '/services/fee-calculator', label: 'Fee Calculator' },
      { href: '/services/application-status', label: 'Application Status' },
      { href: '/services/challan', label: 'Challan Status' },
      { href: '/services/download-forms', label: 'Download Forms' },
    ],
  },
  {
    title: 'Account', icon: Mail,
    links: [
      { href: '/login', label: 'Sign In' },
      { href: '/register', label: 'Create Account' },
      { href: '/dashboard', label: 'Dashboard' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <PageHero title="Sitemap" subtitle="Complete overview of all pages available on the Puducherry RTO portal." />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* ── Sitemap grid ── */}
          {/* Three-column responsive grid of category cards. Each card lists all links in
              that group with bullet dots and hover colour changes, making it a pure
              navigation aid (no content, just pathways). */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((sec, i) => {
              const Icon = sec.icon;
              return (
                <FadeInSection key={i} delay={i * 80}>
                  <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden h-full">
                    <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">{sec.title}</h3>
                      </div>
                      <ul className="space-y-2">
                        {sec.links.map((link) => (
                          <li key={link.href}>
                            <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary no-underline transition-colors flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-primary/30" />
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
