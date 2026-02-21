# Lessons Learned: Secure Rooms & Premium UX Overhaul

## 1. Successes
- **Premium UI Overhaul**: Successfully transitioned to an **Inter-based** typography system with professional font-sizes (14px base) and a high-density, high-quality aesthetic.
- **Messenger Logic**: Implemented side-by-side message alignment (sender: right, receiver: left) for a intuitive conversation flow.
- **Real-time Member Tracking**: Built an in-memory tracking system on the server to manage active users per room, broadcasting live counts and member lists to the frontend.
- **Persistence & Hydration**: Fixed a common Socket.IO issue where page refreshes would drop users from rooms. Re-joining is now seamless.
- **Infrastructure**: Fully integrated **PostgreSQL (NeonDB)** with **Prisma 7** and **Next.js 16**.

## 2. Friction Points & Bugs

- **Issue:** SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string.
- **Fix:** `tsx` doesn't load `.env` files. Added `import "dotenv/config"` to `server.ts` and `prisma.ts`.

- **Issue:** Room drop on refresh.
- **Fix:** Moved `join_room` emission into a `useEffect` on the Room page that triggers as soon as both `isAuthenticated` is true and the `socket` is connected.

- **Issue:** Duplicate members in list.
- **Fix:** Deduplicated room members by `userId` on the server before broadcasting, ensuring users with multiple tabs appear once.

## 3. New Knowledge

- **[Agent Note]:** **Next.js 15/16 Params**: Always remember to `await params` in API routes/Server Components, or use `React.use(params)` in Client Components.
- **[Agent Note]:** **Tailwind v4 @import Order**: `@import url()` must precede `@import "tailwindcss"` to avoid CSS optimization warnings/failures.
- **[Agent Note]:** **Socket.IO Room Management**: Use `socket.on("disconnecting")` to clean up room tracking *before* the socket is fully removed from its rooms collection.

## 4. Final Architecture Summary
- **Database**: PostgreSQL (NeonDB) + Prisma 7 (pg adapter).
- **Auth**: JWT in httpOnly cookies + Next.js Middleware.
- **Real-time**: Socket.IO with named rooms and in-memory member tracking.
- **UI**: Tailwind CSS v4 + Framer Motion + View Transitions API.
