import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";
import type { Item, QueryItemsDto } from "@/types/item.types";
import { itemsApi } from "@/lib/api/endpoints/items";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import DeleteOptionModal from "@/components/library/DeleteOptionModal";
import LibraryToolbar from "@/components/library/LibraryToolbar";
import ItemCard from "@/components/library/ItemCard";
import ItemListRow from "@/components/library/ItemListRow";
import ItemDetailPanel from "@/components/library/ItemDetailPanel";
import CreateItemModal from "@/components/library/CreateItemModal";

export default function LibraryPage() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [filters, setFilters] = useState<QueryItemsDto>(() => {
        // Initialize filters from URL params
        const tagsParam = searchParams.get("tags");
        return {
            page: 1,
            limit: 20,
            sortBy: "createdAt",
            sortOrder: "desc",
            tagIds: tagsParam ? [tagsParam] : undefined,
        };
    });
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Item | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Sync URL params with filters (for tags) - only on initial load
    useEffect(() => {
        const tagsParam = searchParams.get("tags");
        if (tagsParam) {
            setFilters((prev) => ({
                ...prev,
                tagIds: [tagsParam],
                page: 1,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Clear tags param from URL when filter is cleared
    const handleFilterChange = (newFilters: Partial<QueryItemsDto>) => {
        const updatedFilters = { ...newFilters, page: 1 };
        setFilters((prev) => ({ ...prev, ...updatedFilters }));

        // If tagIds filter is being changed, update URL
        if (newFilters.tagIds !== undefined) {
            const newSearchParams = new URLSearchParams(searchParams);
            if (!newFilters.tagIds || newFilters.tagIds.length === 0) {
                newSearchParams.delete("tags");
            } else {
                newSearchParams.set("tags", newFilters.tagIds[0]);
            }
            setSearchParams(newSearchParams, { replace: true });
        }
    };

    // Fetch items
    const {
        data: itemsData,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["items", filters],
        queryFn: () => itemsApi.getItems(filters),
    });

    // Toggle pin mutation
    const pinMutation = useMutation({
        mutationFn: (itemId: string) => itemsApi.togglePin(itemId),
        onSuccess: (response, itemId) => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            // Update selectedItem immediately if it's the one being pinned
            if (selectedItem?.id === itemId && response.data?.item) {
                setSelectedItem(response.data.item as Item);
            }
            toast.success("Item updated");
        },
        onError: () => {
            toast.error("Failed to update item");
        },
    });

    // Move to Trash mutation
    const trashMutation = useMutation({
        mutationFn: (itemId: string) => itemsApi.moveToTrash(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            setIsPanelOpen(false);
            setSelectedItem(null);
            setDeleteConfirmId(null);
            toast.success("Item moved to trash");
        },
        onError: () => {
            toast.error("Failed to move item to trash");
        },
    });

    // Permanent Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (itemId: string) => itemsApi.deleteItem(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            setIsPanelOpen(false);
            setSelectedItem(null);
            setDeleteConfirmId(null);
            toast.success("Item permanently deleted");
        },
        onError: () => {
            toast.error("Failed to delete item");
        },
    });

    // Handlers
    const handleSearchChange = (search: string) => {
        setFilters((prev) => ({ ...prev, search, page: 1 }));
    };

    const handleItemClick = (item: Item) => {
        setSelectedItem(item);
        setIsPanelOpen(true);
    };

    // Extract items from response
    const items = itemsData?.data?.data || [];
    const pagination = {
        total: itemsData?.data?.meta?.total || 0,
        page: itemsData?.data?.meta?.page || 1,
        totalPages: itemsData?.data?.meta?.totalPages || 1,
    };

    // Sync selectedItem with latest data from items list
    useEffect(() => {
        if (selectedItem && items.length > 0) {
            const updatedItem = items.find((i) => i.id === selectedItem.id);
            if (
                updatedItem &&
                JSON.stringify(updatedItem) !== JSON.stringify(selectedItem)
            ) {
                setSelectedItem(updatedItem);
            }
        }
    }, [items, selectedItem]);

    const handlePin = async (itemId: string) => {
        await pinMutation.mutateAsync(itemId);
    };

    const handleDelete = async (itemId: string) => {
        setDeleteConfirmId(itemId);
    };

    const handleConfirmTrash = async () => {
        if (!deleteConfirmId) return;
        await trashMutation.mutateAsync(deleteConfirmId);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmId) return;
        await deleteMutation.mutateAsync(deleteConfirmId);
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Render loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-6 w-96" />
                </div>
                <div className="mb-6">
                    <Skeleton className="h-12 w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-64" />
                    ))}
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900">
                        Library
                    </h1>
                    <p className="text-neutral-600 mt-2">
                        Your personal knowledge base
                    </p>
                </div>
                <ErrorState
                    title="Failed to load items"
                    message="There was an error loading your library. Please try again."
                    onRetry={refetch}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-blue-50/40 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-200/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        Library
                    </h1>
                    <p className="text-lg text-neutral-600">
                        Your personal knowledge base
                    </p>
                </div>

                {/* Toolbar */}
                <div className="mb-6">
                    <LibraryToolbar
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        onSearchChange={handleSearchChange}
                        onFilterChange={handleFilterChange}
                        onCreateClick={() => setIsCreateModalOpen(true)}
                        filters={filters}
                    />
                </div>

                {/* Results count */}
                {items.length > 0 && (
                    <div className="mb-4 text-sm text-neutral-600">
                        Showing {items.length} of {pagination.total} items
                    </div>
                )}

                {/* Items grid/list */}
                {items.length === 0 ? (
                    <EmptyState
                        icon={<FileText className="w-16 h-16" />}
                        title="No items found"
                        description={
                            filters.search || filters.type
                                ? "Try adjusting your filters or search term"
                                : "Start building your library by adding files, links, or notes"
                        }
                        action={{
                            label: "Add Item",
                            onClick: () => setIsCreateModalOpen(true),
                        }}
                    />
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {items.map((item) => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onClick={() => handleItemClick(item)}
                                onPin={() => handlePin(item.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                        {items.map((item) => (
                            <ItemListRow
                                key={item.id}
                                item={item}
                                onClick={() => handleItemClick(item)}
                                onPin={() => handlePin(item.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        <button
                            type="button"
                            onClick={() =>
                                handlePageChange(pagination.page - 1)
                            }
                            disabled={pagination.page === 1}
                            className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-neutral-700">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                handlePageChange(pagination.page + 1)
                            }
                            disabled={pagination.page === pagination.totalPages}
                            className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Item Detail Panel */}
                <ItemDetailPanel
                    item={selectedItem}
                    isOpen={isPanelOpen}
                    onClose={() => {
                        setIsPanelOpen(false);
                        setSelectedItem(null);
                    }}
                    onEdit={(item) => {
                        setEditItem(item);
                        setIsCreateModalOpen(true);
                    }}
                    onPin={handlePin}
                    onDelete={handleDelete}
                />

                {/* Create/Edit Item Modal */}
                <CreateItemModal
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setEditItem(null);
                    }}
                    editItem={editItem}
                />

                {/* Delete Options Modal */}
                <DeleteOptionModal
                    isOpen={!!deleteConfirmId}
                    onClose={() => setDeleteConfirmId(null)}
                    onMoveToTrash={handleConfirmTrash}
                    onDeletePermanently={handleConfirmDelete}
                    isTrashing={trashMutation.isPending}
                    isDeleting={deleteMutation.isPending}
                />
            </div>
        </div>
    );
}
