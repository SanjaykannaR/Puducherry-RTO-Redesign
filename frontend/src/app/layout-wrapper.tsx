'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === '/login' || pathname === '/register';

  return (
    <>
      {!isAuth && <Header />}
      <main id="main-content" className="flex-1" role="main">{children}</main>
      {!isAuth && <Footer />}
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
