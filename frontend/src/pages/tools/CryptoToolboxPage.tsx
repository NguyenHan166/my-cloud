import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Key,
    Code,
    Lock,
    Copy,
    Check,
    RefreshCw,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Import utilities
import {
    // Encoding
    base64Encode,
    base64Decode,
    base64UrlEncode,
    base64UrlDecode,
    hexEncode,
    hexDecode,
    urlEncode,
    urlDecode,
    jsonPrettify,
    jsonMinify,
    // Crypto
    generateRandomKey,
    deriveKeyPBKDF2,
    deriveKeyArgon2,
    deriveKeyScrypt,
    hashData,
    hmacSign,
    aesGcmEncrypt,
    aesGcmDecrypt,
    // JWT
    jwtSignHS,
    jwtVerifyHS,
    jwtDecode,
    generateRSAKeyPair,
    jwtSignRS,
    jwtVerifyRS,
    type KeyFormat,
    type HashAlgorithm,
    type KdfAlgorithm,
} from "@/lib/crypto";

type TabId = "keys" | "encode" | "crypto";

const TABS = [
    { id: "keys" as TabId, label: "Key & Token", icon: Key },
    { id: "encode" as TabId, label: "Encode/Decode", icon: Code },
    { id: "crypto" as TabId, label: "Crypto", icon: Lock },
];

export default function CryptoToolboxPage() {
    const [activeTab, setActiveTab] = useState<TabId>("keys");

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link
                        to="/tools"
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-500" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Key className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Crypto Toolbox
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-1 border-b border-neutral-200 dark:border-neutral-700">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.id
                                            ? "border-violet-500 text-violet-600 dark:text-violet-400"
                                            : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {activeTab === "keys" && <KeysTab />}
                {activeTab === "encode" && <EncodeTab />}
                {activeTab === "crypto" && <CryptoTab />}
            </div>
        </div>
    );
}

// ============ Copy Button Helper ============

function CopyButton({
    text,
    className = "",
}: {
    text: string;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Đã sao chép!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            disabled={!text}
            className={`p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50 ${className}`}
            title="Sao chép"
        >
            {copied ? (
                <Check className="w-4 h-4 text-green-500" />
            ) : (
                <Copy className="w-4 h-4 text-neutral-500" />
            )}
        </button>
    );
}

// ============ Card Component ============

function Card({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                {title}
            </h3>
            {children}
        </div>
    );
}

// ============ Keys Tab ============

function KeysTab() {
    return (
        <div className="space-y-6">
            <RandomKeyGenerator />
            <KdfSection />
            <JwtSection />
        </div>
    );
}

function RandomKeyGenerator() {
    const [bytes, setBytes] = useState<16 | 24 | 32 | 64>(32);
    const [format, setFormat] = useState<KeyFormat>("hex");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const generate = async () => {
        setLoading(true);
        try {
            const key = await generateRandomKey(bytes, format);
            setResult(key);
        } catch (err) {
            toast.error("Lỗi khi tạo key");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="🔑 Random Key Generator">
            <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs text-neutral-500 mb-1">
                            Kích thước
                        </label>
                        <select
                            value={bytes}
                            onChange={(e) =>
                                setBytes(
                                    Number(e.target.value) as 16 | 24 | 32 | 64
                                )
                            }
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                        >
                            <option value={16}>16 bytes (128 bit)</option>
                            <option value={24}>24 bytes (192 bit)</option>
                            <option value={32}>32 bytes (256 bit)</option>
                            <option value={64}>64 bytes (512 bit)</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-xs text-neutral-500 mb-1">
                            Định dạng
                        </label>
                        <select
                            value={format}
                            onChange={(e) =>
                                setFormat(e.target.value as KeyFormat)
                            }
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                        >
                            <option value="hex">Hex</option>
                            <option value="base64url">Base64URL</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={generate}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            />
                            Generate
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="relative">
                        <textarea
                            value={result}
                            readOnly
                            className="w-full px-4 py-3 pr-12 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono text-neutral-900 dark:text-white resize-none"
                            rows={2}
                        />
                        <CopyButton
                            text={result}
                            className="absolute top-2 right-2"
                        />
                    </div>
                )}
            </div>
        </Card>
    );
}

