/**
 * Crypto utilities using Web Crypto API and hash-wasm
 */
import { argon2id, scrypt as scryptHash } from "hash-wasm";
import { bytesToHex, bytesToBase64Url, hexToBytes } from "./encoding-utils";

export type KeyFormat = "hex" | "base64url";
export type HashAlgorithm = "SHA-256" | "SHA-512";
export type KdfAlgorithm = "PBKDF2" | "Argon2id" | "scrypt";

// ============ Random Key Generation ============

export async function generateRandomKey(
    bytes: 16 | 24 | 32 | 64,
    format: KeyFormat
): Promise<string> {
    const key = new Uint8Array(bytes);
    crypto.getRandomValues(key);
    return format === "hex" ? bytesToHex(key) : bytesToBase64Url(key);
}

// ============ Key Derivation Functions ============

export interface Pbkdf2Params {
    salt: string;
    iterations: number;
    keyLength: number; // in bytes
    hash: HashAlgorithm;
}

export async function deriveKeyPBKDF2(
    passphrase: string,
    params: Pbkdf2Params
): Promise<string> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: enc.encode(params.salt),
            iterations: params.iterations,
            hash: params.hash,
        },
        keyMaterial,
        params.keyLength * 8
    );

    return bytesToHex(new Uint8Array(derivedBits));
}

export interface Argon2Params {
    salt: string;
    parallelism: number;
    iterations: number;
    memorySize: number; // in KB
    hashLength: number; // in bytes
}

export async function deriveKeyArgon2(
    passphrase: string,
    params: Argon2Params
): Promise<string> {
    const hash = await argon2id({
        password: passphrase,
        salt: params.salt,
        parallelism: params.parallelism,
        iterations: params.iterations,
        memorySize: params.memorySize,
        hashLength: params.hashLength,
        outputType: "hex",
    });
    return hash;
}

export interface ScryptParams {
    salt: string;
    costFactor: number; // N
    blockSize: number; // r
    parallelism: number; // p
    hashLength: number; // in bytes
}

export async function deriveKeyScrypt(
    passphrase: string,
    params: ScryptParams
): Promise<string> {
    const hash = await scryptHash({
        password: passphrase,
        salt: params.salt,
        costFactor: params.costFactor,
        blockSize: params.blockSize,
        parallelism: params.parallelism,
        hashLength: params.hashLength,
        outputType: "hex",
    });
    return hash;
}

// ============ Hashing ============

export async function hashData(
    data: string,
    algorithm: HashAlgorithm
): Promise<string> {
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(algorithm, enc.encode(data));
    return bytesToHex(new Uint8Array(hashBuffer));
}

// ============ HMAC ============

export async function hmacSign(
    key: string,
    data: string,
    algorithm: HashAlgorithm
): Promise<string> {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(key),
        { name: "HMAC", hash: algorithm },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        enc.encode(data)
    );
    return bytesToHex(new Uint8Array(signature));
}

export async function hmacVerify(
    key: string,
    data: string,
    signature: string,
    algorithm: HashAlgorithm
): Promise<boolean> {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(key),
        { name: "HMAC", hash: algorithm },
        false,
        ["verify"]
    );

    return crypto.subtle.verify(
        "HMAC",
        cryptoKey,
        hexToBytes(signature),
        enc.encode(data)
    );
}

// ============ AES-256-GCM ============

export interface AesGcmResult {
    ciphertext: string; // hex
    iv: string; // hex
    tag: string; // hex (last 16 bytes of ciphertext in Web Crypto)
}

export async function aesGcmEncrypt(
    keyHex: string,
    plaintext: string
): Promise<AesGcmResult> {
    const keyBytes = hexToBytes(keyHex);
    if (keyBytes.length !== 32) {
        throw new Error("Key must be 32 bytes (256 bits) for AES-256");
    }

    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        "AES-GCM",
        false,
        ["encrypt"]
    );

    const enc = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        enc.encode(plaintext)
    );

    const encryptedBytes = new Uint8Array(encrypted);
    // In Web Crypto, the auth tag is appended to the ciphertext (last 16 bytes)
    const ciphertext = encryptedBytes.slice(0, -16);
    const tag = encryptedBytes.slice(-16);

    return {
        ciphertext: bytesToHex(ciphertext),
        iv: bytesToHex(iv),
        tag: bytesToHex(tag),
    };
}

export async function aesGcmDecrypt(
    keyHex: string,
    ciphertextHex: string,
    ivHex: string,
    tagHex: string
): Promise<string> {
    const keyBytes = hexToBytes(keyHex);
    const ciphertextBytes = hexToBytes(ciphertextHex);
    const ivBytes = hexToBytes(ivHex);
    const tagBytes = hexToBytes(tagHex);

    // Combine ciphertext and tag for Web Crypto
    const combined = new Uint8Array(ciphertextBytes.length + tagBytes.length);
    combined.set(ciphertextBytes);
    combined.set(tagBytes, ciphertextBytes.length);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        "AES-GCM",
        false,
        ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes },
        cryptoKey,
        combined
    );

    return new TextDecoder().decode(decrypted);
}
