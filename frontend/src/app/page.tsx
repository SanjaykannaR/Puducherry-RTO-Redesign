'use client';

// ── Imports ──

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FadeInSection from '@/components/ui/fade-in-section';
import { Car, FileText, Calendar, Calculator, Search, ClipboardList, ArrowRight, ChevronLeft, ChevronRight, Shield, Clock, Award, Users, Building2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/i18n/translations';

// ── Hero Slides ──
// Background images shown in the auto-rotating hero banner. Each slide is an
// ambient road/transport photo that reinforces the "RTO" identity visually.
const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1755659027604-cde43a75db0f?q=80&w=2070&auto=format&fit=crop',
    alt: 'Traffic rules road signs showing speed limit and no honking',
  },
  {
    image: 'https://images.unsplash.com/photo-1566440450530-5989804251bf?q=80&w=2070&auto=format&fit=crop',
    alt: 'Motorcycle rider wearing helmet for road safety',
  },
  {
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=2065&auto=format&fit=crop',
    alt: 'Highway traffic and road safety driving scene',
  },
];

// ── Quick Services ──
// The six highest-traffic services surfaced on the homepage so citizens can jump
// straight to what they need without navigating through menus.
const quickServices = [
  { key: 'services.vr', descKey: 'services.vr.desc', href: '/services/vehicle-registration', icon: Car },
  { key: 'services.dl', descKey: 'services.dl.desc', href: '/services/driving-license', icon: FileText },
  { key: 'services.appt', descKey: 'services.appt.desc', href: '/services/appointment', icon: Calendar },
  { key: 'services.calc', descKey: 'services.calc.desc', href: '/services/fee-calculator', icon: Calculator },
  { key: 'services.track', descKey: 'services.track.desc', href: '/services/application-status', icon: Search },
  { key: 'services.challan', descKey: 'services.challan.desc', href: '/services/challan', icon: ClipboardList },
];

// ── Highlights / Statistics ──
// Social-proof metrics displayed as a simple 4-column grid to build trust
// and demonstrate the portal's adoption across Puducherry.
const highlights = [
  { value: '200+', key: 'highlights.transactions', icon: Shield },
  { value: '4', key: 'highlights.offices', icon: Building2 },
  { value: '99%', key: 'highlights.digital', icon: Award },
  { value: '50K+', key: 'highlights.users', icon: Users },
];

// ── Home Page ──

export default function Home() {
  const { locale } = useLanguage();

  // ── Hero Slider State ──
  const [slideIdx, setSlideIdx] = useState(0);

  // ── Auto-Play ──
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((i) => (i + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideIdx]);

  // ── Manual Navigation ──
  const goToSlide = (i: number) => {
    setSlideIdx(i);
  };

  return (
    <>
      {/* ── Hero Banner ── */}
      {/* Full-width image carousel with gradient overlays for text legibility. */}
      {/* Only the active slide is visible; inactive slides are opacity-0 + slightly scaled for a subtle zoom effect. */}
      <section className="relative overflow-hidden" aria-label="Hero banner">
        <div className="relative h-[500px] md:h-[600px]">
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                i === slideIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              aria-hidden={i !== slideIdx}
            />
          ))}
          {/* Dark gradient overlays: left-to-right for text contrast, bottom-to-top for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* ── Hero Text + CTAs ── */}
        {/* Positioned over the image with a max-width container so text reflows neatly on mobile */}
        <div className="absolute inset-0 flex items-center pb-16">
          <div className="mx-auto px-4 sm:px-6 w-full">
            <div className="max-w-3xl pl-6 md:pl-12 lg:pl-16">
              {/* Government badge — subtle backdrop blur makes it feel modern */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm rounded-full px-4 py-1.5 mb-4 border border-white/10">
                <Shield className="w-3.5 h-3.5" />
                <span>Government of Puducherry</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 text-white drop-shadow-lg">
                {t('hero.title', locale)}
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl drop-shadow">
                {t('hero.subtitle', locale)}
              </p>
              <div className="flex flex-wrap gap-3">
                {/* Primary CTA — amber button stands out against the dark overlay */}
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 text-sm font-semibold transition-all shadow-lg hover:shadow-amber-500/30 hover:scale-105 no-underline"
                >
                  {t('hero.cta.primary', locale)}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {/* Secondary CTA — ghost-style button for the appointment booking flow */}
                <Link
                  href="/services/appointment"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-6 py-3 text-sm font-medium transition-all hover:scale-105 no-underline"
                >
                  <Calendar className="w-4 h-4" />
                  {t('hero.cta.secondary', locale)}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Slide Dots ── */}
        {/* Accessible dot indicators; the active dot stretches wider for a unique visual cue */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === slideIdx ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* ── Prev / Next Arrows ── */}
        {/* Hidden until hovered so they don't distract from the visual; positioned at the vertical center */}
        <button
          onClick={() => goToSlide((slideIdx - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => goToSlide((slideIdx + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all opacity-0 hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* ── Highlights / Statistics ── */}
      {/* FadeInSection triggers the CSS animation on scroll; the 2x2 (mobile) / 4-col (desktop) grid */}
      {/* shows key metrics to reinforce credibility. Each icon sits in a subtle rounded box. */}
      <FadeInSection>
        <section className="bg-white border-b border-gray-100" aria-label="Key statistics">
          <div className="mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {highlights.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.key} className="text-center group cursor-default">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-3 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    {/* Value is hard-coded (not translated) because numbers are locale-independent */}
                    <p className="text-3xl font-bold text-primary">{h.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t(h.key, locale)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ── Quick Services ── */}
      {/* A 1/2/3-column responsive card grid. Each card links to a dedicated service page. */}
      {/* Cards lift on hover with a subtle shadow + border tint to indicate interactivity. */}
      <section className="py-16 md:py-24" aria-label="Quick services" style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="mx-auto px-4 sm:px-6">
          <FadeInSection>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-primary/5 text-primary text-sm font-medium rounded-full px-4 py-1.5 mb-3">
                <Clock className="w-3.5 h-3.5" />
                Quick Access
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary">{t('services.title', locale)}</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Access the most popular RTO services online</p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickServices.map((service, i) => {
              const Icon = service.icon;
              // Staggered fade-in: each card appears 100 ms later than the previous
              return (
                <FadeInSection key={service.key} delay={i * 100}>
                  <Link href={service.href} className="no-underline group block">
                    <Card className="h-full transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 cursor-pointer border border-transparent">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-xl bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center mb-2 transition-colors">
                          <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                          {t(service.key, locale)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{t(service.descKey, locale)}</CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Call-to-Action ── */}
      {/* Dark gradient section with a subtle dot-grid pattern in the background. */}
      {/* Primarily targets citizens who haven't yet engaged — invites them to contact the office. */}
      <FadeInSection>
        <section className="relative overflow-hidden" aria-label="Call to action">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-[#0a2463]" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />
          <div className="relative mx-auto px-4 sm:px-6 py-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('cta.title', locale)}</h2>
            <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">{t('cta.desc', locale)}</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 text-sm font-semibold transition-all shadow-lg hover:shadow-amber-500/30 hover:scale-105 no-underline"
            >
              {t('cta.button', locale)}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </FadeInSection>
    </>
  );
}
