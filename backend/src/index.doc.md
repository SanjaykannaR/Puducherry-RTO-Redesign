# Backend Entry Point

**File:** `src/index.ts`

## Purpose
Main Express application entry point. Configures middleware, registers route handlers, and starts the HTTP server on port 5000.

## Key Decisions
- Using `tsx watch` for development (TypeScript execution without compile step)
- Rate limiting applied globally to `/api/*` routes (100 req/15 min per GIGW 3.0 guidelines)
- CORS restricted to frontend origin `http://localhost:3000`
- Helmet for security headers (GIGW 3.0 security requirement)

## Dependencies
- express, cors, helmet, morgan, express-rate-limit, dotenv

## Related Files
- `src/routes/*.ts` - All route handlers mounted here
- `.env` - Environment configuration
