# Directory Routes

**File:** `src/routes/directory.ts`

## Purpose
Provides RTO office directory listing with contact details and services offered.

## Endpoints
- `GET /api/directory` - List all RTO offices (PY, KKL, Mahe, Yanam)
- `GET /api/directory/:id` - Get specific office details

## Key Decisions
- Four offices match the actual Puducherry UT jurisdiction
- Static seed data for Phase 1; will migrate to DB

## Related Files
- `src/index.ts` - Mounts routes at `/api/directory`
