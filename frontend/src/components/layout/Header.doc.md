# Header Component (shadcn/ui)

**File:** `src/components/layout/Header.tsx`

## Purpose
Site header with logo, title, language switcher, sign-in button (shadcn Button), and navigation.

## Components
- Logo + site title
- Language selector (English/Tamil/French)
- shadcn/ui Button for "Sign In"
- Navbar sub-component

## Key Decisions
- Uses `<Button variant="secondary">` from shadcn/ui for the sign-in button
- Language options reflect Puducherry UT's official languages (GIGW 3.0)

## Accessibility
- Skip-to-content link (first focusable element)
- Language selector with `aria-label`
- Semantic `<header>` element

## Related Files
- `Navbar.tsx`
- `Footer.tsx`
- `components/ui/button.tsx`
