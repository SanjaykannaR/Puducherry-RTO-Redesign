import type { Metadata } from 'next';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import { Eye, Ear, Keyboard, Monitor } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'Accessibility features of Puducherry RTO portal - committed to WCAG 2.1 AA standards.',
};

const features = [
  { title: 'Screen Reader Support', desc: 'All content is compatible with screen readers. Skip-to-content links and proper ARIA labels are provided throughout the portal.', icon: Ear },
  { title: 'Keyboard Navigation', desc: 'Full keyboard navigation support. Use Tab, Enter, and arrow keys to navigate all interactive elements without a mouse.', icon: Keyboard },
  { title: 'High Contrast Mode', desc: 'The portal maintains sufficient color contrast ratios for text and interactive elements, ensuring readability for visually impaired users.', icon: Eye },
  { title: 'Responsive Design', desc: 'The portal is fully responsive and works across devices of all screen sizes, from mobile phones to desktop monitors.', icon: Monitor },
];

export default function AccessibilityPage() {
  return (
    <>
      <PageHero title="Accessibility" subtitle="We are committed to making our portal accessible to all citizens in accordance with GIGW 3.0 and WCAG 2.1 AA standards." />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeInSection key={i} delay={i * 80}>
                  <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden h-full">
                    <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-primary" /></div>
                      <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </FadeInSection>
              );
            })}
          </div>
          <FadeInSection>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="font-semibold mb-2">Report Accessibility Issues</h3>
              <p className="text-sm text-muted-foreground">If you encounter any accessibility barriers while using this portal, please contact us at <strong>rto.py@gov.in</strong> or call <strong>+91 413 222 1234</strong>.</p>
            </div>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
