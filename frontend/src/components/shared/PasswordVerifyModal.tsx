import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

interface PasswordVerifyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (password: string) => Promise<void>;
    error?: string;
    loading?: boolean;
}

export default function PasswordVerifyModal({
    isOpen,
    onClose,
    onVerify,
    error,
    loading,
}: PasswordVerifyModalProps) {
    const [password, setPassword] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onVerify(password);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <span className="text-2xl">🔒</span>
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                Password Required
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            This shared link is protected. Please enter the
                            password to access the content.
                        </p>

                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                                autoFocus
                                disabled={loading}
                            />
                            {error && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                    {error}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                                disabled={loading || !password.trim()}
                            >
                                {loading ? "Verifying..." : "Verify"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
