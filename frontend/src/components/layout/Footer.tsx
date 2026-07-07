import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-white print:hidden" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-accent mb-3">Quick Links</h3>
            <ul className="space-y-2 list-none m-0 p-0">
              <li><Link href="/about" className="text-blue-200 hover:text-white text-sm no-underline">About Us</Link></li>
              <li><Link href="/services" className="text-blue-200 hover:text-white text-sm no-underline">Services</Link></li>
              <li><Link href="/directory" className="text-blue-200 hover:text-white text-sm no-underline">Directory</Link></li>
              <li><Link href="/fares" className="text-blue-200 hover:text-white text-sm no-underline">Fee Structure</Link></li>
              <li><Link href="/contact" className="text-blue-200 hover:text-white text-sm no-underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-accent mb-3">Citizen Services</h3>
            <ul className="space-y-2 list-none m-0 p-0">
              <li><Link href="/services/vehicle-registration" className="text-blue-200 hover:text-white text-sm no-underline">Vehicle Registration</Link></li>
              <li><Link href="/services/driving-license" className="text-blue-200 hover:text-white text-sm no-underline">Driving License</Link></li>
              <li><Link href="/services/appointment" className="text-blue-200 hover:text-white text-sm no-underline">Book Appointment</Link></li>
              <li><Link href="/services/fee-calculator" className="text-blue-200 hover:text-white text-sm no-underline">Fee Calculator</Link></li>
              <li><Link href="/services/application-status" className="text-blue-200 hover:text-white text-sm no-underline">Track Application</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-accent mb-3">Contact</h3>
            <address className="not-italic text-sm text-blue-200 space-y-1">
              <p>No. 1, S.V. Patel Salai,</p>
              <p>Puducherry - 605001</p>
              <p>Phone: +91 413 222 1234</p>
              <p>Email: rto.py@gov.in</p>
            </address>
          </div>
          <div>
            <h3 className="font-semibold text-accent mb-3">Follow Us</h3>
            <p className="text-sm text-blue-200 mb-3">Stay connected for updates and alerts.</p>
            <div className="flex gap-3">
              <a href="#" className="bg-blue-700 hover:bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center" aria-label="Facebook">
                <span className="text-xs">FB</span>
              </a>
              <a href="#" className="bg-blue-700 hover:bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center" aria-label="Twitter">
                <span className="text-xs">TW</span>
              </a>
              <a href="#" className="bg-blue-700 hover:bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center" aria-label="YouTube">
                <span className="text-xs">YT</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-blue-700 mt-6 pt-4 text-center text-xs text-blue-300">
          <p>&copy; {new Date().getFullYear()} Office of the Transport Commissioner, Puducherry. All rights reserved.</p>
          <p className="mt-1">
            <Link href="/accessibility" className="text-blue-200 hover:text-white no-underline mx-2">Accessibility</Link>
            <span aria-hidden="true">|</span>
            <Link href="/privacy" className="text-blue-200 hover:text-white no-underline mx-2">Privacy Policy</Link>
            <span aria-hidden="true">|</span>
            <Link href="/terms" className="text-blue-200 hover:text-white no-underline mx-2">Terms of Use</Link>
            <span aria-hidden="true">|</span>
            <Link href="/sitemap" className="text-blue-200 hover:text-white no-underline mx-2">Sitemap</Link>
          </p>
          <p className="mt-1">
            Powered by <a href="https://opencode.ai" className="text-blue-200 hover:text-white" target="_blank" rel="noopener noreferrer">OpenCode</a> Multi-Agent System
          </p>
        </div>
      </div>
    </footer>
  );
}
