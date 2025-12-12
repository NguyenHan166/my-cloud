import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Folder, ChevronRight, Loader2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { collectionsApi } from "@/lib/api/endpoints/collections";
import type { Collection } from "@/types/collection.types";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface AddToCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemIds: string[]; // Items to add
    itemTitle?: string; // For display
}

interface CollectionTreeItemProps {
    collection: Collection;
    itemIds: string[];
    onAdd: (collectionId: string) => void;
    isPending: boolean;
    level: number;
}

function CollectionTreeItem({
    collection,
    itemIds,
    onAdd,
    isPending,
    level,
}: CollectionTreeItemProps) {
    const [expanded, setExpanded] = useState(false);
    const hasChildren = (collection._count?.children || 0) > 0;

    // Fetch children when expanded
    const { data: childrenData, isLoading } = useQuery({
        queryKey: ["collections", collection.id, "children"],
        queryFn: () => collectionsApi.getChildren(collection.id),
        enabled: expanded && hasChildren,
    });

    const children = childrenData?.data?.data || [];

    return (
        <div>
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
                style={{ paddingLeft: `${12 + level * 20}px` }}
            >
                {hasChildren ? (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-0.5 hover:bg-neutral-200 rounded"
                    >
                        <ChevronRight
                            className={cn(
                                "w-4 h-4 text-neutral-400 transition-transform",
                                expanded && "rotate-90"
                            )}
                        />
                    </button>
                ) : (
                    <span className="w-5" />
                )}
                <Folder className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-700 truncate flex-1">
                    {collection.name}
                </span>
                <button
                    onClick={() => onAdd(collection.id)}
                    disabled={isPending}
                    className="p-1 text-sky-600 hover:bg-sky-100 rounded transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {expanded && (
                <div>
                    {isLoading ? (
                        <div
                            className="flex items-center gap-2 px-3 py-2"
                            style={{ paddingLeft: `${32 + level * 20}px` }}
                        >
                            <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                            <span className="text-xs text-neutral-400">
                                Loading...
                            </span>
                        </div>
                    ) : (
                        children.map((child) => (
                            <CollectionTreeItem
                                key={child.id}
                                collection={child}
                                itemIds={itemIds}
                                onAdd={onAdd}
                                isPending={isPending}
                                level={level + 1}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default function AddToCollectionModal({
    isOpen,
    onClose,
    itemIds,
    itemTitle,
}: AddToCollectionModalProps) {
    const queryClient = useQueryClient();

    // Fetch root collections
    const { data: rootData, isLoading } = useQuery({
        queryKey: ["collections", "root"],
        queryFn: () => collectionsApi.getAll({ parentId: "root" }),
        enabled: isOpen,
    });

    // Add items mutation
    const addMutation = useMutation({
        mutationFn: (collectionId: string) =>
            collectionsApi.addItems(collectionId, { itemIds }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            toast.success(data.data.message || "Items added to collection!");
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add items");
        },
    });

    const handleAdd = (collectionId: string) => {
        addMutation.mutate(collectionId);
    };

    const rootCollections = rootData?.data?.data || [];

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 rounded-xl">
                            <Plus className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900">
                                Add to Collection
                            </h2>
                            {itemTitle && (
                                <p className="text-xs text-neutral-500 truncate max-w-[200px]">
                                    {itemIds.length > 1
                                        ? `${itemIds.length} items`
                                        : itemTitle}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                {/* Tree */}
                <div className="p-4 max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                        </div>
                    ) : rootCollections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
                            <Folder className="w-12 h-12 mb-2 text-neutral-300" />
                            <p className="text-sm">No collections yet</p>
                            <p className="text-xs mt-1">
                                Create a collection first
                            </p>
                        </div>
                    ) : (
                        <div>
                            {rootCollections.map((c) => (
                                <CollectionTreeItem
                                    key={c.id}
                                    collection={c}
                                    itemIds={itemIds}
                                    onAdd={handleAdd}
                                    isPending={addMutation.isPending}
                                    level={0}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-5 border-t border-neutral-200">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
