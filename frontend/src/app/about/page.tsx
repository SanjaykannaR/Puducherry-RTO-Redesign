import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Target, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Puducherry RTO - history, mission, vision, and leadership.',
};

const regions = [
  { title: 'Puducherry Region', desc: 'Main office at S.V. Patel Salai covering Puducherry and surrounding areas.' },
  { title: 'Karaikal Region', desc: 'Regional office serving Karaikal district.' },
  { title: 'Mahe Region', desc: 'Regional office serving Mahe district.' },
  { title: 'Yanam Region', desc: 'Regional office serving Yanam district.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-primary mb-8">About Puducherry RTO</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-primary mb-4">Overview</h2>
        <div className="prose max-w-none text-muted-foreground space-y-4">
          <p>
            The Office of the Transport Commissioner, Puducherry, is the nodal agency responsible for
            enforcement of motor vehicle laws, registration of vehicles, licensing of drivers, and
            collection of road taxes across the Union Territory of Puducherry, including Karaikal,
            Mahe, and Yanam regions.
          </p>
          <p>
            Established in 1963, the department has evolved significantly, embracing digital
            transformation to provide citizen-centric services with transparency and efficiency.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" />
              <CardTitle>Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              To provide efficient, transparent, and citizen-centric transport services through
              innovative technology, ensuring road safety and regulatory compliance.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-primary" />
              <CardTitle>Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              A safe, sustainable, and digitally empowered transport ecosystem for the Union Territory
              of Puducherry.
            </p>
          </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-primary mb-4">Jurisdiction</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regions.map((r) => (
            <Card key={r.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">{r.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
