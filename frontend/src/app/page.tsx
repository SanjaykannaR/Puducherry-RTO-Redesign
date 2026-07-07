import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, FileText, Calendar, Calculator, Search, ClipboardList } from 'lucide-react';

const quickServices = [
  { title: 'Vehicle Registration', desc: 'Register new or used vehicles', href: '/services/vehicle-registration', icon: Car },
  { title: 'Driving License', desc: "Apply for learner's or permanent license", href: '/services/driving-license', icon: FileText },
  { title: 'Book Appointment', desc: 'Schedule your RTO visit', href: '/services/appointment', icon: Calendar },
  { title: 'Fee Calculator', desc: 'Calculate service fees', href: '/services/fee-calculator', icon: Calculator },
  { title: 'Track Application', desc: 'Check application status', href: '/services/application-status', icon: Search },
  { title: 'Challan Payment', desc: 'View and pay traffic challans', href: '/services/challan', icon: ClipboardList },
];

const highlights = [
  { title: '200+', desc: 'Daily Transactions' },
  { title: '4', desc: 'Regional Offices' },
  { title: '99%', desc: 'Digital Service Rate' },
  { title: '50K+', desc: 'Registered Users' },
];

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary to-primary-dark text-blue-50" aria-label="Hero banner">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-white">
              Welcome to Puducherry RTO Portal
            </h1>
            <p className="text-lg md:text-xl text-blue-200 mb-8">
              Your gateway to efficient, transparent, and citizen-centric transport services across the Union Territory of Puducherry.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/services"
                className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 text-sm font-medium transition-colors no-underline"
              >
                Explore Services
              </Link>
              <Link
                href="/services/appointment"
                className="inline-flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3 text-sm font-medium transition-colors no-underline"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b" aria-label="Key statistics">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {highlights.map((h) => (
              <div key={h.title}>
                <p className="text-3xl font-bold text-primary">{h.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-12" aria-label="Quick services">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-primary mb-8 text-center">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickServices.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.title} href={service.href} className="no-underline">
                  <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 group cursor-pointer">
                    <CardHeader>
                      <Icon className="h-8 w-8 text-primary group-hover:text-primary/80" />
                      <CardTitle className="text-foreground group-hover:text-primary">
                        {service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{service.desc}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-primary text-blue-50 py-12" aria-label="Call to action">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Need Assistance?</h2>
          <p className="text-blue-200 mb-6">
            Contact our helpdesk or visit the nearest RTO office for support.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 text-sm font-medium transition-colors no-underline"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
