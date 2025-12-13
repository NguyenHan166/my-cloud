import { X, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

interface DeleteShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRevoke: () => Promise<void>;
    onPermanentDelete: () => Promise<void>;
    itemTitle: string;
    loading?: boolean;
}

export default function DeleteShareModal({
    isOpen,
    onClose,
    onRevoke,
    onPermanentDelete,
    itemTitle,
    loading,
}: DeleteShareModalProps) {
    if (!isOpen) return null;

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
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                Delete Share Link
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
                    <div className="p-6 space-y-4">
                        <p className="text-neutral-700 dark:text-neutral-300">
                            Choose how to remove this share link for:
                        </p>
                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                {itemTitle}
                            </p>
                        </div>

                        {/* Revoke Option */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                            <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                                🚫 Revoke (Soft Delete)
                            </h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                                Link will be disabled but kept in database.
                                Access attempts will be blocked.
                            </p>
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    await onRevoke();
                                    onClose();
                                }}
                                disabled={loading}
                                className="w-full border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                            >
                                Revoke Link
                            </Button>
                        </div>

                        {/* Permanent Delete Option */}
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                                ⚠️ Permanent Delete
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                Link will be permanently removed from database.{" "}
                                <strong>This cannot be undone!</strong>
                            </p>
                            <Button
                                variant="danger"
                                onClick={async () => {
                                    await onPermanentDelete();
                                    onClose();
                                }}
                                disabled={loading}
                                className="w-full"
                            >
                                Delete Permanently
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-800 rounded-b-2xl">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
