import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
    Plus,
    Folder,
    Loader2,
    AlertCircle,
    FileIcon,
    X,
    Search,
} from "lucide-react";
import toast from "react-hot-toast";
import {
    DndContext,
    DragOverlay,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    type DragStartEvent,
    type DragEndEvent,
} from "@dnd-kit/core";

import { collectionsApi } from "@/lib/api/endpoints/collections";
import { itemsApi } from "@/lib/api/endpoints/items";
import type { Collection, BreadcrumbItem } from "@/types/collection.types";
import type { Item } from "@/types/item.types";
import {
    CollectionCard,
    CollectionBreadcrumb,
    CreateCollectionModal,
    MoveCollectionModal,
    SelectItemsModal,
} from "@/components/collections";
import ItemCard from "@/components/library/ItemCard";
import ItemDetailPanel from "@/components/library/ItemDetailPanel";
import CreateItemModal from "@/components/library/CreateItemModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DeleteOptionModal from "@/components/library/DeleteOptionModal";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils/cn";

export default function CollectionsPage() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    // Current folder ID (null = root)
    const currentFolderId = searchParams.get("folder") || null;

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editCollection, setEditCollection] = useState<Collection | null>(
        null
    );
    const [moveCollection, setMoveCollection] = useState<Collection | null>(
        null
    );
    const [showSelectItems, setShowSelectItems] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [editItem, setEditItem] = useState<Item | null>(null);
    const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
    const [deleteConfirmCollection, setDeleteConfirmCollection] =
        useState<Collection | null>(null);
    const [deleteConfirmItem, setDeleteConfirmItem] = useState<string | null>(
        null
    );

    // Search and Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<
        "all" | "collections" | "items"
    >("all");

    // Breadcrumb state
    const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);

    // Drag state
    const [draggedItem, setDraggedItem] = useState<{
        type: "collection" | "item";
        data: any;
    } | null>(null);

    // Sensors for drag
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    // Fetch collections
    const {
        data: collectionsData,
        isLoading: isLoadingCollections,
        error: collectionsError,
    } = useQuery({
        queryKey: ["collections", currentFolderId],
        queryFn: () =>
            collectionsApi.getAll({
                parentId: currentFolderId || "root",
                sortBy: "name",
                sortOrder: "asc",
            }),
    });

    // Fetch items in current collection
    const { data: itemsData, isLoading: isLoadingItems } = useQuery({
        queryKey: ["collections", currentFolderId, "items"],
        queryFn: () => collectionsApi.getItems(currentFolderId!, 1, 100),
        enabled: !!currentFolderId,
    });

    // Fetch breadcrumb when in subfolder
    useEffect(() => {
        if (currentFolderId) {
            collectionsApi
                .getBreadcrumb(currentFolderId)
                .then((response: any) => {
                    // Handle both array and wrapped response formats
                    const data = Array.isArray(response)
                        ? response
                        : response?.data || [];
                    setBreadcrumb(data);
                })
                .catch(() => setBreadcrumb([]));
        } else {
            setBreadcrumb([]);
        }
    }, [currentFolderId]);

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => collectionsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            toast.success("Collection deleted!");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to delete collection"
            );
        },
    });

    // Move collection mutation (for drag-drop)
    const moveCollectionMutation = useMutation({
        mutationFn: ({
            id,
            parentId,
        }: {
            id: string;
            parentId: string | null;
        }) => collectionsApi.move(id, { parentId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            toast.success("Collection moved!");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to move collection"
            );
        },
    });

    // Add item to collection mutation (for drag-drop)
    const addItemMutation = useMutation({
        mutationFn: ({
            collectionId,
            itemId,
        }: {
            collectionId: string;
            itemId: string;
        }) => collectionsApi.addItems(collectionId, { itemIds: [itemId] }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            toast.success("Item added to collection!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add item");
        },
    });

    // Remove item from collection mutation
    const removeItemMutation = useMutation({
        mutationFn: (itemId: string) =>
            collectionsApi.removeItems(currentFolderId!, { itemIds: [itemId] }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["collections", currentFolderId, "items"],
            });
            toast.success("Item removed from collection!");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to remove item"
            );
        },
    });

    // Pin/unpin item mutation
    const pinItemMutation = useMutation({
        mutationFn: (id: string) => itemsApi.togglePin(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["collections", currentFolderId, "items"],
            });
            queryClient.invalidateQueries({ queryKey: ["items"] });
            toast.success("Item updated!");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to update item"
            );
        },
    });

    // Move to Trash mutation
    const trashItemMutation = useMutation({
        mutationFn: (itemId: string) => itemsApi.moveToTrash(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["collections", currentFolderId, "items"],
            });
            queryClient.invalidateQueries({ queryKey: ["items"] });
            setSelectedItem(null);
            setDeleteConfirmItem(null);
            toast.success("Item moved to trash!");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to move item to trash"
            );
        },
    });

    // Delete item mutation
    const deleteItemMutation = useMutation({
        mutationFn: (id: string) => itemsApi.deleteItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["collections", currentFolderId, "items"],
            });
            queryClient.invalidateQueries({ queryKey: ["items"] });
            setSelectedItem(null);
            setDeleteConfirmItem(null);
            toast.success("Item deleted!");
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to delete item"
            );
        },
    });

    // Item handlers
    const handleEditItem = (item: Item) => {
        setEditItem(item);
        setIsEditItemModalOpen(true);
        setSelectedItem(null);
    };

    const handlePinItem = async (id: string) => {
        pinItemMutation.mutate(id);
    };

    const handleDeleteItem = async (id: string) => {
        setDeleteConfirmItem(id);
    };

    const handleConfirmTrashItem = async () => {
        if (deleteConfirmItem) {
            await trashItemMutation.mutateAsync(deleteConfirmItem);
        }
    };

    const handleConfirmDeleteItem = async () => {
        if (deleteConfirmItem) {
            await deleteItemMutation.mutateAsync(deleteConfirmItem);
        }
    };

    // Handlers
    const handleNavigateToFolder = (collection: Collection) => {
        setSearchParams({ folder: collection.id });
    };

    const handleBreadcrumbNavigate = (item: BreadcrumbItem | null) => {
        if (item) {
            setSearchParams({ folder: item.id });
        } else {
            setSearchParams({});
        }
    };

    const handleEdit = (collection: Collection) => {
        setEditCollection(collection);
        setShowCreateModal(true);
    };

    const handleMove = (collection: Collection) => {
        setMoveCollection(collection);
    };

    const handleDelete = (collection: Collection) => {
        setDeleteConfirmCollection(collection);
    };

    const confirmDeleteCollection = () => {
        if (deleteConfirmCollection) {
            deleteMutation.mutate(deleteConfirmCollection.id);
            setDeleteConfirmCollection(null);
        }
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setEditCollection(null);
    };

    // Drag handlers
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const [type, id] = (active.id as string).split(":");

        if (type === "collection") {
            const col = collections.find((c) => c.id === id);
            if (col) setDraggedItem({ type: "collection", data: col });
        } else if (type === "item") {
            const item = items.find((i) => i.id === id);
            if (item) setDraggedItem({ type: "item", data: item });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setDraggedItem(null);

        if (!over) return;

        const [activeType, activeId] = (active.id as string).split(":");
        const [overType, overId] = (over.id as string).split(":");

        // Drop collection onto another collection = move
        if (
            activeType === "collection" &&
            overType === "collection" &&
            activeId !== overId
        ) {
            moveCollectionMutation.mutate({ id: activeId, parentId: overId });
        }

        // Drop item onto collection = add item
        if (activeType === "item" && overType === "collection") {
            addItemMutation.mutate({ collectionId: overId, itemId: activeId });
        }
    };

    const collectionsRaw = collectionsData?.data?.data || [];
    const itemsRaw = itemsData?.data?.data || [];
    const isLoading =
        isLoadingCollections || (currentFolderId && isLoadingItems);

    // Filtered data based on search and type filter
    const { collections, items } = useMemo(() => {
        const searchLower = searchQuery.toLowerCase().trim();

        let filteredCollections = collectionsRaw;
        let filteredItems = itemsRaw;

        // Apply search filter
        if (searchLower) {
            filteredCollections = collectionsRaw.filter(
                (c) =>
                    c.name.toLowerCase().includes(searchLower) ||
                    c.description?.toLowerCase().includes(searchLower)
            );
            filteredItems = itemsRaw.filter(
                (i) =>
                    i.title.toLowerCase().includes(searchLower) ||
                    i.description?.toLowerCase().includes(searchLower)
            );
        }

        // Apply type filter
        if (typeFilter === "collections") {
            filteredItems = [];
        } else if (typeFilter === "items") {
            filteredCollections = [];
        }

        return { collections: filteredCollections, items: filteredItems };
    }, [collectionsRaw, itemsRaw, searchQuery, typeFilter]);

    return (
        <AppLayout>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="p-4 lg:p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-neutral-900">
                                Collections
                            </h1>
                            <p className="text-xs text-neutral-500 mt-0.5 hidden sm:block">
                                Organize items into folders
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            {currentFolderId && (
                                <button
                                    onClick={() => setShowSelectItems(true)}
                                    title="Add items to collection"
                                    className="px-2.5 py-1.5 text-xs font-medium border border-sky-300 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span className="sm:hidden">Items</span>
                                    <span className="hidden sm:inline">
                                        Add Items
                                    </span>
                                </button>
                            )}
                            <button
                                onClick={() => setShowCreateModal(true)}
                                title="Create new collection"
                                className="px-2.5 py-1.5 text-xs font-medium bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg transition-colors flex items-center gap-1 hover:opacity-90"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="sm:hidden">Folder</span>
                                <span className="hidden sm:inline">
                                    New Collection
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Breadcrumb */}
                    <CollectionBreadcrumb
                        items={breadcrumb}
                        onNavigate={handleBreadcrumbNavigate}
                    />

                    {/* Search and Filter Toolbar */}
                    <div className="flex gap-2 items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                            />
                        </div>

                        {/* Type Filter */}
                        <div className="flex bg-neutral-100 p-0.5 rounded-lg">
                            {[
                                { value: "all", label: "All" },
                                { value: "collections", label: "📁" },
                                { value: "items", label: "📄" },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() =>
                                        setTypeFilter(option.value as any)
                                    }
                                    title={
                                        option.value === "collections"
                                            ? "Collections"
                                            : option.value === "items"
                                            ? "Items"
                                            : "All"
                                    }
                                    className={cn(
                                        "px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                                        typeFilter === option.value
                                            ? "bg-white text-sky-600 shadow-sm"
                                            : "text-neutral-600 hover:text-neutral-900"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                        </div>
                    ) : collectionsError ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                            <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
                            <p>Failed to load collections</p>
                            <button
                                onClick={() =>
                                    queryClient.invalidateQueries({
                                        queryKey: ["collections"],
                                    })
                                }
                                className="mt-2 text-sm text-sky-600 hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Collections grid */}
                            {collections.length > 0 && (
                                <div>
                                    <h2 className="text-sm font-medium text-neutral-500 mb-3 flex items-center gap-2">
                                        <Folder className="w-4 h-4" />
                                        Folders ({collections.length})
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {collections.map((collection) => (
                                            <CollectionCard
                                                key={collection.id}
                                                collection={collection}
                                                onClick={() =>
                                                    handleNavigateToFolder(
                                                        collection
                                                    )
                                                }
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onMove={handleMove}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Items grid (only when inside a collection) */}
                            {currentFolderId && items.length > 0 && (
                                <div>
                                    <h2 className="text-sm font-medium text-neutral-500 mb-3 flex items-center gap-2">
                                        <FileIcon className="w-4 h-4" />
                                        Items ({items.length})
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="relative group/item"
                                            >
                                                <ItemCard
                                                    item={item}
                                                    onClick={() =>
                                                        setSelectedItem(item)
                                                    }
                                                />
                                                {/* Remove from collection button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeItemMutation.mutate(
                                                            item.id
                                                        );
                                                    }}
                                                    className="absolute top-12 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity z-10 shadow-lg"
                                                    title="Remove from collection"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty state */}
                            {collections.length === 0 && items.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                                    <Folder className="w-16 h-16 mb-4 text-neutral-300" />
                                    <p className="text-lg font-medium text-neutral-600">
                                        {currentFolderId
                                            ? "This folder is empty"
                                            : "No collections yet"}
                                    </p>
                                    <p className="text-sm mt-1">
                                        Click "New Collection" to create one
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Drag overlay */}
                <DragOverlay>
                    {draggedItem && (
                        <div className="bg-white rounded-xl shadow-2xl border-2 border-sky-400 p-3 opacity-90">
                            {draggedItem.type === "collection" ? (
                                <div className="flex items-center gap-2">
                                    <Folder className="w-5 h-5 text-sky-500" />
                                    <span className="font-medium">
                                        {draggedItem.data.name}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <FileIcon className="w-5 h-5 text-neutral-400" />
                                    <span className="font-medium">
                                        {draggedItem.data.title}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            {/* Create/Edit Modal */}
            <CreateCollectionModal
                isOpen={showCreateModal}
                onClose={handleCloseCreateModal}
                parentId={currentFolderId}
                editCollection={editCollection}
            />

            {/* Move Modal */}
            {moveCollection && (
                <MoveCollectionModal
                    isOpen={!!moveCollection}
                    onClose={() => setMoveCollection(null)}
                    collection={moveCollection}
                />
            )}

            {/* Select Items Modal */}
            {currentFolderId && (
                <SelectItemsModal
                    isOpen={showSelectItems}
                    onClose={() => setShowSelectItems(false)}
                    collectionId={currentFolderId}
                    existingItemIds={items.map((item) => item.id)}
                />
            )}

            {/* Item Detail Panel */}
            <ItemDetailPanel
                item={selectedItem}
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                onEdit={handleEditItem}
                onPin={handlePinItem}
                onDelete={handleDeleteItem}
            />

            {/* Edit Item Modal */}
            <CreateItemModal
                isOpen={isEditItemModalOpen}
                onClose={() => {
                    setIsEditItemModalOpen(false);
                    setEditItem(null);
                }}
                editItem={editItem}
            />

            {/* Delete Collection Confirmation */}
            <ConfirmModal
                isOpen={!!deleteConfirmCollection}
                title="Delete Collection"
                message={`Delete "${deleteConfirmCollection?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                onConfirm={confirmDeleteCollection}
                onCancel={() => setDeleteConfirmCollection(null)}
                isLoading={deleteMutation.isPending}
            />

            {/* Delete Item Options Modal */}
            <DeleteOptionModal
                isOpen={!!deleteConfirmItem}
                onClose={() => setDeleteConfirmItem(null)}
                onMoveToTrash={handleConfirmTrashItem}
                onDeletePermanently={handleConfirmDeleteItem}
                isTrashing={trashItemMutation.isPending}
                isDeleting={deleteItemMutation.isPending}
            />
        </AppLayout>
    );
}
