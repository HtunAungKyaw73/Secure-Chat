# Lessons Learned: Real-Time Chat App

## 1. Successes
- Successfully implemented a stunning, modern UI using Tailwind CSS and Framer Motion.
- Integrated `socket.io` effortlessly into a custom Next.js server setup.
- Designed a cohesive color palette and micro-animations for message bubbles and user join events.

## 2. Friction Points & Bugs
- **Issue:** The local environment lacked Docker and PostgreSQL installations, halting the original PostgreSQL plan.
- **Fix:** Pivoted to a local SQLite fallback for the MVP to avoid blocking development.

- **Issue:** Prisma 7 introduced significant breaking changes to how connections are instantiated, removing the `url` property from the `datasource` block and requiring explicit Prisma Client configurations.
- **Fix:** Investigated `@prisma/adapter-libsql` and `@libsql/client` typings directly from node_modules. Realized that `PrismaLibSql` from `@prisma/adapter-libsql` takes config options (`{ url: ... }`) instead of an initialized client. Once corrected, compilation succeeded.

- **Issue:** IDE flagged numerous warnings for Tailwind CSS syntax like `bg-gradient-to-r` and `break-words`.
- **Fix:** Tailwind v4 modernized several class names. Updated gradients to `bg-linear-to-*`, `h-[100dvh]` to `h-dvh`, and `break-words` to `wrap-break-word`.

- **Issue:** Starting the custom Next.js server (`server.js`) threw `ERR_MODULE_NOT_FOUND` when importing `.ts` files (like `src/lib/prisma.ts`) because Next.js configures "type": "module" and ES module resolution strictness requires `.js` extensions or fails on `.ts` imports.
- **Fix:** Renamed the server entry to `src/server.ts` and installed `tsx`. Updated `package.json` scripts to run `tsx src/server.ts` instead of `node src/server.js`, bypassing the ES module resolution friction entirely.

## 3. Future Technical Debt
- **Authentication:** Currently using a basic `useState` username. A robust authentication system (e.g., NextAuth) should be added.
- **Database:** Need to migrate from SQLite to PostgreSQL as initially planned when the production/local environment supports it.

## 4. New Knowledge
- **[Agent Note]:** Prisma 7 entirely enforces Driver Adapters. For SQLite, install `@prisma/adapter-libsql` & `@libsql/client`. The adapter is instantiated with `new PrismaLibSql({ url: process.env.DATABASE_URL })` rather than an initialized client. The `.prisma` file must omit the `url = env(...)` in the `datasource` block or it throws error `P1012`.
- **[Agent Note]:** Tailwind v4 introduced breaking class name changes: `bg-gradient-to-*` is now `bg-linear-to-*`. `break-words` is now `wrap-break-word`.
- **[Agent Note]:** When building custom Next.js servers in an ES Module environment (`"type": "module"`), `node server.js` will fail to resolve TypeScript imports unless explicitly handled. Best modern practice is to use `src/server.ts` and execute it with `tsx` (`npm i -D tsx` -> `tsx src/server.ts`).
