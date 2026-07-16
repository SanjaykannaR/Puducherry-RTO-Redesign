// ── Root Layout ──
// This is the top-most layout in the Next.js app router hierarchy.
// It sets up global providers (auth, i18n), fonts, metadata, and the
// full-page flex structure so the footer stays at the bottom.

import type { Metadata } from 'next';
import LayoutWrapper from './layout-wrapper';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import './globals.css';

// ── SEO / Social Metadata ──
// Default title and template for nested pages; keywords help regional search discovery.
export const metadata: Metadata = {
  title: {
    default: 'Puducherry RTO - Office of the Transport Commissioner',
    template: '%s | Puducherry RTO',
  },
  description: 'Official portal of the Office of the Transport Commissioner, Puducherry. Access RTO services, book appointments, check vehicle status, and more.',
  keywords: ['RTO', 'Puducherry', 'Transport', 'Vehicle Registration', 'Driving License', 'Pondicherry'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // html is marked h-full + scroll-smooth for consistent full-height pages and smooth anchor scrolling
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <head>
            {/* ── Fonts ── */}
        {/* Preconnect to Google Fonts CDN to reduce latency; Noto Sans for Latin text, */}
        {/* Noto Sans Tamil for Tamil-locale rendering. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;700&display=swap" rel="stylesheet" />
        {/* ── Favicon ── */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      {/* ── Body ── */}
      {/* min-h-full + flex-col ensures the content area (flex-1 in LayoutWrapper) expands */}
      {/* to push the footer down even on short pages. */}
      <body className="min-h-full flex flex-col">
        {/* AuthProvider must be outermost because many children (including LanguageProvider) may need auth state. */}
        <AuthProvider>
          <LanguageProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
