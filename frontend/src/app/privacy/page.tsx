import type { Metadata } from 'next';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import { Shield, Lock, Eye, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy of Puducherry RTO portal - how we collect, use, and protect your personal information.',
};

const sections = [
  { title: 'Information We Collect', desc: 'We collect personal information including name, address, contact details, vehicle details, and driving license information when you use our services. This information is collected via online forms and documents you submit.', icon: Database },
  { title: 'How We Use Your Information', desc: 'Your information is used solely for processing your RTO service requests, verifying identity, maintaining records, and communicating with you about your applications. We do not use your data for any other purpose.', icon: Eye },
  { title: 'Data Protection', desc: 'We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. All data is encrypted during transmission.', icon: Lock },
  { title: 'Information Sharing', desc: 'Your information is shared only with authorized government departments and agencies as required by law. We do not sell, trade, or rent your personal information to third parties.', icon: Shield },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Privacy Policy" subtitle="Your privacy matters. Learn how we handle your personal information." />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="space-y-6">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeInSection key={i} delay={i * 80}>
                  <div className="bg-white rounded-xl border-0 shadow-md overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                        <h3 className="font-semibold text-lg">{s.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed ml-13">{s.desc}</p>
                    </div>
                  </div>
                </FadeInSection>
              );
            })}
          </div>
          <FadeInSection>
            <p className="text-xs text-muted-foreground mt-8 border-t pt-4">Last updated: July 2026. This privacy policy may be updated periodically. Please check this page for any changes.</p>
          </FadeInSection>
        </div>
      </section>
    </>
  );
}
