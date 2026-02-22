# Understanding Socket.IO

## What is Socket.IO?
Socket.IO is a JavaScript library that enables **real-time, bidirectional, and event-based communication** between the browser (client) and the server. It is built on top of the WebSocket protocol but provides additional features and fallback options that make it much more robust than standard WebSockets.

Standard HTTP requests (like fetching a web page or an API endpoint) are **unidirectional**: the client requests something, the server responds, and the connection closes. If the server has new data later, it cannot send it to the client unprompted.

With Socket.IO, the connection remains **open**. Both the client and the server can send messages to each other at any time, instantly. This is what makes real-time applications like chat apps, multiplayer games, and live scoreboards possible.

## Key Features of Socket.IO
1.  **Reliability (Fallbacks):** If a user's network or browser doesn't support WebSockets, Socket.IO automatically downgrades to HTTP long-polling to ensure the connection still works.
2.  **Auto-reconnection:** If the connection drops (e.g., the user goes through a tunnel and loses signal), Socket.IO will automatically try to reconnect exponentially.
3.  **Rooms and Namespaces:**
    *   **Rooms:** You can put sockets into arbitrary "rooms" (like "chat-room-1" or "team-a") and broadcast messages *only* to the users in that specific room.
    *   **Namespaces:** Allows you to multiplex a single connection. For instance, you could have `/chat` for user messaging and `/notifications` for system alerts over the same underlying connection.
4.  **Event Emitting:** Instead of just sending raw text strings, you can categorize messages using "events". For example: `socket.emit("user_join", data)` vs `socket.emit("send_message", data)`.

## How it works in our Chat App

In this project, we have two distinct parts of Socket.IO running:

### 1. The Server (`src/server.ts`)
The server acts as the central hub. It waits for clients to connect and then listens for specific events from them.

```typescript
import { Server } from "socket.io";
// ... (http server setup)

// Initialize Socket.IO on top of the HTTP Server
const io = new Server(httpServer);

// Listen for new connections
io.on("connection", (socket) => {
    // 'socket' represents ONE specific connected user

    // Listen for THIS specific user to trigger the "send_message" event
    socket.on("send_message", async (data) => {
        // ... save message to database ...
        
        // Broadcast the completely saved message out to EVERYONE connected
        io.emit("receive_message", savedMessage);
    });
});
```

### 2. The Client (`src/lib/socket.ts` & `src/app/page.tsx`)
The client connects to the server and listens for events broadcasted *by* the server.

**Initialization (`src/lib/socket.ts`):**
```typescript
import { io } from "socket.io-client";
// Initialize the connection. 'autoConnect: false' means it won't connect until we explicitly tell it to.
export const socket = io({ autoConnect: false });
```

**Usage (`src/app/page.tsx`):**
```tsx
import { socket } from "@/lib/socket";

// 1. Connect to the server
socket.connect();

// 2. Tell the server we exist by emitting an event
socket.emit("user_join", username);

// 3. Listen for events FROM the server
socket.on("receive_message", (msg) => {
    // When the server says "receive_message", we append the new message to our list.
    // Why use `(prev) => [...prev, msg]`?
    // Because the socket event listener is registered inside a `useEffect` on component mount. 
    // If we just did `setMessages([...messages, msg])`, the `messages` variable inside the listener 
    // would be "stale" (it would always be an empty array from the initial render). 
    // Using the functional updater `(prev)` guarantees React will always append the new message 
    // to the most recent, up-to-date state array.
    setMessages((prev) => [...prev, msg]);
});

// 4. Send an event TO the server (e.g., when a user clicks 'Send')
const handleSendMessage = () => {
    socket.emit("send_message", { text: newMessage, username });
};
```

## Summary of Communication Methods (The `emit` cheatsheet)
When writing logic on the **Server**:
*   `socket.emit('event', data)`: Send a message **only** to the specific user that triggered it.
*   `io.emit('event', data)`: Send a message to **everyone** connected to the entire server.
*   `socket.broadcast.emit('event', data)`: Send a message to **everyone EXCEPT** the specific user who triggered it.
*   `io.to('room1').emit('event', data)`: Send a message to everyone who has joined the room named 'room1'.

When writing logic on the **Client**:
*   `socket.emit('event', data)`: Send a message to the server.
*   `socket.on('event', callback)`: Listen for a message from the server and react to it.

---

## Technical Deep Dive: `src/server.ts`

Our custom server is the "brain" of the real-time system. Here is a breakdown of how it implements the patterns mentioned above.

### 1. The Next.js + Socket.IO Hybrid
Instead of using a standard Next.js development server, we wrap Next.js inside a custom Node.js HTTP server. This allows us to share the same port for both standard web traffic (handing it off to Next.js) and WebSocket traffic (Socket.IO).

```typescript
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer);
    // ...
});
```

### 2. Security at the Handshake Layer
We use a **Middleware** (`io.use`) to verify users *before* the connection is even established. It parses the `token` cookie, verifies the JWT, and attaches the user data directly to the `socket` object.

