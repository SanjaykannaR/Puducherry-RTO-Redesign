# Prisma Database Schema

**File:** `prisma/schema.prisma`

## Purpose
Defines the complete database schema for the Puducherry RTO Portal using Prisma ORM with PostgreSQL.

## Models
- **User** - Citizens, RTO staff, and admins with role-based access
- **Vehicle** - Registered vehicles with ownership, insurance, and tax tracking
- **License** - Driving licenses with type, validity, and holder info
- **Application** - Service applications with status workflow
- **Document** - Supporting documents attached to applications
- **Appointment** - Scheduled RTO visits for tests and services
- **Payment** - Transaction records linked to applications
- **Notification** - User notifications and alerts

## Key Decisions
- PostgreSQL chosen for ACID compliance (financial transactions)
- CUIDs for IDs (URL-safe, collision-resistant)
- Enums for status fields (type-safe state machine)
- Json field for `formData` in Application (flexible form structure)
- `@@map()` for snake_case table names (DB convention)

## Related Files
- `.env` - DATABASE_URL connection string
- `src/services/*.ts` - Service layer using Prisma client
