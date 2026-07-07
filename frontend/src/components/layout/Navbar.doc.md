# Navbar Component

**File:** `src/components/layout/Navbar.tsx`

## Purpose
Main navigation bar with responsive mobile hamburger menu and active link highlighting.

## Features
- 6 nav links: Home, About Us, Services, Directory, Fees, Contact
- Active page highlighting using `usePathname()`
- Mobile hamburger toggle with `aria-expanded`
- Proper `aria-label="Main navigation"`

## Key Decisions
- Client component (`'use client'`) for pathname tracking and menu state
- Mobile-first: hidden on mobile with hamburger, visible on `md:` breakpoint
- Uses Next.js `<Link>` for client-side navigation

## Related Files
- `Header.tsx` - Parent component
