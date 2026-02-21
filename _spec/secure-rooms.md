# Spec: Secure Chat Rooms
**Status:** 🟡 Draft
**Date:** 2026-02-21

## 1. Objective
Transform VibeChat into a secure, multi-room platform backed by PostgreSQL (NeonDB) where authenticated users can create and join password-protected chat rooms without exposing their conversations to other rooms.

## 2. User Stories

### Authentication
- **As a new user**, I want to **register with a username, email and password**, so that **I have a persistent identity in the app**.
- **As a returning user**, I want to **log in with my credentials**, so that **I can access my account and rooms securely**.
- **As a logged-in user**, I want to **see my profile and log out**, so that **I can manage my session**.

### Rooms
- **As a user**, I want to **create a chat room with a name**, so that **I can host a private conversation space**.
- **As a user**, I want to **optionally protect my room with a password**, so that **only invited people can join**.
- **As a user**, I want to **browse a list of available public rooms**, so that **I can discover and join conversations**.
- **As a user**, I want to **join a room by entering its name (and password if required)**, so that **I can participate in that room's chat**.
- **As a user**, I want to **messages from other rooms to never appear in my room**, so that **my conversations stay private**.

### Security
- **As a user**, I want to **have my password stored securely (hashed)**, so that **my credentials are never exposed**.
- **As a user**, I want to **remain logged in across browser reloads**, so that **I don't have to re-authenticate every time**.

## 3. Functional Requirements

### Authentication
- [ ] User registration with `username`, `email`, `password` (hashed with `bcrypt`).
- [ ] User login returns a **JWT** stored in an `httpOnly` cookie for session security.
- [ ] Protected API routes and Socket.IO connections verify the JWT before allowing access.
- [ ] Logout clears the session cookie.

### Database (PostgreSQL via NeonDB)
- [ ] Migrate from SQLite to PostgreSQL hosted on **NeonDB** (serverless, free tier).
- [ ] Replace `@prisma/adapter-libsql` with the standard Prisma PostgreSQL provider.
- [ ] **Schema:**
  - `User` — `id`, `username`, `email`, `passwordHash`, `createdAt`
  - `Room` — `id`, `name`, `description`, `passwordHash` (nullable = public room), `createdBy`, `createdAt`
  - `Message` — `id`, `text`, `userId`, `roomId`, `createdAt`

### Rooms
- [ ] Lobby page: lists all public rooms (rooms without a password) and allows creation of new rooms.
- [ ] Room creation form: name (required), description (optional), password (optional).
- [ ] Room join flow: selecting a room prompts for a password if the room is password-protected.
- [ ] Socket.IO uses **named rooms** (`socket.join(roomId)`) to isolate messages — messages are only emitted to the correct room.
- [ ] Room member count displayed in the lobby.

## 4. Constraints & Out of Scope
- **No OAuth/social login** for this version (username/email/password only).
- **No direct messaging** (DMs) between users — rooms only.
- **No file uploads** in chat messages.
- **No room admin controls** (kick, ban) in this version.
- **No email verification** — registration is immediate.
