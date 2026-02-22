# 🧠 Concept Explanation: Message Encryption (AES-256-GCM)

> **Metadata**
> - **Source Spec:** `_learn/architecture-and-implementation.md`
> - **Primary Files:** `src/lib/crypto.ts`, `src/server.ts`, `src/app/api/rooms/[id]/messages/route.ts`
> - **Patterns Used:** `Authenticated Encryption`, `Utility Module`, `Transformation Layer`
> - **Status:** 🟢 Verified

---

## 1. Theoretical Foundation
*Privacy and Integrity: Ensuring only valid participants can read messages.*

*   **The Problem:** Storing chat messages in plaintext in a database is a major security risk. If the database is compromised, all private conversations are exposed. Furthermore, standard encryption (like AES-CBC) can be vulnerable to "bit-flipping" attacks where an attacker modifies the ciphertext without being detected.
*   **The Solution:** We use **AES-256-GCM (Galois/Counter Mode)**. This is an "Authenticated Encryption" algorithm. It doesn't just hide the text; it attaches an "Authentication Tag" that proves the data hasn't been tampered with. If even a single bit of the ciphertext is changed, decryption will fail.

### 🧩 Core Cryptographic Components

To understand how our messages stay secure, we must break down the four pillars of our GCM implementation:

#### 1. The IV (Initialization Vector)
Think of the IV as "Random Salt" for your encryption. 
- **The Purpose:** If you encrypt the word "Hello" two times with the same key, a standard algorithm might produce the same ciphertext both times. An attacker could see this pattern and guess your messages. 
- **The Mechanism:** We generate a unique, random 12-byte IV for *every single message*. This ensures that even identical messages look completely different in the database. The IV is not secret (we store it in plaintext in our `iv:tag:content` string), but it must be unique per message.

#### 2. The Key (AES-256)
This is the "Secret Sauce." 
- **The Purpose:** It Is the master password that locks and unlocks the data. 
- **The Mechanism:** We use AES-256, which requires a bit-perfect 32-byte (256-bit) key. Since human passwords vary in length, we use `scryptSync` (a Key Derivation Function) to "stretch" our environment variable into a cryptographically strong 32-byte key.

#### 3. The AuthTag (Authentication Tag)
This is the "Tamper-Proof Seal."
- **The Purpose:** Most encryption only hides data (Confidentiality). AES-GCM also provides **Integrity**. 
- **The Mechanism:** During encryption, the algorithm calculates a mathematical "fingerprint" of the message. This 16-byte tag is stored alongside the ciphertext. During decryption, if the tag doesn't match the data, the system knows the message was tampered with or corrupted and will refuse to display it.

#### 4. `cipher.final()`
This is the "Closing Handshake."
- **The Purpose:** Cryptographic operations are often "streamed" (processed in chunks). `final()` tells the engine that no more data is coming.
- **The Mechanism:** In GCM mode, calling `final()` triggers the final calculation of the **AuthTag**. Without this call, you cannot retrieve the tag, and the encryption is incomplete. It's the moment the algorithm "signs off" on the security of the entire message.

*   **References:** [NIST SP 800-38D (GCM)](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)

---

## 2. Implementation Architecture
*How the "Security Vibe" protects the data layer.*

*   **Entry Point:** `src/lib/crypto.ts`. This acts as a pure functional utility layer. It doesn't know about the database or sockets; it only knows how to transform strings.
*   **Data Flow:** 
    1.  **Inbound (Socket):** `server.ts` receives a raw message → calls `encrypt()` → saves ciphertext to DB.
    2.  **Outbound (API):** `route.ts` fetches ciphertext from DB → calls `decrypt()` → sends plaintext to Authenticated Client.
*   **State Impact:** Entirely focused on the `Message` table in PostgreSQL. The `text` column stores a colon-separated string: `iv:authTag:ciphertext`.

---

## 3. Annotated Logic (The "Why" per Line)

### // The Encryption Engine (`src/lib/crypto.ts`)

```typescript
export function encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const key = crypto.scryptSync(keyStr, 'salt', 32);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}
```

### Code Patterns and Intent

**Line 20 [Initialization Vector]:**
*   **Intent:** To ensure that the same message encrypted twice results in different ciphertext.
*   **Mechanism:** `crypto.randomBytes(12)` generates a unique 12-byte IV for every single message. This prevents "pattern analysis" attacks.

**Line 21 [Key Derivation]:**
*   **Intent:** To transform a human-readable password/string into a cryptographically strong 32-byte (256-bit) key.
*   **Mechanism:** `scryptSync` is a "slow" key derivation function that makes it computationally expensive for attackers to brute-force the key.

**Line 28 [Integrity Verification]:**
*   **Intent:** To generate a digital "seal" for the message.
*   **Mechanism:** `cipher.getAuthTag()` produces a 16-byte tag. During decryption, the system re-calculates this tag; if they don't match, it means the message was tampered with.

---

### Edge Case Handling

**Lines 5-8 [Configuration Safety]:**
*   **Scenario:** The developer forgot to set the `MESSAGE_ENCRYPTION_KEY` in `.env`.
*   **Fix:** The code detects this and falls back to returning the raw text while logging a large warning. This prevents the entire app from crashing in local development while making the risk loud and clear.

**Lines 59-62 [Graceful Degradation]:**
*   **Scenario:** A malformed or un-encrypted message is found in the database.
*   **Fix:** Instead of throwing a 500 error, `decrypt` catches the failure and returns the `encryptedText` as-is. This prevents one bad record from breaking the entire chat history view.

---

## 4. Operational Guardrails

*   **Never Change:** The `iv:authTag:ciphertext` structure in Line 30. Changing this separator or order will make every existing message in the database unreadable.
*   **Failure Modes:** If the environment variable `MESSAGE_ENCRYPTION_KEY` is changed, all previously encrypted messages become "lost" (undecryptable). Key rotation requires a migration script to re-encrypt data.
*   **Testing Requirement:** Always verify that a message sent in one session can be read in another after a browser refresh (which triggers the API `GET /messages` decryption path).

---

## 5. Evolutionary Notes

*   **Technical Debt:** Currently uses a hardcoded `'salt'` in `scryptSync`. This should ideally be unique or fetched from a secret to increase entropy.
*   **Future Vision:** Move to an **Envelope Encryption** strategy using a service like AWS KMS or Google Cloud KMS, where a "Master Key" encrypts "Data Keys" for each room.

---
*Authored by Antigravity.*
