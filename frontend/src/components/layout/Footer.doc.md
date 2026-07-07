# Footer Component

**File:** `src/components/layout/Footer.tsx`

## Purpose
Site footer with Quick Links, Citizen Services, Contact info, Social media, and legal links.

## Sections
1. Quick Links - Main navigation
2. Citizen Services - Key service links
3. Contact - Address, phone, email
4. Social Media - Facebook, Twitter, YouTube

## Accessibility
- `<footer role="contentinfo">` semantic element
- Heading hierarchy preserved
- Proper `<address>` element for contact info
- `aria-label` on social media links

## Key Decisions
- 4-column grid layout on desktop, stacked on mobile
- Legal links: Accessibility, Privacy, Terms, Sitemap (GIGW 3.0 requirement)
- "Powered by OpenCode" attribution
- Print hidden via `print:hidden`

## Related Files
- `Header.tsx` - Matching header design
