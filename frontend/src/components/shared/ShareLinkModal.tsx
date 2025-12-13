import { useState } from "react";
import { X, Copy, Check, Link2 } from "lucide-react";
import { sharedLinksApi } from "@/lib/api/endpoints/sharedLinks";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface ShareLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: string;
    itemTitle: string;
}

export default function ShareLinkModal({
    isOpen,
    onClose,
    itemId,
    itemTitle,
}: ShareLinkModalProps) {
    const [expiresIn, setExpiresIn] = useState(24);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const expirationOptions = [
        { label: "1 hour", value: 1 },
        { label: "6 hours", value: 6 },
        { label: "12 hours", value: 12 },
        { label: "1 day", value: 24 },
        { label: "2 days", value: 48 },
        { label: "3 days", value: 72 },
        { label: "1 week", value: 168 },
    ];

    const handleGenerate = async () => {
        try {
            setLoading(true);
            const response = await sharedLinksApi.create({
                itemId,
                expiresIn,
                password: password.trim() || undefined,
            });
            setShareUrl(response.url);
            toast.success("Share link created successfully!");
        } catch (err: any) {
            toast.error(
                err.response?.data?.message || "Failed to create share link"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (shareUrl) {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setExpiresIn(24);
        setPassword("");
        setShareUrl(null);
        setCopied(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                                <Link2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                    Share Link
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {itemTitle}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {!shareUrl ? (
                            <>
                                {/* Expiration */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Link expires in
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {expirationOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() =>
                                                    setExpiresIn(option.value)
                                                }
                                                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                                                    expiresIn === option.value
                                                        ? "bg-sky-100 dark:bg-sky-900/30 border-sky-500 text-sky-700 dark:text-sky-300 font-medium"
                                                        : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-sky-300 dark:hover:border-sky-700"
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Password (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Password (Optional)
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Leave empty for no password"
                                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                                    />
                                    <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                        Add a password for extra security
                                    </p>
                                </div>

                                {/* Generate Button */}
                                <Button
                                    variant="primary"
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="w-full mt-4"
                                >
                                    {loading
                                        ? "Generating..."
                                        : "Generate Share Link"}
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Generated Link */}
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                            Share link generated!
                                        </span>
                                    </div>
                                    <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                                        This link will expire in{" "}
                                        {expiresIn <= 24
                                            ? `${expiresIn} hour${
                                                  expiresIn > 1 ? "s" : ""
                                              }`
                                            : `${expiresIn / 24} day${
                                                  expiresIn / 24 > 1 ? "s" : ""
                                              }`}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={shareUrl}
                                            readOnly
                                            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100"
                                        />
                                        <button
                                            onClick={handleCopy}
                                            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    <span className="text-sm">
                                                        Copied!
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    <span className="text-sm">
                                                        Copy
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Close Button */}
                                <Button
                                    variant="outline"
                                    onClick={handleClose}
                                    className="w-full"
                                >
                                    Close
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
