import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { sharedCollectionsApi } from "@/lib/api/endpoints/shared-collections";
import type {
    CreateShareDto,
    CollectionPermission,
} from "@/types/shared-collection.types";
import { cn } from "@/lib/utils/cn";

interface ShareCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
    collectionName: string;
}

export default function ShareCollectionModal({
    isOpen,
    onClose,
    collectionId,
    collectionName,
}: ShareCollectionModalProps) {
    const queryClient = useQueryClient();
    const [userEmail, setUserEmail] = useState("");
    const [permission, setPermission] = useState<CollectionPermission>("VIEW");

    const shareMutation = useMutation({
        mutationFn: (data: CreateShareDto) =>
            sharedCollectionsApi.shareCollection(collectionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["collection-shares", collectionId],
            });
            toast.success("Collection shared successfully!");
            handleClose();
        },
        onError: (error: any) => {
            const message =
                error.response?.data?.message || "Failed to share collection";
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userEmail.trim()) {
            toast.error("Please enter an email address");
            return;
        }
        shareMutation.mutate({ userEmail: userEmail.trim(), permission });
    };

    const handleClose = () => {
        setUserEmail("");
        setPermission("VIEW");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            Share Collection
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {collectionName}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            User Email
                        </label>
                        <input
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="friend@example.com"
                            className={cn(
                                "w-full px-3 py-2.5 text-sm rounded-lg",
                                "border border-neutral-300 dark:border-neutral-600",
                                "bg-white dark:bg-neutral-900",
                                "text-neutral-900 dark:text-neutral-100",
                                "placeholder:text-neutral-400",
                                "focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                            )}
                            required
                        />
                    </div>

                    {/* Permission Select */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Permission Level
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPermission("VIEW")}
                                className={cn(
                                    "p-3 rounded-lg border-2 transition-all text-left",
                                    permission === "VIEW"
                                        ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
                                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                                )}
                            >
                                <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                    View Only
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                    Can browse items
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPermission("EDIT")}
                                className={cn(
                                    "p-3 rounded-lg border-2 transition-all text-left",
                                    permission === "EDIT"
                                        ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20"
                                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                                )}
                            >
                                <div className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                    Can Edit
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                    Can add/remove items
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={shareMutation.isPending}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {shareMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sharing...
                                </>
                            ) : (
                                "Share Collection"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
