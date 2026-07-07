import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, FileText, Calendar, Calculator, Search, ClipboardList, Activity, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Puducherry RTO services - vehicle registration, driving license, appointments, and more.',
};

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
      { name: 'Vehicle Status', href: '/services/vehicle-status', desc: 'Check RC, insurance, PUC, and fitness status.', icon: Activity },
      { name: 'Download Forms', href: '/services/download-forms', desc: 'Download RTO application forms.', icon: Download },
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-4">RTO Services</h1>
      <p className="text-muted-foreground mb-8">
        Comprehensive range of transport services offered by the Office of the Transport Commissioner, Puducherry.
      </p>
      {serviceCategories.map((cat, i) => (
        <section key={i} className="mb-10">
          <h2 className="text-xl font-semibold text-primary mb-4">{cat.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cat.services.map((svc, j) => {
              const Icon = svc.icon;
              return (
                <Link key={j} href={svc.href} className="no-underline">
                  <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 group cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-3">
                      <Icon className="h-6 w-6 text-primary shrink-0" />
                      <div>
                        <CardTitle className="text-base group-hover:text-primary">{svc.name}</CardTitle>
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
        </section>
      ))}
    </div>
  );
}
