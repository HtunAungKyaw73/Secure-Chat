# VibeChat: Comprehensive Implementation Guide

This guide documents the full lifecycle of the VibeChat project, from initial specification to final premium UI/UX refinements.

---

## 1. Project Evolution
VibeChat was built in five distinct phases:
- **Phase 1-2**: Foundation of a real-time chat using Next.js and SQLite.
- **Phase 3**: Migration to **PostgreSQL (NeonDB)** and implementation of **Secure Rooms** with JWT-based authentication.
- **Phase 4**: Solving environment variables and Prisma 7 transition issues.
- **Phase 5**: Premium UI/UX overhaul, including **Inter typography**, **messenger-style alignment**, and **real-time member tracking** using a custom **Indigo** palette.
- **Phase 6**: Final polish, including **real-time Lobby search filtering** and comprehensive documentation.

---

## 2. Technical Architecture

### Core Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, Framer Motion.
- **Backend**: Node.js custom server (`src/server.ts`) with **Socket.IO**.
- **Database**: PostgreSQL on NeonDB with **Prisma 7**.
- **Auth**: Custom JWT implementation stored in `httpOnly` cookies.

### Real-time Design
The application uses a custom Node.js server to bridge Next.js and Socket.IO. 
- **Room Isolation**: Users join specific Socket.IO rooms (`socket.join(roomId)`), ensuring privacy and isolation.
- **Member Tracking**: An in-memory `Map` on the server tracks `socket.id` to user metadata, allowing for live "Online" lists and a "Talking with" display.
- **Middleware**: Socket.IO connections are protected by the same JWT logic used in the Next.js API.

---

## 3. Major Bug Resolutions & "Gotchas"

### 🛑 SASL: SCRAM-SERVER-FIRST-MESSAGE
- **Issue**: Prisma failed to connect to NeonDB when run via `tsx` or the custom server because environment variables weren't being loaded.
- **Fix**: Initialized `dotenv` at the very top of `server.ts` and `prisma.ts`.
- **Lesson**: Don't assume the environment is pre-loaded in custom server entry points.

### 🛑 Room Drop on Refresh
- **Issue**: Users were disconnected from Socket.IO rooms upon page reload.
- **Fix**: Wrapped the `join_room` emission in a `useEffect` that triggers specifically after both the socket is initialized and the auth state is confirmed.

### 🛑 Messenger Alignment & Header Tracking
- **Issue**: Messages often stuck to the left or the "Talking with" section stayed "solo" because the frontend compared `msg.userId` to missing or inconsistently named fields.
- **Fix**: Standardized all user objects to a `{ userId: string; username: string }` structure and used resilient, type-safe comparison logic.

---

## 4. Design Philosophy
VibeChat prioritizes a **"Visual Vibe"**:
- **Typography**: Inter (High-density, professional).
- **Colors**: Premium **Indigo** palette (`indigo-600` primary).
- **Layout**: Centered message "lanes" with integrated, transparent backgrounds for a sleek, contemporary feel.
- **Micro-interactions**: Use of Framer Motion for message entrance and View Transitions for theme toggling.

---

*Built with ❤️ using Antigravity.*
