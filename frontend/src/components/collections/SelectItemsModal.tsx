import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Search,
    Loader2,
    Check,
    File,
    Link as LinkIcon,
    FileText,
    Filter,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { itemsApi } from "@/lib/api/endpoints/items";
import { collectionsApi } from "@/lib/api/endpoints/collections";
import type { ItemType } from "@/types/item.types";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface SelectItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
    existingItemIds?: string[]; // Items already in collection
}

const typeFilters: { value: ItemType | "ALL"; label: string; icon: any }[] = [
    { value: "ALL", label: "All", icon: null },
    { value: "FILE", label: "Files", icon: File },
    { value: "LINK", label: "Links", icon: LinkIcon },
    { value: "NOTE", label: "Notes", icon: FileText },
];

export default function SelectItemsModal({
    isOpen,
    onClose,
    collectionId,
    existingItemIds = [],
}: SelectItemsModalProps) {
    const queryClient = useQueryClient();

    // State
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<ItemType | "ALL">("ALL");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearch("");
            setTypeFilter("ALL");
            setSelectedIds(new Set());
        }
    }, [isOpen]);

    // Fetch items
    const { data: itemsData, isLoading } = useQuery({
        queryKey: ["items", "all"],
        queryFn: () => itemsApi.getItems({ limit: 200 }),
        enabled: isOpen,
    });

    // Filter items
    const filteredItems = useMemo(() => {
        let items = itemsData?.data?.data || [];

        // Exclude already added items
        items = items.filter((item) => !existingItemIds.includes(item.id));

        // Type filter
        if (typeFilter !== "ALL") {
            items = items.filter((item) => item.type === typeFilter);
        }

        // Search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            items = items.filter(
                (item) =>
                    item.title.toLowerCase().includes(searchLower) ||
                    item.description?.toLowerCase().includes(searchLower)
            );
        }

        return items;
    }, [itemsData, existingItemIds, typeFilter, search]);

    // Add items mutation
    const addMutation = useMutation({
        mutationFn: () =>
            collectionsApi.addItems(collectionId, {
                itemIds: Array.from(selectedIds),
            }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            toast.success(
                data.data.message || `Added ${selectedIds.size} item(s)!`
            );
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add items");
        },
    });

    // Handlers
    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const selectAll = () => {
        setSelectedIds(new Set(filteredItems.map((item) => item.id)));
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    const handleAdd = () => {
        if (selectedIds.size === 0) {
            toast.error("Please select at least one item");
            return;
        }
        addMutation.mutate();
    };

    const getTypeIcon = (type: ItemType) => {
        switch (type) {
            case "FILE":
                return File;
            case "LINK":
                return LinkIcon;
            case "NOTE":
                return FileText;
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-neutral-200">
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900">
                            Add Items to Collection
                        </h2>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            {selectedIds.size} selected
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="p-4 border-b border-neutral-200 space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search items..."
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                        />
                    </div>

                    {/* Type filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-neutral-400" />
                        <div className="flex gap-1">
                            {typeFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setTypeFilter(filter.value)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5",
                                        typeFilter === filter.value
                                            ? "bg-sky-100 text-sky-700"
                                            : "text-neutral-600 hover:bg-neutral-100"
                                    )}
                                >
                                    {filter.icon && (
                                        <filter.icon className="w-3.5 h-3.5" />
                                    )}
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selection controls */}
                    <div className="flex gap-2 text-xs">
                        <button
                            onClick={selectAll}
                            className="text-sky-600 hover:underline"
                        >
                            Select All ({filteredItems.length})
                        </button>
                        <span className="text-neutral-300">|</span>
                        <button
                            onClick={clearSelection}
                            className="text-neutral-500 hover:underline"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
                            <p className="text-sm">No items found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {filteredItems.map((item) => {
                                const isSelected = selectedIds.has(item.id);
                                const TypeIcon = getTypeIcon(item.type);
                                const thumbnail =
                                    item.files?.[0]?.file?.url ||
                                    item.files?.[0]?.url;

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleSelect(item.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                                            isSelected
                                                ? "bg-sky-50"
                                                : "hover:bg-neutral-50"
                                        )}
                                    >
                                        {/* Checkbox */}
                                        <div
                                            className={cn(
                                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                                                isSelected
                                                    ? "bg-sky-500 border-sky-500"
                                                    : "border-neutral-300"
                                            )}
                                        >
                                            {isSelected && (
                                                <Check className="w-3 h-3 text-white" />
                                            )}
                                        </div>

                                        {/* Thumbnail or icon */}
                                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {thumbnail ? (
                                                <img
                                                    src={thumbnail}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <TypeIcon className="w-5 h-5 text-neutral-400" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-900 truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-neutral-500 flex items-center gap-1">
                                                <TypeIcon className="w-3 h-3" />
                                                {item.type}
                                                {item.category &&
                                                    ` • ${item.category}`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-5 border-t border-neutral-200 bg-neutral-50">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={addMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleAdd}
                        className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600"
                        disabled={
                            addMutation.isPending || selectedIds.size === 0
                        }
                    >
                        {addMutation.isPending
                            ? "Adding..."
                            : `Add ${selectedIds.size} Item${
                                  selectedIds.size !== 1 ? "s" : ""
                              }`}
                    </Button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
