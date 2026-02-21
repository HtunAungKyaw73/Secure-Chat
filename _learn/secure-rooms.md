# Lessons Learned: Secure Rooms & Prisma 7 Migration

## 1. Successes
- Successfully migrated from SQLite to **PostgreSQL (NeonDB)**.
- Implemented **JWT Authentication** with `httpOnly` cookies and **bcrypt** password hashing.
- Updated **Socket.IO server** with JWT middleware and **Named Rooms** for message isolation.
- Integrated **Next.js Middleware** for robust route protection.
- Built a premium **Lobby UI** and **Room Chat UI** with password protection.
- Successfully adapted to **Prisma 7**'s new Driver Adapter requirement.

## 2. Friction Points & Bugs

- **Issue:** Prisma 7 build error: `datasource property url is no longer supported in schema files`.
- **Root Cause:** Prisma 7 moved the connection URL to `prisma.config.ts`. Additionally, the client now requires an explicit **Driver Adapter** (like `@prisma/adapter-pg`) or **Accelerate** for database connections in many environments.
- **Fix:** 
  1. Install `@prisma/adapter-pg` and `pg`.
  2. In `prisma.config.ts`, set the `url` in the `datasource` block.
  3. In `src/lib/prisma.ts`, initialize the `PrismaClient` by passing the adapter:
     ```typescript
     const pool = new Pool({ connectionString: process.env.DATABASE_URL });
     const adapter = new PrismaPg(pool);
     const prisma = new PrismaClient({ adapter });
     ```

- **Issue:** Build error: `Property 'id' is missing in type 'Promise<{ id: string; }>'`.
- **Root Cause:** Next.js 15/16 makes `params` in dynamic routes and components asynchronous.
- **Fix:** 
  - In API routes: `const { id } = await params;`.
  - In Client Components: Use `React.use(params)` to unwrap the promise.

## 3. Future Technical Debt
- Socket.IO connection handling: If a user's token expires while they are in a room, the current implementation only checks the token on *initial* connection. A more proactive "token refresh" or "heartbeat validation" would be safer.
- Room password storage: Currently hashing room passwords with bcrypt. For extreme scaling, a lighter-weight verify might be considered, but bcrypt is fine for now.

## 4. New Knowledge
- **[Agent Note]:** **Prisma 7 Client Initialization**: In Prisma 7, the `PrismaClient` constructor will throw an error if called without options when the URL is missing from the `schema`. The recommended approach for direct PostgreSQL access is using the `@prisma/adapter-pg` driver adapter.

- **[Agent Note]:** **Next.js 15/16 Dynamic Routes**: The `params` object is now a **Promise**. You MUST await it in Server Components/API Routes, or use `React.use(params)` in Client Components. Failure to do so will cause build-time TypeScript errors.

- **[Agent Note]:** **JWT Cookie Redirection**: When a registration/login API sets an `httpOnly` cookie and the client-side redirects immediately, the subsequent request *will* include the cookie. Using a dedicated `middleware.ts` is the most reliable way to handle these redirects and protect non-auth routes from guest access.

- **[Agent Note]:** **Socket.IO JWT Middleware**: Access cookies in Socket.IO middleware via `socket.handshake.headers.cookie`. Use the `cookie` package's `parse()` method to extract and verify the token before calling `next()`.
