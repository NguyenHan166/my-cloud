import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

interface EditShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: {
        expiresIn?: number;
        password?: string | null;
    }) => Promise<void>;
    currentExpiration: string;
    hasPassword: boolean;
    revoked?: boolean;
}

export default function EditShareModal({
    isOpen,
    onClose,
    onSave,
    currentExpiration,
    hasPassword,
    revoked = false,
}: EditShareModalProps) {
    const [expiresIn, setExpiresIn] = useState(24);
    const [password, setPassword] = useState("");
    const [removePassword, setRemovePassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const expirationOptions = [
        { label: "1 hour", value: 1 },
        { label: "6 hours", value: 6 },
        { label: "12 hours", value: 12 },
        { label: "1 day", value: 24 },
        { label: "2 days", value: 48 },
        { label: "3 days", value: 72 },
        { label: "1 week", value: 168 },
    ];

    const handleSave = async () => {
        try {
            setLoading(true);
            const updateData: { expiresIn?: number; password?: string | null } =
                {};

            updateData.expiresIn = expiresIn;

            if (removePassword) {
                updateData.password = null;
            } else if (password.trim()) {
                updateData.password = password.trim();
            }

            await onSave(updateData);
            onClose();
        } catch (err) {
            // Error handled by parent
        } finally {
            setLoading(false);
        }
    };

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
                <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                            Edit Share Link
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        {/* Restore Warning */}
                        {revoked && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                                    ✅ Updating this link will restore it
                                    (unrevoking)
                                </p>
                            </div>
                        )}

                        {/* Current Expiration Info */}
                        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Current expiration:{" "}
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                    {new Date(
                                        currentExpiration
                                    ).toLocaleString()}
                                </span>
                            </p>
                        </div>

                        {/* Expiration */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                New Expiration
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

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Password
                            </label>

                            {hasPassword && (
                                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={removePassword}
                                        onChange={(e) => {
                                            setRemovePassword(e.target.checked);
                                            if (e.target.checked)
                                                setPassword("");
                                        }}
                                        className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 rounded focus:ring-sky-500"
                                    />
                                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                        Remove password protection
                                    </span>
                                </label>
                            )}

                            {!removePassword && (
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder={
                                        hasPassword
                                            ? "Enter new password to change"
                                            : "Set password (optional)"
                                    }
                                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                                />
                            )}
                            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Leave empty to keep current password unchanged
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 px-6 py-4 bg-neutral-50 dark:bg-neutral-800 rounded-b-2xl">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
