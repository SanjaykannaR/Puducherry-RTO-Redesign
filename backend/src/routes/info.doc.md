# Info Routes

**File:** `src/routes/info.ts`

## Purpose
Provides static information endpoints for the portal: About page data and FAQ content.

## Endpoints
- `GET /api/info/about` - Returns RTO mission, vision, history, contact details
- `GET /api/info/faq` - Returns frequently asked questions

## Key Decisions
- Static data served from route file (no DB dependency for Phase 1)
- Follows RESTful patterns for future migration to database-backed CRUD

## Related Files
- `src/index.ts` - Mounts routes at `/api/info`
