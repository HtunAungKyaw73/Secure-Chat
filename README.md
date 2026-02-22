# SecureChat: Secure Real-Time Messaging

SecureChat is a premium, real-time messaging application built with a high-density **Glassmorphism** design system. It combines cutting-edge web technologies with a focus on security, performance, and state-of-the-art UI/UX.

---

## ✨ Core Features

- **💎 Glassmorphism UI**: A custom "Amethyst Deep Space" aesthetic featuring backdrop blurs, glow meshes, and high-density typography.
- **⚡ Real-Time Communication**: Powered by Socket.IO for instantaneous message delivery and live member tracking.
- **🔒 Message Encryption at Rest**: All chat messages are encrypted using **AES-256-GCM** before being stored in the database.
- **🛡️ Secure Rooms**: JWT-protected authentication, secure API routes, and the ability to create password-protected private spaces.
- **🌓 Cinematic Transitions**: Visual theme toggling (Light/Dark) using the experimental **View Transitions API** for ripple-effect transitions.
- **🔄 Persistence**: Robust session management and message history retrieval, ensuring the conversation never drops.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/).
- **Backend**: Node.js custom server with [Socket.IO](https://socket.io/).
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [NeonDB](https://neon.tech/)), [Prisma ORM](https://www.prisma.io/).
- **Security**: [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js/) for password hashing, [JSON Web Tokens](https://jwt.io/) for auth, and Node `crypto` for content encryption.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (e.g., [Neon.tech](https://neon.tech/))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HtunAungKyaw73/Secure-Chat.git
   cd chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env` file in the root:
   ```env
   DATABASE_URL="your-postgresql-url"
   JWT_SECRET="your-secure-jwt-secret"
   MESSAGE_ENCRYPTION_KEY="your-32-byte-hex-encryption-key"
   ```

4. Push the database schema:
   ```bash
   npx prisma db push
   ```

### Running the App

- **Development**:
  ```bash
  npm run dev
  ```
  Runs the custom Socket.IO + Next.js server with `tsx`.

- **Production Build**:
  ```bash
  npm run build
  npm start
  ```

---

## 📁 Project Structure

- `src/server.ts`: Custom Node.js server entry point for Socket.IO integration.
- `src/lib/crypto.ts`: Core encryption/decryption logic (AES-256-GCM).
- `src/lib/auth.ts`: Authentication helpers (JWT, Bcrypt).
- `src/app/room/[id]`: Real-time chat room interface.
- `src/app/globals.css`: Tailwind v4 theme configurations, glassmorphism tokens, and View Transition animations.

---

## 🚢 Deployment

For detailed deployment instructions for platforms like **Railway** or **Render**, please refer to our [Deployment Guide](file:///Users/macbookair/.gemini/antigravity/brain/2e8c47f6-c223-419b-8925-ff2f49c49eb5/deployment_guide.md).

---

*Built with ❤️ by Antigravity.*
