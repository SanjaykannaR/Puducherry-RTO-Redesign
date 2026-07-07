import type { Metadata } from 'next';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Directory',
  description: 'Puducherry RTO office directory with contact details and services.',
};

const offices = [
  {
    name: 'Puducherry RTO Main Office',
    address: 'No. 1, S.V. Patel Salai, Puducherry - 605001',
    phone: '+91 413 222 1234',
    email: 'rto.py@gov.in',
    services: ['Vehicle Registration', 'Driving License', 'Permits', 'Tax Collection'],
    hours: '10:00 AM - 5:00 PM',
  },
  {
    name: 'Karaikal RTO',
    address: 'Government Complex, Karaikal - 609602',
    phone: '+91 4368 222 456',
    email: 'rto.kkl@gov.in',
    services: ['Vehicle Registration', 'Driving License', 'Tax Collection'],
    hours: '10:00 AM - 5:00 PM',
  },
  {
    name: 'Mahe RTO',
    address: 'RTO Office, Mahe - 673310',
    phone: '+91 490 233 789',
    email: 'rto.mahe@gov.in',
    services: ['Vehicle Registration', 'Driving License'],
    hours: '10:00 AM - 4:30 PM',
  },
  {
    name: 'Yanam RTO',
    address: 'RTO Office, Yanam - 533464',
    phone: '+91 884 232 012',
    email: 'rto.yanam@gov.in',
    services: ['Vehicle Registration', 'Driving License'],
    hours: '10:00 AM - 4:30 PM',
  },
];

export default function DirectoryPage() {
  return (
    <>
      <PageHero title="RTO Directory" subtitle="Find contact information and services offered at RTO offices across Puducherry, Karaikal, Mahe, and Yanam." />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="space-y-6">
            {offices.map((office, i) => (
              <FadeInSection key={i} delay={i * 100}>
                <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-primary mb-4">{office.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        <p className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                            <MapPin className="h-4 w-4 text-primary" />
                          </span>
                          <span>{office.address}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                            <Phone className="h-4 w-4 text-primary" />
                          </span>
                          <span>{office.phone}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                            <Mail className="h-4 w-4 text-primary" />
                          </span>
                          <span>{office.email}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                            <Clock className="h-4 w-4 text-primary" />
                          </span>
                          <span>{office.hours}</span>
                        </p>
                      </div>
                      <div>
                        <p className="font-medium mb-2 text-primary">Services Offered:</p>
                        <div className="flex flex-wrap gap-2">
                          {office.services.map((s, j) => (
                            <span key={j} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/5 text-primary border border-primary/10">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
