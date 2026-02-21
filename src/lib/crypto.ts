import crypto from "crypto";

// Key must be exactly 32 bytes for aes-256-gcm
const ENCRYPTION_KEY = process.env.MESSAGE_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
    console.warn("WARNING: MESSAGE_ENCRYPTION_KEY is not set. Messages will not be encrypted.");
}

/**
 * Encrypts content using AES-256-GCM.
 * Structure: IV (12 bytes) : Auth Tag (16 bytes) : Encrypted Content
 */
export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY) return text;

    try {
        const iv = crypto.randomBytes(12);
        // Use the key directly from env (assuming it's a 32-byte base64 or hex string, or just a string)
        // For stability, we'll pad or truncate a raw string to 32 bytes if it's not the right length,
        // but ideally, it's a 32-byte key.
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

        const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        const authTag = cipher.getAuthTag().toString("hex");

        return `${iv.toString("hex")}:${authTag}:${encrypted}`;
    } catch (error) {
        console.error("Encryption error:", error);
        return text; // Fallback to raw text if encryption fails
    }
}

/**
 * Decrypts content encrypted with AES-256-GCM.
 */
export function decrypt(encryptedText: string): string {
    if (!ENCRYPTION_KEY || !encryptedText.includes(":")) return encryptedText;

    try {
        const [ivHex, authTagHex, contentHex] = encryptedText.split(":");
        if (!ivHex || !authTagHex || !contentHex) return encryptedText;

        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");
        const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(contentHex, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        // If decryption fails, it might be an unencrypted message or a key mismatch.
        // We log and return the original text as a fallback.
        console.error("Decryption failed (returning raw text):", error);
        return encryptedText;
    }
}
