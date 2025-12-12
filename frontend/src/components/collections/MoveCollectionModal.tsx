import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Folder, ChevronRight, Home, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { collectionsApi } from "@/lib/api/endpoints/collections";
import type { Collection } from "@/types/collection.types";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface MoveCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    collection: Collection;
}

interface CollectionTreeItemProps {
    collection: Collection;
    selectedId: string | null;
    disabledId: string; // Can't move into itself or descendants
    onSelect: (id: string | null) => void;
    level: number;
}

function CollectionTreeItem({
    collection,
    selectedId,
    disabledId,
    onSelect,
    level,
}: CollectionTreeItemProps) {
    const [expanded, setExpanded] = useState(false);
    const isDisabled = collection.id === disabledId;
    const isSelected = selectedId === collection.id;
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
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    isSelected && !isDisabled
                        ? "bg-sky-100 border border-sky-300"
                        : "hover:bg-neutral-100",
                    isDisabled && "opacity-40 cursor-not-allowed"
                )}
                style={{ paddingLeft: `${12 + level * 20}px` }}
                onClick={() => {
                    if (!isDisabled) onSelect(collection.id);
                }}
            >
                {hasChildren ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
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
                <Folder
                    className={cn(
                        "w-4 h-4",
                        isSelected ? "text-sky-600" : "text-neutral-400"
                    )}
                />
                <span
                    className={cn(
                        "text-sm truncate",
                        isSelected
                            ? "font-medium text-sky-700"
                            : "text-neutral-700"
                    )}
                >
                    {collection.name}
                </span>
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
                                selectedId={selectedId}
                                disabledId={disabledId}
                                onSelect={onSelect}
                                level={level + 1}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default function MoveCollectionModal({
    isOpen,
    onClose,
    collection,
}: MoveCollectionModalProps) {
    const queryClient = useQueryClient();
    const [selectedParentId, setSelectedParentId] = useState<string | null>(
        null
    );

    // Fetch root collections
    const { data: rootData, isLoading } = useQuery({
        queryKey: ["collections", "root"],
        queryFn: () => collectionsApi.getAll({ parentId: "root" }),
        enabled: isOpen,
    });

    // Reset selection when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedParentId(collection.parentId || null);
        }
    }, [isOpen, collection.parentId]);

    // Move mutation
    const moveMutation = useMutation({
        mutationFn: () =>
            collectionsApi.move(collection.id, { parentId: selectedParentId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            toast.success("Collection moved!");
            onClose();
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to move collection"
            );
        },
    });

    const handleMove = () => {
        if (selectedParentId === collection.parentId) {
            toast.error("Collection is already in this location");
            return;
        }
        moveMutation.mutate();
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
                            <Folder className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900">
                                Move Collection
                            </h2>
                            <p className="text-xs text-neutral-500">
                                Moving: {collection.name}
                            </p>
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
                    {/* Root option */}
                    <div
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                            selectedParentId === null
                                ? "bg-sky-100 border border-sky-300"
                                : "hover:bg-neutral-100"
                        )}
                        onClick={() => setSelectedParentId(null)}
                    >
                        <Home
                            className={cn(
                                "w-4 h-4",
                                selectedParentId === null
                                    ? "text-sky-600"
                                    : "text-neutral-400"
                            )}
                        />
                        <span
                            className={cn(
                                "text-sm",
                                selectedParentId === null
                                    ? "font-medium text-sky-700"
                                    : "text-neutral-700"
                            )}
                        >
                            Root (no parent)
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                        </div>
                    ) : (
                        <div className="mt-2">
                            {rootCollections
                                .filter((c) => c.id !== collection.id)
                                .map((c) => (
                                    <CollectionTreeItem
                                        key={c.id}
                                        collection={c}
                                        selectedId={selectedParentId}
                                        disabledId={collection.id}
                                        onSelect={setSelectedParentId}
                                        level={0}
                                    />
                                ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 border-t border-neutral-200">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={moveMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleMove}
                        className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600"
                        disabled={moveMutation.isPending}
                    >
                        {moveMutation.isPending ? "Moving..." : "Move Here"}
                    </Button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
