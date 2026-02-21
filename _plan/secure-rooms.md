# Plan: Secure Chat Rooms
**Reference Spec:** `_spec/secure-rooms.md`
**Complexity:** High

## 1. Proposed Architecture

```
Browser
  └─ Next.js (App Router)
       ├─ /                 → Lobby (room list + create room)
       ├─ /login            → Login page
       ├─ /register         → Register page
       └─ /room/[id]        → Chat room page

API Routes (Next.js)
  ├─ POST /api/auth/register
  ├─ POST /api/auth/login
  ├─ POST /api/auth/logout
  ├─ GET  /api/rooms        → list all rooms
  ├─ POST /api/rooms        → create room
  └─ GET  /api/rooms/[id]/messages → message history

Custom Server (src/server.ts)
  └─ Socket.IO
       ├─ middleware: verify JWT from cookie on every connection
       ├─ socket.join(roomId) → isolate messages per room
       └─ io.to(roomId).emit(...) → broadcast only within room

Database (NeonDB · PostgreSQL)
  └─ Prisma ORM
       ├─ User
       ├─ Room
       └─ Message
```

**Auth Strategy:** JWT signed with `JWT_SECRET`, stored in an `httpOnly` cookie set by the login API route. Socket.IO middleware reads the cookie and verifies the token on every new connection — unauthenticated sockets are immediately disconnected.

## 2. File Changes

| Action | Path | Description |
| :--- | :--- | :--- |
| Modify | `prisma/schema.prisma` | New `User`, `Room`, `Message` models for PostgreSQL |
| Modify | `prisma.config.ts` | Update adapter from libsql to built-in postgres provider |
| Modify | `.env` | Add `DATABASE_URL` (NeonDB), `JWT_SECRET` |
| Create | `src/lib/auth.ts` | `signToken()`, `verifyToken()`, `hashPassword()`, `comparePassword()` helpers |
| Create | `src/app/api/auth/register/route.ts` | POST — create user |
| Create | `src/app/api/auth/login/route.ts` | POST — verify credentials, set cookie |
| Create | `src/app/api/auth/logout/route.ts` | POST — clear cookie |
| Create | `src/app/api/rooms/route.ts` | GET list / POST create room |
| Create | `src/app/api/rooms/[id]/messages/route.ts` | GET message history for a room |
| Modify | `src/app/api/messages/route.ts` | Lock down — now scoped to a room |
| Modify | `src/server.ts` | Add Socket.IO JWT auth middleware + room join logic |
| Create | `src/app/login/page.tsx` | Login UI |
| Create | `src/app/register/page.tsx` | Register UI |
| Create | `src/app/page.tsx` (Lobby) | Replace current chat page — shows room list, create form |
| Create | `src/app/room/[id]/page.tsx` | Room-scoped chat UI (current page.tsx, adapted) |
| Create | `src/lib/withAuth.ts` | HOC / middleware to protect pages server-side |

## 3. Implementation Steps

1. [ ] **Setup NeonDB** — Create project on neon.tech, copy `DATABASE_URL` into `.env`.
2. [ ] **Update Prisma schema** — Replace SQLite libsql setup with PostgreSQL provider; add `User`, `Room`, `Message` models.
3. [ ] **Run migrations** — `npx prisma migrate dev --name init`.
4. [ ] **Install deps** — `npm i bcryptjs jsonwebtoken cookie` and their `@types/*`.
5. [ ] **Build `src/lib/auth.ts`** — JWT sign/verify, bcrypt hash/compare helpers.
6. [ ] **Build auth API routes** — `/register`, `/login` (sets httpOnly cookie), `/logout` (clears cookie).
7. [ ] **Add Socket.IO JWT middleware** — Verify cookie token on connection; reject if invalid.
8. [ ] **Build room API routes** — List/create rooms, fetch room messages.
9. [ ] **Build Login & Register pages** — Form UI, connect to API, redirect on success.
10. [ ] **Build Lobby page** (`/`) — Room list grid, create room modal/form.
11. [ ] **Build Room page** (`/room/[id]`) — Adapted from current `page.tsx`, uses `roomId` for socket + message API.
12. [ ] **Wire up Socket.IO rooms** — `socket.join(roomId)`, emit only to `io.to(roomId)`.

## 4. Verification Strategy

### Manual Tests
1. **Register + Login Flow**
   - Start dev server: `npm run dev`
   - Open `http://localhost:3000` → should redirect to `/login` if not authenticated.
   - Click "Register" → fill in username, email, password → submit → should redirect to lobby.
   - Log out → redirected to `/login`.
   - Log back in → see the lobby.

2. **Room Isolation**
   - In **Browser A** (Window 1): Create room "Room Alpha", enter it.
   - In **Browser B** (Incognito): Register as a different user, create "Room Beta", enter it.
   - Send a message in Room Alpha from Browser A → **must NOT appear** in Browser B's Room Beta.
   - Open a third window, join Room Alpha → **should see** the message from Browser A.

3. **Password-Protected Room**
   - Create a room with a password "secret123".
   - In another window, try to join that room without a password → should be denied.
   - Enter "secret123" → should succeed and enter the room.

4. **Socket.IO Auth Guard**
   - Clear cookies in DevTools.
   - Attempt to navigate to `/room/[id]` directly → should redirect to `/login`.
