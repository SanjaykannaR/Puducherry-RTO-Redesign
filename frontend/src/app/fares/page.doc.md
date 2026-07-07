# Fees & Fares Page

**File:** `src/app/fares/page.tsx`

## Purpose
Displays official RTO fee structure in categorized tables for all services.

## Key Decisions
- Native HTML tables for accessibility (screen reader friendly)
- 4 categories: Driving License, Registration, Permits, Road Tax
- Indian number formatting (`toLocaleString('en-IN')`)
- Disclaimer note about fee accuracy

## Related Files
- `backend/src/routes/fares.ts` - API endpoint for fee data
