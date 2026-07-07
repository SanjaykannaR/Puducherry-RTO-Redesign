# Root Layout

**File:** `src/app/layout.tsx`

## Purpose
Root HTML layout wrapping all pages. Provides consistent Header, Footer, and global styles.

## Key Decisions
- Noto Sans + Noto Sans Tamil fonts for bilingual support (GIGW 3.0)
- Skip-to-content link for keyboard/assistive tech users (WCAG 2.1 AA)
- Language switcher in header for English/Tamil/French (UT's official languages)
- Blue #0B3D91 primary color (DBIM color group)

## Accessibility
- Skip navigation link (`#main-content`)
- Semantic landmarks: `<header>`, `<main role="main">`, `<footer role="contentinfo">`
- Proper heading hierarchy
- `aria-label` on interactive elements

## Related Files
- `components/layout/Header.tsx`, `Navbar.tsx`, `Footer.tsx`
- `globals.css` - Theme variables