```typescript
io.use((socket, next) => {
    const cookies = parse(socket.handshake.headers.cookie || "");
    const payload = verifyToken(cookies.token);
    if (!payload) return next(new Error("Authentication error"));
    
    // Identity is now "sticky" to this connection
    (socket as AuthenticatedSocket).user = payload;
    next();
});
```

### 3. State Management: The `roomMembers` Map
To track who is online in which room, we use a resident memory `Map`.
-   **Structure:** `roomId -> Map<socketId, {username, userId}>`
-   **Why?** This allows us to instantly look up all members in a room without querying the database, enabling the "Online Count" and member list feature.

### 4. The Message Lifecycle
When a user sends a message, the server performs a critical "Double Dispatch":
1.  **Encrypt & Persist:** It takes the raw text, encrypts it using AES-256-GCM, and saves the *ciphertext* to the database.
2.  **Broadcast Decrypted:** For immediate UX feel, it broadcasts the *plaintext* message only to the members currently in that specific room.

```typescript
socket.on("send_message", async (data) => {
    const encryptedText = encrypt(data.text);
    // Save to DB...
    io.to(data.roomId).emit("receive_message", { ...savedMessage, text: data.text });
});
```

### 5. Graceful Cleanup
When a user closes their tab, the `disconnecting` event triggers. We iterate through every room the user was in and remove them from our `roomMembers` tracker so other users see an accurate "Online" count.

---

## 🏗️ Line-by-Line Architectural Breakdown: `src/server.ts`

Below is an exhaustive breakdown of the custom server logic, explained as a senior architect would.

### 1. The Setup & Custom Interfaces (Lines 1-13)
We start by importing Node core modules and our internal security libraries.
```typescript
interface AuthenticatedSocket extends Socket {
    user: JwtPayload;
}
```
-   **Lines 10-12:** We extend the standard Socket.IO `Socket` type. This is a critical **Type Safety** pattern. By adding a `user` property to the socket, we create a "stateful identity" that persists for the life of the connection, preventing us from having to pass user IDs in every single event payload.

### 2. Environment & Constants (Lines 14-22)
```typescript
const hostname = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
const roomMembers = new Map<string, Map<string, { username: string; userId: string }>>();
```
-   **Line 15:** Binding to `0.0.0.0` in production is essential for cloud platforms like Railway/Render.
-   **Line 22:** The `roomMembers` map is our **In-Memory State Store**. It's a nested Map (`RoomID -> SocketID -> UserData`). Using a Map instead of an Object or Array ensures $O(1)$ lookup and deletion performance.

### 3. The Authentication Middleware (Lines 28-41)
This is the "Security Guard" of our server.
-   **Line 29:** `socket.handshake.headers.cookie` – Unlike an API route, Socket.IO starts with a WebSocket upgrade request. We extract the cookies directly from the request headers.
-   **Lines 32-37:** We parse the `token` cookie and verify the JWT. 
-   **Line 39:** `(socket as AuthenticatedSocket).user = payload;` – Once verified, we store the user's identity *on the socket itself*. From this line forward, we never trust client-provided IDs; we only use this verified server-side payload.
-   **Line 40:** `next()` – Only if the token is valid do we allow the connection to proceed.

### 4. Room Join Logic (Lines 50-69)
```typescript
socket.on("join_room", (roomId: string) => {
    socket.rooms.forEach((r) => { if (r !== socket.id) socket.leave(r); });
    socket.join(roomId);
    // ...
});
```
-   **Lines 52-57:** A **Graceful Transition** pattern. Before joining a new room, we force the socket to leave all previous rooms. This prevents a user from accidentally receiving messages from a room they closed.
-   **Line 59:** `socket.join(roomId)` – The native Socket.IO method to subscribe this connection to a specific message stream.
-   **Lines 62-63:** Updating our internal memory tracker so we know who is "Online" in this specific room.

### 5. Secure Message Processing (Lines 71-89)
This is where the "Security Handshake" meets the "Data Layer."
-   **Line 76:** `encrypt(text)` – **Encryption at Rest**. We encrypt the message *before* it touches our database.
-   **Lines 78-81:** We persist the *ciphertext* to PostgreSQL via Prisma.
-   **Line 85:** `io.to(roomId).emit(...)` – The "Double Dispatch." While the DB gets the encrypted version, the active room members get the *plaintext* version instantly. This ensures high performance without sacrificing long-term storage security.

### 6. Cleanup & Broadcasting (Lines 91-115)
-   **Line 91:** `socket.on("disconnecting", ...)` – This event triggers *just before* the socket is destroyed. It's the last chance to perform cleanup.
-   **Lines 97-104 (`handleRoomLeave`):** Removes the user from our memory Map. If a room becomes empty, we delete the room entry entirely to save memory.
-   **Lines 106-115 (`broadcastMembers`):** This function iterates through our `roomMembers` Map, converts the Map to an Array, and broadcasts the "Online List" to everyone in the room. This is why the sidebar updates instantly when someone joins or leaves.

### 7. The Listener (Lines 118-121)
-   **Lines 118-120:** Once Next.js is "prepared" (Line 24), we fire up the HTTP listener. This effectively switches our app from a static site to a dynamic, real-time platform.
