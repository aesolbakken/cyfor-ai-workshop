# Refined Brief: Resource Reservations

## Problem statement

The system manages resources (rooms, equipment, vehicles, workspaces) but has no concept of time or booking. Users cannot reserve a resource for a specific period, and there is no way to see whether something is available. Without reservations the product is just a catalog, not a booking system.

## User / role

Any team member who needs to book a shared resource (no authentication — identified by name only).

## User story

As a team member, I want to reserve a resource for a specific time slot so that others know it is taken and I have a confirmed booking.

## Acceptance criteria

- [ ] A new `Reservation` model exists with: `id`, `resourceId` (FK), `bookedBy` (string, required), `startTime` (datetime), `endTime` (datetime), `createdAt`
- [ ] `POST /resources/{id}/reservations` creates a reservation for a given resource
- [ ] `GET /resources/{id}/reservations` lists all reservations for a resource (past and future), ordered by `startTime`
- [ ] `DELETE /reservations/{id}` cancels (deletes) a reservation
- [ ] Overlapping reservations on the same resource are rejected with 409 Conflict
- [ ] `endTime` must be after `startTime`
- [ ] Minimum duration is 30 minutes
- [ ] `bookedBy` is a required non-empty string (max 120 chars)
- [ ] Reservations in the past cannot be created (`startTime` must be in the future)
- [ ] Deleting a resource cascades and removes its reservations
- [ ] The frontend shows reservations for a selected resource
- [ ] The frontend has a form to create a reservation (bookedBy, start, end)
- [ ] `npm run generate` is run after API changes to keep the Orval client in sync
- [ ] Tests cover: creation, overlap rejection, validation errors, cascade delete, listing

## Non-goals

- No user authentication or login system
- No reservation statuses (draft, confirmed, completed) — a reservation either exists or is deleted
- No availability-based search across resources ("show me free rooms on Tuesday")
- No recurring / repeating reservations
- No notifications or email
- No pagination on reservation lists
- No editing a reservation after creation (delete and re-create instead)

## Assumptions

- Each resource represents a single physical thing (one room, one vehicle) — not a pool with quantity
- Reservations are exclusive: no two reservations on the same resource can overlap
- Time precision is datetime (not just dates) — supports partial-day bookings
- SQLite's datetime handling is sufficient (ISO 8601 strings)
- The `bookedBy` field is a free-text name, not a foreign key to a users table
- Past reservations are kept for history and are never automatically cleaned up

## Business rules & edge cases

| Rule | Detail |
|------|--------|
| **Overlap check** | Before inserting, query for any existing reservation where `startTime < newEnd AND endTime > newStart` on the same resource. Reject with 409 if found. |
| **Minimum 30 min** | `endTime - startTime >= 30 minutes`. Reject with 422 if shorter. |
| **No past bookings** | `startTime` must be strictly in the future at the time of the request. |
| **Cascade delete** | Prisma `onDelete: Cascade` on the `resourceId` relation. Deleting a resource removes all its reservations. |
| **Boundary: touching slots** | Two reservations where one ends exactly when the next starts (e.g. 10:00–11:00 and 11:00–12:00) are **not** overlapping and should be allowed. Use strict inequality: `start < otherEnd AND end > otherStart`. |
| **Timezone** | All times are stored and compared as UTC. The frontend is responsible for any local conversion. |
| **Resource must exist** | Creating a reservation on a non-existent resource returns 404. |
| **Deleting past reservations** | Allowed — no restriction on deleting historical records. |

## Impacted areas

- **api/prisma/schema.prisma** — new `Reservation` model with relation to `Resource`
- **api/src/app.ts** — new routes, Zod schemas, overlap logic
- **api/openapi.json** — regenerated via `npm run generate`
- **web/src/api/generated/** — regenerated Orval hooks
- **web/src/App.tsx** (or new component) — reservation UI per resource
- **api/src/app.test.ts** — new test cases for reservation endpoints
- **database** — `prisma db push` to apply schema changes

## Open questions (for future scope)

- Should there be a calendar/timeline visualization, or is a simple list sufficient for now?
- Will we eventually need to edit reservations in place rather than delete-and-recreate?
- Should resources have "bookable hours" (e.g. 08:00–18:00) to prevent overnight reservations?
