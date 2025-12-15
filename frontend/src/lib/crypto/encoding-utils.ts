/**
 * Encoding utilities for Base64, Hex, URL, and JSON
 */

// ============ Base64 Standard ============

export function base64Encode(input: string): string {
    try {
        return btoa(unescape(encodeURIComponent(input)));
    } catch {
        throw new Error("Invalid input for Base64 encoding");
    }
}

export function base64Decode(input: string): string {
    try {
        return decodeURIComponent(escape(atob(input)));
    } catch {
        throw new Error("Invalid Base64 string");
    }
}

// ============ Base64URL ============

export function base64UrlEncode(input: string): string {
    const base64 = base64Encode(input);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64UrlDecode(input: string): string {
    let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding
    while (base64.length % 4) {
        base64 += "=";
    }
    return base64Decode(base64);
}

// ============ Hex ============

export function hexEncode(input: string): string {
    return Array.from(new TextEncoder().encode(input))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export function hexDecode(input: string): string {
    const cleanHex = input.replace(/\s/g, "");
    if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
        throw new Error("Invalid hex string");
    }
    if (cleanHex.length % 2 !== 0) {
        throw new Error("Hex string must have even length");
    }
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return new TextDecoder().decode(bytes);
}

// ============ Bytes to Hex/Base64URL ============

export function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export function bytesToBase64Url(bytes: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
    const cleanHex = hex.replace(/\s/g, "");
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
}

export function base64UrlToBytes(base64url: string): Uint8Array<ArrayBuffer> {
    let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
        base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

// ============ URL Encoding ============

export function urlEncode(input: string): string {
    return encodeURIComponent(input);
}

export function urlDecode(input: string): string {
    try {
        return decodeURIComponent(input);
    } catch {
        throw new Error("Invalid URL encoded string");
    }
}

// ============ JSON ============

export function jsonPrettify(input: string): string {
    try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed, null, 2);
    } catch {
        throw new Error("Invalid JSON");
    }
}

export function jsonMinify(input: string): string {
    try {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed);
    } catch {
        throw new Error("Invalid JSON");
    }
}
