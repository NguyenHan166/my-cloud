import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { sharedLinksApi } from "@/lib/api/endpoints/sharedLinks";
import PublicItemView from "@/components/shared/PublicItemView";
import PasswordVerifyModal from "@/components/shared/PasswordVerifyModal";
import type { AccessSharedLinkResponse } from "@/types/sharedLink.types";

export default function SharedLinkPage() {
    const { token } = useParams<{ token: string }>();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AccessSharedLinkResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        if (token) {
            fetchSharedItem();
        }
    }, [token]);

    const fetchSharedItem = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await sharedLinksApi.access(token!);
            setData(response);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message;

            // Check if password is required
            if (
                err.response?.status === 401 &&
                errorMessage.includes("Password required")
            ) {
                setShowPasswordModal(true);
            } else if (errorMessage.includes("expired")) {
                setError("This share link has expired.");
            } else if (errorMessage.includes("revoked")) {
                setError("This share link has been revoked.");
            } else {
                setError(
                    "Failed to load shared content. Please check the link and try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordVerify = async (password: string) => {
        try {
            setVerifying(true);
            setPasswordError(null);
            const response = await sharedLinksApi.verifyPassword(
                token!,
                password
            );
            setData(response);
            setShowPasswordModal(false);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message;
            setPasswordError(
                errorMessage.includes("Invalid password")
                    ? "Incorrect password. Please try again."
                    : "Verification failed. Please try again."
            );
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/40 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-sky-400/10 dark:bg-sky-600/5 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/5 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2" />

            {/* Header */}
            <header className="relative bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                Personal Cloud
                            </h1>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Shared Content
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-sky-600 dark:text-sky-400 animate-spin mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Loading shared content...
                        </p>
                    </div>
                )}

                {error && !loading && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-red-900 dark:text-red-200 mb-2">
                                Unable to Access
                            </h2>
                            <p className="text-red-700 dark:text-red-300">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {data && !loading && !error && (
                    <PublicItemView
                        item={data.item}
                        expiresAt={data.link.expiresAt}
                        accessCount={data.link.accessCount}
                    />
                )}
            </main>

            {/* Password Modal */}
            <PasswordVerifyModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onVerify={handlePasswordVerify}
                error={passwordError || undefined}
                loading={verifying}
            />

            {/* Footer */}
            <footer className="relative mt-16 border-t border-neutral-200 dark:border-neutral-700 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                        Powered by Personal Cloud • Secure file sharing
                    </p>
                </div>
            </footer>
        </div>
    );
}
