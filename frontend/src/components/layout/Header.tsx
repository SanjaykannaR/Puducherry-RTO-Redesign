import Link from 'next/link';
import Navbar from './Navbar';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-primary text-white shadow-md print:hidden">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-3 no-underline text-white">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm">RTO</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">
                Puducherry RTO
              </h1>
              <p className="text-xs text-blue-200">
                Office of the Transport Commissioner
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <select
              className="bg-primary-light text-white text-sm rounded px-2 py-1 border border-blue-400"
              aria-label="Select language"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="fr">Français</option>
            </select>
            <Link href="/login" className="no-underline">
              <Button variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white border-0">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        <Navbar />
      </div>
    </header>
  );
}
