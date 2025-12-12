import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, RotateCcw, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { itemsApi } from "@/lib/api/endpoints/items";
import ConfirmModal from "@/components/ui/ConfirmModal";
import EmptyState from "@/components/ui/EmptyState";
import ItemCard from "@/components/library/ItemCard";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";

export default function TrashPage() {
    const queryClient = useQueryClient();

    // State
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [emptyTrashConfirm, setEmptyTrashConfirm] = useState(false);
    const [restoreItemId, setRestoreItemId] = useState<string | null>(null);

    // Fetch trashed items
    const {
        data: itemsData,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["trash", { page, search }],
        queryFn: () => itemsApi.getTrashedItems({ page, limit: 20, search }),
    });

    // Restore mutation
    const restoreMutation = useMutation({
        mutationFn: (id: string) => itemsApi.restoreFromTrash(id),
        onSuccess: (_, variables) => {
            // Update cache immediately to remove item from list
            queryClient.setQueryData(
                ["trash", { page, search }],
                (oldData: any) => {
                    if (!oldData?.data?.data) return oldData;
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            data: oldData.data.data.filter(
                                (item: any) => item.id !== variables
                            ),
                        },
                    };
                }
            );

            // Still invalidate to ensure consistency eventually
            queryClient.invalidateQueries({ queryKey: ["trash"] });
            queryClient.invalidateQueries({ queryKey: ["items"] }); // Also refresh library
            toast.success("Item restored successfully");
        },
        onError: () => {
            toast.error("Failed to restore item");
        },
    });

    // Permanent delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => itemsApi.permanentlyDeleteItem(id),
        onSuccess: (_, variables) => {
            // Update cache immediately
            queryClient.setQueryData(
                ["trash", { page, search }],
                (oldData: any) => {
                    if (!oldData?.data?.data) return oldData;
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            data: oldData.data.data.filter(
                                (item: any) => item.id !== variables
                            ),
                        },
                    };
                }
            );

            queryClient.invalidateQueries({ queryKey: ["trash"] });
            setDeleteConfirmId(null);
            toast.success("Item permanently deleted");
        },
        onError: () => {
            toast.error("Failed to delete item");
        },
    });

    // Empty trash mutation
    const emptyTrashMutation = useMutation({
        mutationFn: () => itemsApi.emptyTrash(),
        onSuccess: (data) => {
            // Clear list immediately
            queryClient.setQueryData(
                ["trash", { page, search }],
                (oldData: any) => {
                    if (!oldData?.data?.data) return oldData;
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            data: [],
                        },
                    };
                }
            );

            queryClient.invalidateQueries({ queryKey: ["trash"] });
            setEmptyTrashConfirm(false);
            toast.success(data.data.message || "Trash emptied successfully");
        },
        onError: () => {
            toast.error("Failed to empty trash");
        },
    });

    // Handlers
    const handleRestore = async (id: string) => {
        setRestoreItemId(id); // Just for potential loading state in future
        await restoreMutation.mutateAsync(id);
        setRestoreItemId(null);
    };

    const handleConfirmDelete = async () => {
        if (deleteConfirmId) {
            await deleteMutation.mutateAsync(deleteConfirmId);
        }
    };

    const handleEmptyTrash = async () => {
        await emptyTrashMutation.mutateAsync();
    };

    // Derived state
    const items = itemsData?.data?.data || [];
    const pagination = {
        total: itemsData?.data?.meta?.total || 0,
        page: itemsData?.data?.meta?.page || 1,
        totalPages: itemsData?.data?.meta?.totalPages || 1,
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <Skeleton className="h-10 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-64" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <ErrorState
                    title="Failed to load trash"
                    message="Could not load deleted items. Please try again."
                    onRetry={refetch}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
                            <Trash2 className="w-8 h-8 text-neutral-400" />
                            Trash
                        </h1>
                        <p className="text-neutral-600 mt-1">
                            Items in trash will be permanently deleted after 30
                            days
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search trash..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                            />
                        </div>

                        {items.length > 0 && (
                            <button
                                onClick={() => setEmptyTrashConfirm(true)}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Empty Trash
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                {items.length === 0 ? (
                    <EmptyState
                        icon={<Trash2 className="w-16 h-16 text-neutral-300" />}
                        title="Trash is empty"
                        description={
                            search
                                ? "No trashed items match your search"
                                : "No items in trash"
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map((item) => (
                            <div key={item.id} className="relative group">
                                <div className="opacity-75 group-hover:opacity-100 transition-opacity">
                                    <ItemCard
                                        item={item}
                                        onClick={() =>
                                            toast(
                                                "Restore item to view details",
                                                { icon: "ℹ️" }
                                            )
                                        }
                                    />
                                </div>

                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl backdrop-blur-[1px]">
                                    <button
                                        onClick={() => handleRestore(item.id)}
                                        className="p-3 bg-white text-sky-600 rounded-full hover:bg-sky-50 transition-colors shadow-lg"
                                        title="Restore"
                                    >
                                        {restoreMutation.isPending &&
                                        restoreItemId === item.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <RotateCcw className="w-5 h-5" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() =>
                                            setDeleteConfirmId(item.id)
                                        }
                                        className="p-3 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                                        title="Delete Permanently"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Info badge */}
                                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.trashedAt
                                        ? `Deleted ${new Date(
                                              item.trashedAt
                                          ).toLocaleDateString()}`
                                        : "In Trash"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-neutral-700">
                            Page {page} of {pagination.totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setPage((p) =>
                                    Math.min(pagination.totalPages, p + 1)
                                )
                            }
                            disabled={page === pagination.totalPages}
                            className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Delete One Confirmation */}
                <ConfirmModal
                    isOpen={!!deleteConfirmId}
                    title="Delete Permanently?"
                    message="This action cannot be undone. The item will be lost forever."
                    confirmText="Delete Permanently"
                    variant="danger"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setDeleteConfirmId(null)}
                    isLoading={deleteMutation.isPending}
                />

                {/* Empty Trash Confirmation */}
                <ConfirmModal
                    isOpen={emptyTrashConfirm}
                    title="Empty Trash?"
                    message="Are you sure you want to permanently delete ALL items in the trash? This action cannot be undone."
                    confirmText="Empty Trash"
                    variant="danger"
                    onConfirm={handleEmptyTrash}
                    onCancel={() => setEmptyTrashConfirm(false)}
                    isLoading={emptyTrashMutation.isPending}
                />
            </div>
        </div>
    );
}
