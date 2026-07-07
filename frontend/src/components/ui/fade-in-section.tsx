'use client';

import { useState, useCallback } from 'react';

/**
 * Scroll-reveal wrapper that fades in its children when they enter the viewport.
 * Uses IntersectionObserver for performant detection without scroll listeners.
 * The delay prop enables staggered animations when multiple sections appear together.
 */
export default function FadeInSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  // ── useCallback ensures the observer is created only once per mount ──
  // Using a callback ref instead of useRef + useEffect avoids the extra render cycle.
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }    // Trigger when 10 % of the element is visible
    );
    observer.observe(node);
  }, []);

  return (
    <div
      ref={ref}
      // ── Two-state animation: invisible + shifted down → visible + normal position ──
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
