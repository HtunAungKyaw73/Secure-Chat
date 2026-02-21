# Plan: Real-Time Chat App
**Reference Spec:** `_spec/real-time-chat-app.md`
**Complexity:** Medium

## 1. Proposed Architecture
- **Framework:** Next.js (App Router) for both frontend and backend API.
- **Real-Time Communication:** `socket.io` matching Next.js API routes with a custom Node.js server to handle WebSocket upgrades.
- **Database ORM:** Prisma ORM for interacting with PostgreSQL.
- **State Management:** React local state (`useState`, `useEffect`, `useRef`) for managing live UI updates.
- **Styling & Animation:** Tailwind CSS for styling and Framer Motion for micro-animations (e.g., message appearance, user join/leave notifications).
- **Data Flow:**
  1. User enters username.
  2. Frontend connects to WebSocket server.
  3. Frontend fetches existing message history via REST API or initial WS payload.
  4. User sends a message -> Emitted via WS -> Server saves to DB -> Server broadcasts to all clients.

## 2. File Changes
| Action | Path | Description |
| :--- | :--- | :--- |
| Create | `package.json` | Project configuration and dependencies |
| Create | `server.js` | Custom server to handle Next.js & Socket.io |
| Create | `prisma/schema.prisma` | Database schema for Users and Messages |
| Create | `src/app/page.tsx` | Main chat UI component |
| Create | `src/app/api/messages/route.ts` | API to fetch message history |
| Create | `src/components/ChatBox.tsx` | Component for displaying messages |
| Create | `src/components/MessageInput.tsx` | Component for typing and sending messages |
| Create | `src/lib/socket.ts` | Socket.io client setup |

## 3. Implementation Steps
1. [ ] Initialize Next.js project with Tailwind CSS.
2. [ ] Setup custom `server.js` for Socket.io integration.
3. [ ] Initialize Prisma and define PostgreSQL schema.
4. [ ] Implement core backend logic (WebSocket events, DB saving).
5. [ ] Build UI components with Framer Motion animations.
6. [ ] Connect UI to Socket.io client and REST API.

## 4. Verification Strategy
- **Manual:**
  - Open two distinct browser viewports.
  - Enter different usernames in each.
  - Send a message from one and verify it appears instantly on the other.
  - Refresh the page and verify message history loads correctly from the database.
- **Automated:**
  - Run `npx prisma studio` to verify database records are created.
  - Check Node.js console for successful WebSocket connection logs.
