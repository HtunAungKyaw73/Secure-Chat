import crypto from "crypto";

const getEncryptionKey = () => {
    const key = process.env.MESSAGE_ENCRYPTION_KEY;
    if (!key) {
        console.warn("WARNING: MESSAGE_ENCRYPTION_KEY is not set. Messages will not be encrypted.");
    }
    return key;
};

/**
 * Encrypts content using AES-256-GCM.
 * Structure: IV (12 bytes) : Auth Tag (16 bytes) : Encrypted Content
 */
export function encrypt(text: string): string {
    const keyStr = getEncryptionKey();
    if (!keyStr) return text;

    try {
        const iv = crypto.randomBytes(12);
        const key = crypto.scryptSync(keyStr, 'salt', 32);

        const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        const authTag = cipher.getAuthTag().toString("hex");

        return `${iv.toString("hex")}:${authTag}:${encrypted}`;
    } catch (error) {
        console.error("Encryption error:", error);
        return text;
    }
}

/**
 * Decrypts content encrypted with AES-256-GCM.
 */
export function decrypt(encryptedText: string): string {
    const keyStr = getEncryptionKey();
    if (!keyStr || !encryptedText.includes(":")) return encryptedText;

    try {
        const [ivHex, authTagHex, contentHex] = encryptedText.split(":");
        if (!ivHex || !authTagHex || !contentHex) return encryptedText;

        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");
        const key = crypto.scryptSync(keyStr, 'salt', 32);

        const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(contentHex, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        console.error("Decryption failed (returning raw text):", error);
        return encryptedText;
    }
}
