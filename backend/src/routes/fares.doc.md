# Fares Routes

**File:** `src/routes/fares.ts`

## Purpose
Provides official fee structure for all RTO services categorized by service type.

## Endpoints
- `GET /api/fares` - Returns complete fee structure

## Key Decisions
- Fees based on official Puducherry RTO rates
- Grouped into 4 categories: Driving License, Vehicle Registration, Permits, Road Tax
- Phase 1 uses static data; will be DB-backed with admin editing capability in Phase 6

## Related Files
- `src/index.ts` - Mounts routes at `/api/fares`
- Frontend `src/app/fares/page.tsx` - Displays fee tables
