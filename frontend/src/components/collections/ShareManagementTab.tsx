import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Loader2,
    AlertCircle,
    Share2,
    Plus,
    Trash2,
    Edit3,
} from "lucide-react";
import toast from "react-hot-toast";
import { sharedCollectionsApi } from "@/lib/api/endpoints/shared-collections";
import type {
    CollectionShare,
    CollectionPermission,
} from "@/types/shared-collection.types";
import ShareCollectionModal from "./ShareCollectionModal";
import ConfirmModal from "../ui/ConfirmModal";
import { cn } from "@/lib/utils/cn";

export default function ShareManagementTab() {
    const queryClient = useQueryClient();
    const [selectedCollectionId, setSelectedCollectionId] = useState<
        string | null
    >(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<CollectionShare | null>(
        null
    );

    // Fetch collections with active shares
    const { data: collectionsData, isLoading: isLoadingCollections } = useQuery(
        {
            queryKey: ["my-shared-collections"],
            queryFn: () => sharedCollectionsApi.getMySharedCollections(),
        }
    );

    // Fetch shares for selected collection
    const {
        data: shares,
        isLoading: isLoadingShares,
        error: sharesError,
    } = useQuery({
        queryKey: ["collection-shares", selectedCollectionId],
        queryFn: () =>
            sharedCollectionsApi.getCollectionShares(selectedCollectionId!),
        enabled: !!selectedCollectionId,
    });

    // Update permission mutation
    const updatePermissionMutation = useMutation({
        mutationFn: ({
            shareId,
            permission,
        }: {
            shareId: string;
            permission: CollectionPermission;
        }) =>
            sharedCollectionsApi.updateSharePermission(
                selectedCollectionId!,
                shareId,
                { permission }
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["collection-shares", selectedCollectionId],
            });
            toast.success("Permission updated!");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to update permission"
            );
        },
    });

    // Revoke share mutation
    const revokeMutation = useMutation({
        mutationFn: (shareId: string) =>
            sharedCollectionsApi.revokeShare(selectedCollectionId!, shareId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["collection-shares", selectedCollectionId],
            });
            toast.success("Access revoked!");
            setDeleteConfirm(null);
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to revoke access"
            );
        },
    });

    const collections = Array.isArray(collectionsData) ? collectionsData : [];
    const selectedCollection = collections.find(
        (c: any) => c.id === selectedCollectionId
    );

    const handleTogglePermission = (share: CollectionShare) => {
        const newPermission = share.permission === "VIEW" ? "EDIT" : "VIEW";
        updatePermissionMutation.mutate({
            shareId: share.id,
            permission: newPermission,
        });
    };

    if (isLoadingCollections) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
        );
    }

    if (collections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 dark:text-neutral-400">
                <Share2 className="w-16 h-16 mb-4 text-neutral-300 dark:text-neutral-600" />
                <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
                    No collections to share
                </p>
                <p className="text-sm mt-1">Create a collection first</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Collection Selector */}
            <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Select Collection to Manage
                </label>
                <select
                    value={selectedCollectionId || ""}
                    onChange={(e) => setSelectedCollectionId(e.target.value)}
                    className={cn(
                        "w-full max-w-md px-3 py-2.5 text-sm rounded-lg",
                        "border border-neutral-300 dark:border-neutral-600",
                        "bg-white dark:bg-neutral-900",
                        "text-neutral-900 dark:text-neutral-100",
                        "focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                    )}
                >
                    <option value="">-- Choose a collection --</option>
                    {collections.map((col) => (
                        <option key={col.id} value={col.id}>
                            {col.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Shares Table */}
            {selectedCollectionId && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Shared With
                        </h3>
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:opacity-90 flex items-center gap-1.5"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Share with someone
                        </button>
                    </div>

                    {isLoadingShares ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
                        </div>
                    ) : sharesError ? (
                        <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                            <AlertCircle className="w-8 h-8 mb-2 text-red-400" />
                            <p className="text-sm">Failed to load shares</p>
                        </div>
                    ) : !shares || shares.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                            <p className="text-sm">
                                This collection hasn't been shared yet
                            </p>
                        </div>
                    ) : (
                        <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-neutral-50 dark:bg-neutral-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                                            User
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                                            Permission
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                                            Shared
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                    {shares.map((share) => (
                                        <tr
                                            key={share.id}
                                            className="bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                        >
                                            <td className="px-4 py-3">
                                                <div>
                                                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                                        {share.user.name ||
                                                            "Unknown"}
                                                    </div>
                                                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                                                        {share.user.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                                                        share.permission ===
                                                            "EDIT"
                                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                                    )}
                                                >
                                                    {share.permission}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">
                                                {new Date(
                                                    share.invitedAt
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleTogglePermission(
                                                                share
                                                            )
                                                        }
                                                        disabled={
                                                            updatePermissionMutation.isPending
                                                        }
                                                        title="Toggle permission"
                                                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors disabled:opacity-50"
                                                    >
                                                        <Edit3 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeleteConfirm(
                                                                share
                                                            )
                                                        }
                                                        title="Revoke access"
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Share Modal */}
            {selectedCollection && (
                <ShareCollectionModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    collectionId={selectedCollection.id}
                    collectionName={selectedCollection.name}
                />
            )}

            {/* Revoke Confirmation */}
            <ConfirmModal
                isOpen={!!deleteConfirm}
                title="Revoke Access"
                message={`Revoke ${deleteConfirm?.user.email}'s access to this collection?`}
                confirmText="Revoke"
                cancelText="Cancel"
                variant="danger"
                onConfirm={() =>
                    deleteConfirm && revokeMutation.mutate(deleteConfirm.id)
                }
                onCancel={() => setDeleteConfirm(null)}
                isLoading={revokeMutation.isPending}
            />
        </div>
    );
}
