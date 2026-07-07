# Services Page

**File:** `src/app/services/page.tsx`

## Purpose
Lists all RTO services grouped by category with descriptions and links.

## Key Decisions
- 3 categories: Registration, Licensing, Online Tools
- 11 services listed with hover cards for visual feedback
- Static Phase 1; dynamic from `/api/services` in Phase 2

## Related Files
- `backend/src/routes/services.ts` - API endpoint
