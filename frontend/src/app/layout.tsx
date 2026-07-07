import type { Metadata } from 'next';
import LayoutWrapper from './layout-wrapper';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import './globals.css';

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
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LanguageProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