function KdfSection() {
    const [algorithm, setAlgorithm] = useState<KdfAlgorithm>("PBKDF2");
    const [passphrase, setPassphrase] = useState("");
    const [salt, setSalt] = useState("random-salt");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    // PBKDF2 params
    const [iterations, setIterations] = useState(100000);
    // Argon2 params
    const [argonMemory, setArgonMemory] = useState(65536);
    const [argonIterations, setArgonIterations] = useState(3);
    // scrypt params
    const [scryptN, setScryptN] = useState(16384);

    const derive = async () => {
        if (!passphrase) {
            toast.error("Vui lòng nhập passphrase");
            return;
        }
        setLoading(true);
        try {
            let key = "";
            if (algorithm === "PBKDF2") {
                key = await deriveKeyPBKDF2(passphrase, {
                    salt,
                    iterations,
                    keyLength: 32,
                    hash: "SHA-256",
                });
            } else if (algorithm === "Argon2id") {
                key = await deriveKeyArgon2(passphrase, {
                    salt,
                    parallelism: 1,
                    iterations: argonIterations,
                    memorySize: argonMemory,
                    hashLength: 32,
                });
            } else if (algorithm === "scrypt") {
                key = await deriveKeyScrypt(passphrase, {
                    salt,
                    costFactor: scryptN,
                    blockSize: 8,
                    parallelism: 1,
                    hashLength: 32,
                });
            }
            setResult(key);
        } catch (err) {
            toast.error("Lỗi khi derive key");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="🔐 Key Derivation Function (KDF)">
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {(["PBKDF2", "Argon2id", "scrypt"] as KdfAlgorithm[]).map(
                        (alg) => (
                            <button
                                key={alg}
                                onClick={() => setAlgorithm(alg)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    algorithm === alg
                                        ? "bg-violet-500 text-white"
                                        : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                                }`}
                            >
                                {alg}
                            </button>
                        )
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                            Passphrase
                        </label>
                        <input
                            type="text"
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            placeholder="Nhập passphrase..."
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                            Salt
                        </label>
                        <input
                            type="text"
                            value={salt}
                            onChange={(e) => setSalt(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                        />
                    </div>
                </div>

                {/* Algorithm-specific params */}
                {algorithm === "PBKDF2" && (
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                            Iterations
                        </label>
                        <input
                            type="number"
                            value={iterations}
                            onChange={(e) =>
                                setIterations(Number(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                        />
                    </div>
                )}
                {algorithm === "Argon2id" && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">
                                Memory (KB)
                            </label>
                            <input
                                type="number"
                                value={argonMemory}
                                onChange={(e) =>
                                    setArgonMemory(Number(e.target.value))
                                }
                                className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">
                                Iterations
                            </label>
                            <input
                                type="number"
                                value={argonIterations}
                                onChange={(e) =>
                                    setArgonIterations(Number(e.target.value))
                                }
                                className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                            />
                        </div>
                    </div>
                )}
                {algorithm === "scrypt" && (
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                            Cost Factor (N)
                        </label>
                        <input
                            type="number"
                            value={scryptN}
                            onChange={(e) => setScryptN(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                        />
                    </div>
                )}

                <button
                    onClick={derive}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
                >
                    <Key
                        className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`}
                    />
                    Derive Key
                </button>

                {result && (
                    <div className="relative">
                        <textarea
                            value={result}
                            readOnly
                            className="w-full px-4 py-3 pr-12 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono text-neutral-900 dark:text-white resize-none"
                            rows={2}
                        />
                        <CopyButton
                            text={result}
                            className="absolute top-2 right-2"
                        />
                    </div>
                )}
            </div>
        </Card>
    );
}

function JwtSection() {
    const [mode, setMode] = useState<"sign" | "verify" | "decode">("sign");
    const [algorithm, setAlgorithm] = useState<"HS256" | "RS256">("HS256");
    const [payload, setPayload] = useState(
        '{\n  "sub": "1234567890",\n  "name": "John Doe"\n}'
    );
    const [secret, setSecret] = useState("my-secret-key");
    const [privateKey, setPrivateKey] = useState("");
    const [publicKey, setPublicKey] = useState("");
    const [token, setToken] = useState("");
    const [result, setResult] = useState("");
    const [verifyResult, setVerifyResult] = useState<{
        valid: boolean;
        message: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    const generateKeys = async () => {
        setLoading(true);
        try {
            const keys = await generateRSAKeyPair();
            setPrivateKey(keys.privateKey);
            setPublicKey(keys.publicKey);
            toast.success("Đã tạo RSA key pair!");
        } catch (err) {
            toast.error("Lỗi khi tạo key pair");
        } finally {
            setLoading(false);
        }
    };

    const sign = async () => {
        setLoading(true);
        try {
            const payloadObj = JSON.parse(payload);
            let jwt = "";
            if (algorithm === "HS256") {
                jwt = await jwtSignHS(payloadObj, secret, "HS256", "1h");
            } else {
                if (!privateKey) {
                    toast.error("Vui lòng tạo hoặc nhập private key");
                    return;
                }
                jwt = await jwtSignRS(payloadObj, privateKey, "RS256", "1h");
            }
            setResult(jwt);
        } catch (err) {
            toast.error("Lỗi khi sign JWT");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const verify = async () => {
        setLoading(true);
        try {
            let res;
            if (algorithm === "HS256") {
                res = await jwtVerifyHS(token, secret);
            } else {
                if (!publicKey) {
                    toast.error("Vui lòng nhập public key");
                    return;
                }
                res = await jwtVerifyRS(token, publicKey);
            }
            setVerifyResult({
                valid: res.valid,
                message: res.valid
                    ? JSON.stringify(res.payload, null, 2)
                    : res.error,
            });
        } catch (err) {
            setVerifyResult({ valid: false, message: "Invalid token" });
        } finally {
            setLoading(false);
        }
    };

    const decode = () => {
        try {
            const decoded = jwtDecode(token);
            setResult(JSON.stringify(decoded, null, 2));
        } catch (err) {
            toast.error("Invalid JWT format");
        }
    };

    return (
        <Card title="🎫 JWT (JSON Web Token)">
            <div className="space-y-4">
                {/* Mode selector */}
                <div className="flex gap-2">
                    {(["sign", "verify", "decode"] as const).map((m) => (
                        <button
                            key={m}
                            onClick={() => {
                                setMode(m);
                                setResult("");
                                setVerifyResult(null);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                                mode === m
                                    ? "bg-violet-500 text-white"
                                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {/* Algorithm selector */}
                {mode !== "decode" && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setAlgorithm("HS256")}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                algorithm === "HS256"
                                    ? "bg-blue-500 text-white"
                                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                            }`}
                        >
                            HS256 (Symmetric)
                        </button>
                        <button
                            onClick={() => setAlgorithm("RS256")}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                algorithm === "RS256"
                                    ? "bg-blue-500 text-white"
                                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                            }`}
                        >
                            RS256 (Asymmetric)
                        </button>
                    </div>
                )}

                {/* Sign mode */}
                {mode === "sign" && (
                    <>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">
                                Payload (JSON)
                            </label>
                            <textarea
                                value={payload}
                                onChange={(e) => setPayload(e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono"
                                rows={4}
                            />
                        </div>
                        {algorithm === "HS256" ? (
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">
                                    Secret
                                </label>
                                <input
                                    type="text"
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                                />
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={generateKeys}
                                    disabled={loading}
                                    className="text-sm text-violet-500 hover:text-violet-600"
                                >
                                    + Tạo RSA Key Pair
                                </button>
                                <div>
                                    <label className="block text-xs text-neutral-500 mb-1">
                                        Private Key (PEM)
                                    </label>
                                    <textarea
                                        value={privateKey}
                                        onChange={(e) =>
                                            setPrivateKey(e.target.value)
                                        }
                                        className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono"
                                        rows={4}
                                        placeholder="-----BEGIN PRIVATE KEY-----"
                                    />
                                </div>
                            </>
                        )}
                        <button
                            onClick={sign}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
                        >
                            Sign JWT
                        </button>
                    </>
                )}

                {/* Verify mode */}
                {mode === "verify" && (
                    <>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">
                                Token
                            </label>
                            <textarea
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono"
                                rows={3}
                                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            />
                        </div>
                        {algorithm === "HS256" ? (
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">
                                    Secret
                                </label>
                                <input
                                    type="text"
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">
                                    Public Key (PEM)
                                </label>
                                <textarea
                                    value={publicKey}
                                    onChange={(e) =>
                                        setPublicKey(e.target.value)
                                    }
                                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono"
                                    rows={4}
                                    placeholder="-----BEGIN PUBLIC KEY-----"
                                />
                            </div>
                        )}
                        <button
                            onClick={verify}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
                        >
                            Verify JWT
                        </button>
                        {verifyResult && (
                            <div
                                className={`p-4 rounded-lg ${
                                    verifyResult.valid
                                        ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                                        : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {verifyResult.valid ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                    )}
                                    <span className="font-medium">
                                        {verifyResult.valid
                                            ? "Valid!"
                                            : "Invalid!"}
                                    </span>
                                </div>
                                <pre className="text-xs font-mono overflow-auto whitespace-pre-wrap">
                                    {verifyResult.message}
                                </pre>
                            </div>
                        )}
                    </>
                )}

                {/* Decode mode */}
                {mode === "decode" && (
                    <>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">
                                Token
                            </label>
                            <textarea
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono"
                                rows={3}
                                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                            />
                        </div>
                        <button
                            onClick={decode}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                        >
                            Decode (không verify)
                        </button>
                    </>
                )}

                {/* Result */}
                {result && (
                    <div className="relative">
                        <textarea
                            value={result}
                            readOnly
                            className="w-full px-4 py-3 pr-12 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono text-neutral-900 dark:text-white resize-none"
                            rows={6}
                        />
                        <CopyButton
                            text={result}
                            className="absolute top-2 right-2"
                        />
                    </div>
                )}
            </div>
        </Card>
    );
}

// ============ Encode Tab ============

function EncodeTab() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EncoderCard
                title="Base64"
                encode={base64Encode}
                decode={base64Decode}
            />
            <EncoderCard
                title="Base64URL"
                encode={base64UrlEncode}
                decode={base64UrlDecode}
            />
            <EncoderCard title="Hex" encode={hexEncode} decode={hexDecode} />
            <EncoderCard
                title="URL Encode"
                encode={urlEncode}
                decode={urlDecode}
            />
            <div className="lg:col-span-2">
                <JsonCard />
            </div>
        </div>
    );
}

function EncoderCard({
    title,
    encode,
    decode,
}: {
    title: string;
    encode: (input: string) => string;
    decode: (input: string) => string;
}) {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");

    const handleEncode = () => {
        setError("");
        try {
            setOutput(encode(input));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Encode failed");
        }
    };

    const handleDecode = () => {
        setError("");
        try {
            setOutput(decode(input));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Decode failed");
        }
    };

    return (
        <Card title={title}>
            <div className="space-y-3">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập text..."
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono resize-none"
                    rows={3}
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleEncode}
                        className="flex-1 px-3 py-2 bg-violet-500 text-white rounded-lg text-sm hover:bg-violet-600 transition-colors"
                    >
                        Encode
                    </button>
                    <button
                        onClick={handleDecode}
                        className="flex-1 px-3 py-2 bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg text-sm hover:bg-neutral-300 dark:hover:bg-neutral-500 transition-colors"
                    >
                        Decode
                    </button>
                </div>
                {error && <div className="text-xs text-red-500">{error}</div>}
                {output && (
                    <div className="relative">
                        <textarea
                            value={output}
                            readOnly
                            className="w-full px-3 py-2 pr-10 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono resize-none"
                            rows={3}
                        />
                        <CopyButton
                            text={output}
                            className="absolute top-1 right-1"
                        />
                    </div>
                )}
            </div>
        </Card>
    );
}

function JsonCard() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");

    const handlePrettify = () => {
        setError("");
        try {
            setOutput(jsonPrettify(input));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid JSON");
        }
    };

    const handleMinify = () => {
        setError("");
        try {
            setOutput(jsonMinify(input));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid JSON");
        }
    };

    return (
        <Card title="JSON Pretty / Minify">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono resize-none"
                        rows={6}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrettify}
                            className="flex-1 px-3 py-2 bg-violet-500 text-white rounded-lg text-sm hover:bg-violet-600 transition-colors"
                        >
                            Prettify
                        </button>
                        <button
                            onClick={handleMinify}
                            className="flex-1 px-3 py-2 bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg text-sm hover:bg-neutral-300 dark:hover:bg-neutral-500 transition-colors"
                        >
                            Minify
                        </button>
                    </div>
                    {error && (
                        <div className="text-xs text-red-500">{error}</div>
                    )}
                </div>
                <div className="relative">
                    <textarea
                        value={output}
                        readOnly
                        placeholder="Output..."
                        className="w-full h-full px-3 py-2 pr-10 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono resize-none min-h-[180px]"
                    />
                    {output && (
                        <CopyButton
                            text={output}
                            className="absolute top-1 right-1"
                        />
                    )}
                </div>
            </div>
        </Card>
    );
}

// ============ Crypto Tab ============

function CryptoTab() {
    return (
        <div className="space-y-6">
            <HashSection />
            <HmacSection />
            <AesSection />
        </div>
    );
}

function HashSection() {
    const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
    const [input, setInput] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const compute = async () => {
        setLoading(true);
        try {
            const hash = await hashData(input, algorithm);
            setResult(hash);
        } catch (err) {
            toast.error("Lỗi khi tính hash");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="🔢 Hash (SHA-256 / SHA-512)">
            <div className="space-y-4">
                <div className="flex gap-2">
                    {(["SHA-256", "SHA-512"] as HashAlgorithm[]).map((alg) => (
                        <button
                            key={alg}
                            onClick={() => setAlgorithm(alg)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                algorithm === alg
                                    ? "bg-violet-500 text-white"
                                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                            }`}
                        >
                            {alg}
                        </button>
                    ))}
                </div>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập dữ liệu cần hash..."
                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm resize-none"
                    rows={3}
                />
                <button
                    onClick={compute}
                    disabled={loading || !input}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
                >
                    Compute Hash
                </button>
                {result && (
                    <div className="relative">
                        <input
                            value={result}
                            readOnly
                            className="w-full px-4 py-3 pr-12 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono"
                        />
                        <CopyButton
                            text={result}
                            className="absolute top-1.5 right-2"
                        />
                    </div>
                )}
            </div>
        </Card>
    );
}

function HmacSection() {
    const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
    const [key, setKey] = useState("");
    const [data, setData] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const compute = async () => {
        if (!key || !data) {
            toast.error("Vui lòng nhập key và data");
            return;
        }
        setLoading(true);
        try {
            const sig = await hmacSign(key, data, algorithm);
            setResult(sig);
        } catch (err) {
            toast.error("Lỗi khi tính HMAC");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="✍️ HMAC (SHA-256 / SHA-512)">
            <div className="space-y-4">
                <div className="flex gap-2">
                    {(["SHA-256", "SHA-512"] as HashAlgorithm[]).map((alg) => (
                        <button
                            key={alg}
                            onClick={() => setAlgorithm(alg)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                algorithm === alg
                                    ? "bg-violet-500 text-white"
                                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                            }`}
                        >
                            {alg}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                            Secret Key
                        </label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="Nhập secret key..."
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-neutral-500 mb-1">
                            Data
                        </label>
                        <input
                            type="text"
                            value={data}
                            onChange={(e) => setData(e.target.value)}
                            placeholder="Nhập data cần sign..."
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                        />
                    </div>
                </div>
                <button
                    onClick={compute}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
                >
                    Compute HMAC
                </button>
                {result && (
                    <div className="relative">
                        <input
                            value={result}
                            readOnly
                            className="w-full px-4 py-3 pr-12 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono"
                        />
                        <CopyButton
                            text={result}
                            className="absolute top-1.5 right-2"
                        />
                    </div>
                )}
            </div>
        </Card>
    );
}

function AesSection() {
    const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
    const [key, setKey] = useState("");
    const [plaintext, setPlaintext] = useState("");
    const [ciphertext, setCiphertext] = useState("");
    const [iv, setIv] = useState("");
    const [tag, setTag] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const generateKey = async () => {
        const newKey = await generateRandomKey(32, "hex");
        setKey(newKey);
        toast.success("Đã tạo key 256-bit!");
    };

    const handleEncrypt = async () => {
        if (!key || !plaintext) {
            toast.error("Vui lòng nhập key và plaintext");
            return;
        }
        setLoading(true);
        try {
            const encrypted = await aesGcmEncrypt(key, plaintext);
            setCiphertext(encrypted.ciphertext);
            setIv(encrypted.iv);
            setTag(encrypted.tag);
            setResult(
                `Ciphertext: ${encrypted.ciphertext}\nIV: ${encrypted.iv}\nTag: ${encrypted.tag}`
            );
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Encrypt failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDecrypt = async () => {
        if (!key || !ciphertext || !iv || !tag) {
            toast.error("Vui lòng nhập đầy đủ key, ciphertext, IV và tag");
            return;
        }
        setLoading(true);
        try {
            const decrypted = await aesGcmDecrypt(key, ciphertext, iv, tag);
            setResult(decrypted);
        } catch (err) {
            toast.error("Decrypt failed - sai key hoặc dữ liệu bị thay đổi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="🔐 AES-256-GCM Encrypt / Decrypt">
            <div className="space-y-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode("encrypt")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            mode === "encrypt"
                                ? "bg-violet-500 text-white"
                                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                        }`}
                    >
                        Encrypt
                    </button>
                    <button
                        onClick={() => setMode("decrypt")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            mode === "decrypt"
                                ? "bg-violet-500 text-white"
                                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                        }`}
                    >
                        Decrypt
                    </button>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-neutral-500">
                            Key (256-bit hex)
                        </label>
                        <button
                            onClick={generateKey}
                            className="text-xs text-violet-500 hover:text-violet-600"
                        >
                            + Tạo key mới
                        </button>
                    </div>
                    <input
                        type="text"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="64 ký tự hex (32 bytes)"
                        className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono"
                    />
                </div>

                {mode === "encrypt" ? (
                    <>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">
                                Plaintext
                            </label>
                            <textarea
                                value={plaintext}
                                onChange={(e) => setPlaintext(e.target.value)}
                                placeholder="Nhập nội dung cần mã hóa..."
                                className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm resize-none"
                                rows={3}
                            />
                        </div>
                        <button
                            onClick={handleEncrypt}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
                        >
                            <Lock className="w-4 h-4" />
                            Encrypt
                        </button>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-3">
                                <label className="block text-xs text-neutral-500 mb-1">
                                    Ciphertext (hex)
                                </label>
                                <input
                                    type="text"
                                    value={ciphertext}
                                    onChange={(e) =>
                                        setCiphertext(e.target.value)
                                    }
                                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-neutral-500 mb-1">
                                    IV (hex)
                                </label>
                                <input
                                    type="text"
                                    value={iv}
                                    onChange={(e) => setIv(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-neutral-500 mb-1">
                                    Auth Tag (hex)
                                </label>
                                <input
                                    type="text"
                                    value={tag}
                                    onChange={(e) => setTag(e.target.value)}
                                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleDecrypt}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50"
                        >
                            <Key className="w-4 h-4" />
                            Decrypt
                        </button>
                    </>
                )}

                {result && (
                    <div className="relative">
                        <textarea
                            value={result}
                            readOnly
                            className="w-full px-4 py-3 pr-12 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm font-mono resize-none"
                            rows={4}
                        />
                        <CopyButton
                            text={result}
                            className="absolute top-2 right-2"
                        />
                    </div>
                )}
            </div>
        </Card>
    );
}
