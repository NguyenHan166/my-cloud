/**
 * JWT utilities using jose library
 */
import * as jose from "jose";

export type JwtAlgorithm =
    | "HS256"
    | "HS384"
    | "HS512"
    | "RS256"
    | "RS384"
    | "RS512"
    | "ES256"
    | "ES384"
    | "ES512"
    | "EdDSA";

export interface JwtDecoded {
    header: jose.JWTHeaderParameters;
    payload: jose.JWTPayload;
    signature: string;
}

// ============ JWT Sign (Symmetric - HMAC) ============

export async function jwtSignHS(
    payload: jose.JWTPayload,
    secret: string,
    algorithm: "HS256" | "HS384" | "HS512" = "HS256",
    expiresIn?: string
): Promise<string> {
    const secretBytes = new TextEncoder().encode(secret);

    let builder = new jose.SignJWT(payload)
        .setProtectedHeader({ alg: algorithm, typ: "JWT" })
        .setIssuedAt();

    if (expiresIn) {
        builder = builder.setExpirationTime(expiresIn);
    }

    return builder.sign(secretBytes);
}

// ============ JWT Sign (Asymmetric - RSA) ============

export async function generateRSAKeyPair(): Promise<{
    publicKey: string;
    privateKey: string;
}> {
    const { publicKey, privateKey } = await jose.generateKeyPair("RS256");

    const publicKeyPem = await jose.exportSPKI(publicKey);
    const privateKeyPem = await jose.exportPKCS8(privateKey);

    return { publicKey: publicKeyPem, privateKey: privateKeyPem };
}

export async function jwtSignRS(
    payload: jose.JWTPayload,
    privateKeyPem: string,
    algorithm: "RS256" | "RS384" | "RS512" = "RS256",
    expiresIn?: string
): Promise<string> {
    const privateKey = await jose.importPKCS8(privateKeyPem, algorithm);

    let builder = new jose.SignJWT(payload)
        .setProtectedHeader({ alg: algorithm, typ: "JWT" })
        .setIssuedAt();

    if (expiresIn) {
        builder = builder.setExpirationTime(expiresIn);
    }

    return builder.sign(privateKey);
}

// ============ JWT Sign (EdDSA) ============

export async function generateEdKeyPair(): Promise<{
    publicKey: string;
    privateKey: string;
}> {
    const { publicKey, privateKey } = await jose.generateKeyPair("EdDSA");

    const publicKeyPem = await jose.exportSPKI(publicKey);
    const privateKeyPem = await jose.exportPKCS8(privateKey);

    return { publicKey: publicKeyPem, privateKey: privateKeyPem };
}

export async function jwtSignEdDSA(
    payload: jose.JWTPayload,
    privateKeyPem: string,
    expiresIn?: string
): Promise<string> {
    const privateKey = await jose.importPKCS8(privateKeyPem, "EdDSA");

    let builder = new jose.SignJWT(payload)
        .setProtectedHeader({ alg: "EdDSA", typ: "JWT" })
        .setIssuedAt();

    if (expiresIn) {
        builder = builder.setExpirationTime(expiresIn);
    }

    return builder.sign(privateKey);
}

// ============ JWT Verify ============

export async function jwtVerifyHS(
    token: string,
    secret: string,
    algorithms: JwtAlgorithm[] = ["HS256"]
): Promise<
    { valid: true; payload: jose.JWTPayload } | { valid: false; error: string }
> {
    try {
        const secretBytes = new TextEncoder().encode(secret);
        const { payload } = await jose.jwtVerify(token, secretBytes, {
            algorithms,
        });
        return { valid: true, payload };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export async function jwtVerifyRS(
    token: string,
    publicKeyPem: string,
    algorithms: JwtAlgorithm[] = ["RS256"]
): Promise<
    { valid: true; payload: jose.JWTPayload } | { valid: false; error: string }
> {
    try {
        const publicKey = await jose.importSPKI(publicKeyPem, algorithms[0]);
        const { payload } = await jose.jwtVerify(token, publicKey, {
            algorithms,
        });
        return { valid: true, payload };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

export async function jwtVerifyEdDSA(
    token: string,
    publicKeyPem: string
): Promise<
    { valid: true; payload: jose.JWTPayload } | { valid: false; error: string }
> {
    try {
        const publicKey = await jose.importSPKI(publicKeyPem, "EdDSA");
        const { payload } = await jose.jwtVerify(token, publicKey, {
            algorithms: ["EdDSA"],
        });
        return { valid: true, payload };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// ============ JWT Decode (without verification) ============

export function jwtDecode(token: string): JwtDecoded {
    const parts = token.split(".");
    if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
    }

    const decodeBase64Url = (str: string): string => {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
            base64 += "=";
        }
        return decodeURIComponent(escape(atob(base64)));
    };

    const header = JSON.parse(decodeBase64Url(parts[0]));
    const payload = JSON.parse(decodeBase64Url(parts[1]));

    return {
        header,
        payload,
        signature: parts[2],
    };
}
