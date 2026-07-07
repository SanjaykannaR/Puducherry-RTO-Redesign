# Services Routes

**File:** `src/routes/services.ts`

## Purpose
Lists all available RTO services with descriptions, categories, and links.

## Endpoints
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get service details by ID

## Key Decisions
- 8 services across 4 categories (registration, license, tools, information)
- Maps to the 31-page sitemap structure

## Related Files
- `src/index.ts` - Mounts routes at `/api/services`
- Frontend `src/app/services/page.tsx` - Service listing page
