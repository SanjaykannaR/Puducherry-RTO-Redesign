import type { Metadata } from 'next';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms and conditions for using the Puducherry RTO portal.',
};

// ── Terms of use ──
// Each clause is presented as an independent section with a numbered circle that
// makes the document feel structured and scannable, unlike a wall of legal text.
const terms = [
  { title: 'Acceptance of Terms', desc: 'By accessing and using this portal, you agree to comply with these terms and conditions. If you do not agree with any part of these terms, please do not use our services.' },
  { title: 'User Responsibilities', desc: 'You are responsible for providing accurate and complete information when using our services. Any false or misleading information may result in rejection of applications or legal action.' },
  { title: 'Service Availability', desc: 'We strive to ensure 24/7 availability of our online services. However, temporary disruptions may occur due to maintenance, technical issues, or factors beyond our control.' },
  { title: 'Intellectual Property', desc: 'All content on this portal, including text, graphics, logos, and software, is the property of the Office of the Transport Commissioner, Puducherry, unless otherwise stated.' },
  { title: 'Limitation of Liability', desc: 'The Office of the Transport Commissioner shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use this portal.' },
  { title: 'Governing Law', desc: 'These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of courts in Puducherry.' },
];

export default function TermsPage() {
  return (
    <>
      <PageHero title="Terms of Use" subtitle="Please read these terms carefully before using our services." />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="space-y-4">
            {terms.map((t, i) => (
              <FadeInSection key={i} delay={i * 60}>
                {/* ── Terms card ── */}
                {/* A lighter card style (shadow-sm instead of shadow-md) is used here because
                    these are dense text items. A numbered circle on the left anchors each clause. */}
                <div className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="p-5">
                    <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</span>
                      {t.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed ml-8">{t.desc}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
          <FadeInSection>
            <p className="text-xs text-muted-foreground mt-8 border-t pt-4">Last updated: July 2026. These terms may be updated without prior notice.</p>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
