// Cryptographic Utilities
// Uses the Web Crypto API for secure, standards-compliant hashing

/**
 * Generates a SHA-256 hash of the input data.
 * @param {string|object} data - The data to hash (string or JSON-serializable object).
 * @returns {Promise<string>} - The hexadecimal representation of the hash.
 */
export const hashData = async (data) => {
    try {
        const msg = typeof data === 'string' ? data : JSON.stringify(data);
        const msgBuffer = new TextEncoder().encode(msg);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
        console.error('Crypto Error:', error);
        return null;
    }
};

/**
 * Hashes a sensitive identifier (like a patient ID) for integrity checks or safe storage.
 * @param {string} id - The ID to hash.
 * @returns {Promise<string>} - The SHA-256 hash.
 */
export const hashSensitiveId = async (id) => {
    if (!id) return null;
    return await hashData(`SENSITIVE_ID:${id}`); // Prefix helps avoid rainbow table attacks on raw UUIDs if leaked
};
