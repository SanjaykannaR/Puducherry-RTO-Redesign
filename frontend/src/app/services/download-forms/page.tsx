'use client';

import RequireAuth from '@/components/auth/RequireAuth';
import PageHero from '@/components/ui/page-hero';
import FadeInSection from '@/components/ui/fade-in-section';
import { Download, FileText, Car, FileSignature, ClipboardCheck, Shield } from 'lucide-react';
import Link from 'next/link';

const formCategories = [
  {
    title: 'Registration Forms',
    forms: [
      { name: 'Form 20', desc: 'Application for registration of motor vehicle', icon: Car },
      { name: 'Form 21', desc: 'Sale certificate from dealer', icon: FileSignature },
      { name: 'Form 22', desc: 'Road worthiness certificate', icon: ClipboardCheck },
      { name: 'Form 29', desc: 'Notice of transfer of ownership', icon: FileText },
      { name: 'Form 30', desc: 'Report of transfer of ownership', icon: FileText },
    ],
  },
  {
    title: 'License Forms',
    forms: [
      { name: 'Form 1', desc: "Application for learner's license", icon: FileText },
      { name: 'Form 2', desc: "Application for driving license", icon: FileText },
      { name: 'Form 3', desc: 'Application for international permit', icon: FileText },
      { name: 'Form 4', desc: 'Application for renewal of license', icon: FileText },
    ],
  },
  {
    title: 'Other Forms',
    forms: [
      { name: 'Form 35', desc: 'Application for duplicate RC', icon: FileText },
      { name: 'Form 7', desc: 'Application for duplicate license', icon: FileText },
      { name: 'Form 14', desc: 'Application for registration of trailer', icon: Car },
    ],
  },
];

export default function DownloadFormsPage() {
  return (
    <RequireAuth>
      <>
        <PageHero title="Download Forms" subtitle="Download RTO application forms in PDF format for various services" />
      <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-12">
          {formCategories.map((cat, i) => (
            <FadeInSection key={i} delay={i * 100}>
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary-light rounded-full" />
                  <h2 className="text-2xl font-bold text-primary">{cat.title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cat.forms.map((form, j) => {
                    const Icon = form.icon;
                    return (
                      <div key={j} className="bg-white rounded-xl border-0 shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer">
                        <div className="h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent group-hover:from-primary group-hover:via-primary-light transition-all" />
                        <div className="p-5">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center"><Icon className="h-4 w-4 text-primary" /></div>
                            <h3 className="font-semibold text-sm">{form.name}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground ml-12">{form.desc}</p>
                          <div className="ml-12 mt-2">
                            <span className="text-xs text-primary flex items-center gap-1"><Download className="w-3 h-3" />Download PDF</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeInSection>
          ))}
          <FadeInSection delay={300}>
            <p className="text-xs text-muted-foreground border-t pt-4">Forms are in PDF format. Download and print for offline submission at your nearest RTO office.</p>
          </FadeInSection>
        </div>
      </section>
      </>
    </RequireAuth>
  );
}
