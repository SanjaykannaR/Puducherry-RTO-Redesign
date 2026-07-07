'use client';

import { Shield } from 'lucide-react';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
}

export default function PageHero({ title, subtitle, badge = 'Government of Puducherry', children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden" aria-label="Page header">
      <div className="relative h-[280px] md:h-[340px] bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-3xl">
            {badge && (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm rounded-full px-4 py-1.5 mb-4 border border-white/10">
                <Shield className="w-3.5 h-3.5" />
                <span>{badge}</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-lg">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base sm:text-lg text-blue-100 mt-2 max-w-2xl drop-shadow">
                {subtitle}
              </p>
            )}
            {children && <div className="mt-4">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
