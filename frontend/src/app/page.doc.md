# Home Page (shadcn/ui)

**File:** `src/app/page.tsx`

## Purpose
Portal landing page with hero banner, key statistics, service quick-links, and CTA. Updated to use shadcn/ui Card components and Lucide SVG icons.

## Components
- **Hero** - Gradient banner with CTA buttons
- **Highlights** - Key metrics (200+ transactions, 4 offices, 99% digital, 50K+ users)
- **Services Grid** - 6 Card components with icons (Car, FileText, Calendar, Calculator, Search, ClipboardList)
- **CTA Section** - Contact call-to-action

## Key Changes (Phase 1.5)
- Replaced emoji icons with Lucide SVG icons
- shadcn/ui Card components for service cards
- CardHeader + CardTitle + CardDescription pattern
- Muted colors via `text-muted-foreground`

## Related Files
- `components/layout/Header.tsx`
- `components/ui/card.tsx`
