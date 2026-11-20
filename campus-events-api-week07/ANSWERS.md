# Week 7 — Answers

1. **Why `Booking` has `eventId` instead of `Event` having `bookingIds`:**
   In a relational database, columns store single scalar values rather than arrays of foreign keys, so the **many** side of a 1-N relation is always stored on the child table (`Booking.eventId`) referencing the **one** side (`Event.id`). In `prisma/schema.prisma`, `bookings Booking[]` on `Event` is only a virtual Prisma relation field and does not create a column in PostgreSQL. Storing `eventId` on `Booking` allows any number of bookings per event and lets PostgreSQL enforce referential integrity (such as `onDelete: Cascade`).

2. **Why keep `booked` on `Event`, and how to keep it accurate:**
   Storing `booked` directly on `Event` avoids running `SUM(seats)` joins across `Booking` on every event listing or capacity check, keeping reads fast and simple. Because it duplicates information from `Booking`, every operation that adds or removes a booking must update `booked` atomically inside the same `$transaction` as creating or deleting the `Booking` row. We also omit `booked` from `CreateEventDto` and `UpdateEventDto` so clients cannot modify it directly.

3. **Difference between `prisma migrate dev` and `prisma generate`:**
   `prisma migrate dev` compares `prisma/schema.prisma` against the database, generates a SQL migration file in `prisma/migrations/`, and applies it to PostgreSQL—this is the command that **changes the database**. `prisma generate` does not touch the database; it reads `prisma/schema.prisma` and regenerates the typed TypeScript Prisma Client in `src/generated/prisma` so application code reflects schema changes.

4. **1 query vs. 21 queries (the N+1 problem and `include`):**
   Running 1 query to fetch 20 events followed by 20 separate queries to fetch each event's bookings is the **N+1 query problem**, which wastes database round-trips as the list grows. In Prisma, passing `include: { bookings: true }` fixes this by loading the events and all of their related bookings together instead of querying per event:
   ```ts
   this.prisma.event.findMany({ include: { bookings: true } });
   ```

5. **Two students booking the last seat at the same moment:**
   In a read-check-update flow, both requests read `Event` before either commits and both see `booked = 29` (`capacity = 30`), so both pass the JavaScript check (`29 + 1 <= 30`) and increment `booked`, overbooking the event to `31`. Using `tx.event.updateMany({ where: { id: eventId, booked: { lte: event.capacity - dto.seats } }, data: { booked: { increment: dto.seats } } })` inside `$transaction` fixes this because PostgreSQL locks the `Event` row during the `UPDATE` and re-evaluates the `WHERE` condition against the latest committed `booked` value. The first transaction updates the row (`count = 1`, `booked = 30`) and creates the booking, while the second sees `30 <= 29` is false (`count = 0`) and throws `ConflictException` (409).
