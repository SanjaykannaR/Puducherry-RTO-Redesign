// ── Imports: Next.js metadata, navigation, UI components, and icons for each service card ──
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import { Car, FileText, Calendar, Calculator, Search, ClipboardList, Activity, Download, ArrowRight } from 'lucide-react';

// ── Page Metadata: Sets <title> and <meta> for SEO so search engines index the service hub correctly ──
export const metadata: Metadata = {
  title: 'Services',
  description: 'Puducherry RTO services - vehicle registration, driving license, appointments, and more.',
};

// ── Service Catalog Data: Static array grouped by category (Registration, Licensing, Online Tools).
//     Each entry includes a route, description, and icon — drives the entire grid below so adding
//     a new service only requires adding one object here. ──
const serviceCategories = [
  {
    title: 'Registration Services',
    services: [
      { name: 'New Vehicle Registration', href: '/services/vehicle-registration', desc: 'Register new vehicles purchased in Puducherry.', icon: Car },
      { name: 'Transfer of Ownership', href: '/services/transfer-ownership', desc: 'Transfer vehicle ownership on sale.', icon: Car },
      { name: 'Duplicate RC', href: '/services/duplicate-rc', desc: 'Request duplicate registration certificate.', icon: FileText },
    ],
  },
  {
    title: 'Licensing Services',
    services: [
      { name: "Learner's License", href: '/services/learners-license', desc: "Apply for a learner's driving license.", icon: FileText },
      { name: 'Permanent License', href: '/services/driving-license', desc: 'Apply for a permanent driving license.', icon: FileText },
      { name: 'License Renewal', href: '/services/license-renewal', desc: 'Renew your driving license online.', icon: FileText },
      { name: 'International Permit', href: '/services/international-permit', desc: 'Apply for an international driving permit.', icon: FileText },
    ],
  },
  {
    title: 'Online Tools',
    services: [
      { name: 'Book Appointment', href: '/services/appointment', desc: 'Schedule your RTO visit for tests and inquiries.', icon: Calendar },
      { name: 'Fee Calculator', href: '/services/fee-calculator', desc: 'Calculate fees for various RTO services.', icon: Calculator },
      { name: 'Application Status', href: '/services/application-status', desc: 'Track your application in real-time.', icon: Search },
      { name: 'Challan Status', href: '/services/challan', desc: 'View and pay traffic violation challans.', icon: ClipboardList },
      { name: 'Vehicle Status', href: '/services/vehicle-status', desc: 'Check RC, insurance, FC (Fitness Certificate), PUC, and tax status.', icon: Activity },
      { name: 'Download Forms', href: '/services/download-forms', desc: 'Download RTO application forms.', icon: Download },
    ],
  },
// ── End of service catalog data ──
];

// ── ServicesPage Component: The main hub page. Renders a hero banner, then loops through each
//     service category rendering a grid of clickable cards. Each card links to the service's own
//     page. Uses FadeInSection for staggered scroll animations. ──
export default function ServicesPage() {
  return (
    <>
      <PageHero title="RTO Services" subtitle="Comprehensive range of transport services offered by the Office of the Transport Commissioner, Puducherry." />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          {serviceCategories.map((cat, i) => (
            // ── Category section: title with accent bar, then a responsive card grid ──
            <FadeInSection key={i} delay={i * 100}>
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary-light rounded-full" />
                  <h2 className="text-2xl font-bold text-primary">{cat.title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.services.map((svc, j) => {
                    const Icon = svc.icon;
                    return (
                      // ── Service Card: links to the service page, has a gradient top border,
                      //     icon, title, and description. Hover lifts the card up for affordance. ──
                      <Link key={j} href={svc.href} className="no-underline group block">
                        <Card className="h-full border-0 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                          <div className="h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent group-hover:from-primary group-hover:via-primary-light transition-all duration-300" />
                          <CardHeader className="flex flex-row items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                              <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                              <CardTitle className="text-base group-hover:text-primary transition-colors">{svc.name}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <CardDescription>{svc.desc}</CardDescription>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>
    </>
  );
}
