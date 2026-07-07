import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
// ── Icons give each section a recognisable visual anchor ──
import { Building2, Target, Eye, Shield, CalendarDays } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Puducherry RTO - history, mission, vision, and leadership.',
};

// ── Jurisdiction regions ──
// The Union Territory spans four distinct geographic areas; listing them makes the
// organisational scope clear to citizens.
const regions = [
  { title: 'Puducherry Region', desc: 'Main office at S.V. Patel Salai covering Puducherry and surrounding areas.' },
  { title: 'Karaikal Region', desc: 'Regional office serving Karaikal district.' },
  { title: 'Mahe Region', desc: 'Regional office serving Mahe district.' },
  { title: 'Yanam Region', desc: 'Regional office serving Yanam district.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero title="About Puducherry RTO" subtitle="Learn about our history, mission, and commitment to citizen-centric transport services." />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* ── Overview section ── */}
          {/* Two side-by-side cards: one describes the department's legal mandate, the other
              provides historical context. The gradient bar on each card ties them visually. */}
          <FadeInSection>
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary-light rounded-full" />
                <h2 className="text-2xl font-bold text-primary">Overview</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                      The Office of the Transport Commissioner, Puducherry, is the nodal agency responsible for
                      enforcement of motor vehicle laws, registration of vehicles, licensing of drivers, and
                      collection of road taxes across the Union Territory of Puducherry, including Karaikal,
                      Mahe, and Yanam regions.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-md overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                      Established in 1963, the department has evolved significantly, embracing digital
                      transformation to provide citizen-centric services with transparency and efficiency.
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-primary">
                      <CalendarDays className="w-4 h-4" />
                      <span>Serving since 1963</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </FadeInSection>

          {/* ── Mission & Vision cards ── */}
          {/* Two cards with distinct accent colours (blue for mission, amber for vision) to
              differentiate the concepts. Each has an icon header for quick scanning. */}
          <FadeInSection delay={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-500" />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
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
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-amber-500" />
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
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
          </FadeInSection>

          {/* ── Jurisdiction grid ── */}
          {/* Lists the four regions under Puducherry RTO's purview. Each card includes a
              building icon and a short description so citizens know which office to approach. */}
          <FadeInSection delay={200}>
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary-light rounded-full" />
                <h2 className="text-2xl font-bold text-primary">Jurisdiction</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regions.map((r) => (
                  <Card key={r.title} className="border-0 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-primary shrink-0" />
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
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
