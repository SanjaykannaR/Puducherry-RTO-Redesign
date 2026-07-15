'use client';

// ── Imports ──

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';

// ── Client-Side Layout Wrapper ──
// Injects the shared Header/Footer shell around page content.
// Auth pages (login/register) get a clean, distraction-free layout so
// the user's attention stays on the form — no nav bar, no footer links.
// The Toaster is placed here (not inside a child page) so that toasts
// can be triggered from any component including the Header.
export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === '/login' || pathname === '/register';   // Hide shell on auth routes

  return (
    <>
      {/* Skip-to-content link — visible only on keyboard focus for screen reader / keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      {!isAuth && <Header />}
      <main id="main-content" className="flex-1" role="main">{children}</main>
      {!isAuth && <Footer />}
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
