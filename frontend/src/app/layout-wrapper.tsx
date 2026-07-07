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
      {!isAuth && <Header />}
      <main id="main-content" className="flex-1" role="main">{children}</main>
      {!isAuth && <Footer />}
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
