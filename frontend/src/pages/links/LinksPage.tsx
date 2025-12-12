import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    Link as LinkIcon,
    ExternalLink,
    Plus,
    Search,
    Grid,
    List,
    Pin,
    Trash2,
    Edit3,
    Copy,
    Globe,
    SlidersHorizontal,
    ChevronDown,
    ArrowDownAZ,
    ArrowUpAZ,
    X,
} from "lucide-react";
import type { Item, QueryItemsDto, Importance } from "@/types/item.types";
import { itemsApi } from "@/lib/api/endpoints/items";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import CreateItemModal from "@/components/library/CreateItemModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Badge from "@/components/ui/Badge";

export default function LinksPage() {
    const queryClient = useQueryClient();

    // State
    const [viewMode, setViewMode] = useState<"grid" | "list">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [importance, setImportance] = useState<Importance | undefined>();
    const [isPinnedOnly, setIsPinnedOnly] = useState(false);
    const [sortBy, setSortBy] = useState<QueryItemsDto["sortBy"]>("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Item | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Fetch links only
    const filters: QueryItemsDto = {
        type: "LINK",
        search: searchTerm || undefined,
        importance,
        isPinned: isPinnedOnly || undefined,
        sortBy,
        sortOrder,
        page: 1,
        limit: 50,
    };

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["items", filters],
        queryFn: () => itemsApi.getItems(filters),
    });

    // Mutations
    const pinMutation = useMutation({
        mutationFn: (id: string) => itemsApi.togglePin(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            toast.success("Link updated");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => itemsApi.deleteItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            toast.success("Link deleted");
        },
        onError: () => toast.error("Failed to delete link"),
    });

    const links = data?.data?.data || [];

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("URL copied!");
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await deleteMutation.mutateAsync(deleteConfirmId);
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const activeFilterCount = [importance, isPinnedOnly].filter(Boolean).length;

    const clearFilters = () => {
        setImportance(undefined);
        setIsPinnedOnly(false);
        setSortBy("createdAt");
        setSortOrder("desc");
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="container mx-auto px-4 py-8">
                <ErrorState
                    title="Failed to load links"
                    message="There was an error loading your links."
                    onRetry={refetch}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <LinkIcon className="w-6 h-6 text-sky-500" />
                        Links
                    </h1>
                    <p className="text-neutral-500 text-sm mt-1">
                        {links.length} saved links
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditItem(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="h-9 px-4 flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg hover:from-sky-600 hover:to-blue-700 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Link
                </button>
            </div>

            {/* Search, View toggle & Filter */}
            <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search links..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                </div>
                <div className="flex bg-neutral-100 rounded-lg p-0.5">
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-md ${
                            viewMode === "list"
                                ? "bg-white text-sky-600 shadow-sm"
                                : "text-neutral-400"
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-md ${
                            viewMode === "grid"
                                ? "bg-white text-sky-600 shadow-sm"
                                : "text-neutral-400"
                        }`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`relative h-9 w-9 flex items-center justify-center rounded-lg border transition-all ${
                        showFilters
                            ? "bg-sky-50 border-sky-200 text-sky-700"
                            : "bg-white border-neutral-200 text-neutral-600"
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div className="bg-neutral-50/50 border border-neutral-200/80 rounded-xl p-3 mb-4 space-y-3">
                    {/* Priority filter */}
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                            Priority
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {[
                                {
                                    val: undefined as Importance | undefined,
                                    label: "All",
                                    cls: "bg-white border-neutral-200",
                                },
                                {
                                    val: "URGENT" as Importance,
                                    label: "🔴 Urgent",
                                    cls: "bg-red-500 text-white",
                                },
                                {
                                    val: "HIGH" as Importance,
                                    label: "🟠 High",
                                    cls: "bg-orange-500 text-white",
                                },
                                {
                                    val: "MEDIUM" as Importance,
                                    label: "🟡 Medium",
                                    cls: "bg-yellow-500 text-white",
                                },
                                {
                                    val: "LOW" as Importance,
                                    label: "🟢 Low",
                                    cls: "bg-green-500 text-white",
                                },
                            ].map(({ val, label, cls }) => (
                                <button
                                    key={label}
                                    onClick={() => setImportance(val)}
                                    className={`h-7 px-2.5 text-xs font-medium rounded-lg transition-all ${
                                        importance === val
                                            ? val === undefined
                                                ? "bg-neutral-600 text-white"
                                                : cls +
                                                  " ring-2 ring-offset-1 ring-neutral-400"
                                            : val === undefined
                                            ? "bg-white text-neutral-600 border border-neutral-200"
                                            : cls +
                                              " opacity-40 hover:opacity-70"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort & Options */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200/60">
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) =>
                                    setSortBy(
                                        e.target
                                            .value as QueryItemsDto["sortBy"]
                                    )
                                }
                                className="h-7 pl-2 pr-6 text-xs font-medium bg-white border border-neutral-200 rounded-lg appearance-none cursor-pointer focus:outline-none"
                            >
                                <option value="createdAt">Created</option>
                                <option value="updatedAt">Modified</option>
                                <option value="title">Title</option>
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                        </div>
                        <button
                            onClick={() =>
                                setSortOrder(
                                    sortOrder === "desc" ? "asc" : "desc"
                                )
                            }
                            className="h-7 px-2 flex items-center gap-1 text-xs font-medium bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50"
                        >
                            {sortOrder === "desc" ? (
                                <ArrowDownAZ className="w-3.5 h-3.5" />
                            ) : (
                                <ArrowUpAZ className="w-3.5 h-3.5" />
                            )}
                        </button>
                        <div className="w-px h-5 bg-neutral-200" />
                        <button
                            onClick={() => setIsPinnedOnly(!isPinnedOnly)}
                            className={`h-7 px-2.5 flex items-center gap-1 text-xs font-medium rounded-lg transition-all ${
                                isPinnedOnly
                                    ? "bg-amber-500 text-white"
                                    : "bg-white text-neutral-600 border border-neutral-200"
                            }`}
                        >
                            <Pin
                                className={`w-3 h-3 ${
                                    isPinnedOnly ? "fill-current" : ""
                                }`}
                            />
                            Pinned
                        </button>
                        {activeFilterCount > 0 && (
                            <>
                                <div className="flex-1" />
                                <button
                                    onClick={clearFilters}
                                    className="h-7 px-2 flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg"
                                >
                                    <X className="w-3 h-3" /> Clear
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Links list */}
            {links.length === 0 ? (
                <EmptyState
                    icon={<LinkIcon className="w-12 h-12" />}
                    title="No links yet"
                    description="Save your first link to get started"
                    action={{
                        label: "Add Link",
                        onClick: () => setIsCreateModalOpen(true),
                    }}
                />
            ) : viewMode === "list" ? (
                <div className="space-y-2">
                    {links.map((link) => (
                        <div
                            key={link.id}
                            className={`group bg-white border rounded-xl p-4 hover:shadow-md transition-all ${
                                link.isPinned
                                    ? "border-sky-200 bg-sky-50/30"
                                    : "border-neutral-200"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-neutral-900 truncate">
                                            {link.title}
                                        </h3>
                                        {link.isPinned && (
                                            <Pin className="w-3.5 h-3.5 text-sky-500 fill-current flex-shrink-0" />
                                        )}
                                    </div>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-sky-600 hover:underline truncate block"
                                    >
                                        {link.url}
                                    </a>
                                    {link.description && (
                                        <p className="text-sm text-neutral-500 mt-1 line-clamp-1">
                                            {link.description}
                                        </p>
                                    )}
                                    {link.itemTags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {link.itemTags
                                                .slice(0, 3)
                                                .map((it) => (
                                                    <Badge
                                                        key={it.tag.id}
                                                        variant="default"
                                                        size="sm"
                                                        style={{
                                                            backgroundColor:
                                                                it.tag.color +
                                                                "20",
                                                            color: it.tag.color,
                                                        }}
                                                    >
                                                        {it.tag.name}
                                                    </Badge>
                                                ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() =>
                                            copyToClipboard(link.url || "")
                                        }
                                        className="p-2 hover:bg-neutral-100 rounded-lg"
                                        title="Copy URL"
                                    >
                                        <Copy className="w-4 h-4 text-neutral-500" />
                                    </button>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-neutral-100 rounded-lg"
                                        title="Open link"
                                    >
                                        <ExternalLink className="w-4 h-4 text-neutral-500" />
                                    </a>
                                    <button
                                        onClick={() =>
                                            pinMutation.mutate(link.id)
                                        }
                                        className={`p-2 rounded-lg ${
                                            link.isPinned
                                                ? "bg-sky-100 text-sky-600"
                                                : "hover:bg-neutral-100 text-neutral-500"
                                        }`}
                                        title={link.isPinned ? "Unpin" : "Pin"}
                                    >
                                        <Pin
                                            className={`w-4 h-4 ${
                                                link.isPinned
                                                    ? "fill-current"
                                                    : ""
                                            }`}
                                        />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditItem(link);
                                            setIsCreateModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-neutral-100 rounded-lg"
                                        title="Edit"
                                    >
                                        <Edit3 className="w-4 h-4 text-neutral-500" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setDeleteConfirmId(link.id)
                                        }
                                        className="p-2 hover:bg-red-100 rounded-lg"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {links.map((link) => (
                        <div
                            key={link.id}
                            className={`group bg-white border rounded-xl p-4 hover:shadow-md transition-all ${
                                link.isPinned
                                    ? "border-sky-200 bg-sky-50/30"
                                    : "border-neutral-200"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-5 h-5 text-neutral-400" />
                                <span className="text-xs text-neutral-400">
                                    {link.domain}
                                </span>
                                {link.isPinned && (
                                    <Pin className="w-3 h-3 text-sky-500 fill-current ml-auto" />
                                )}
                            </div>
                            <h3 className="font-medium text-neutral-900 line-clamp-2 mb-1">
                                {link.title}
                            </h3>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-sky-600 hover:underline line-clamp-1"
                            >
                                {link.url}
                            </a>
                            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-neutral-100">
                                <button
                                    onClick={() =>
                                        copyToClipboard(link.url || "")
                                    }
                                    className="p-1.5 hover:bg-neutral-100 rounded"
                                >
                                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                                </button>
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 hover:bg-neutral-100 rounded"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                                </a>
                                <button
                                    onClick={() => pinMutation.mutate(link.id)}
                                    className="p-1.5 hover:bg-neutral-100 rounded"
                                >
                                    <Pin
                                        className={`w-3.5 h-3.5 ${
                                            link.isPinned
                                                ? "text-sky-500 fill-current"
                                                : "text-neutral-400"
                                        }`}
                                    />
                                </button>
                                <div className="flex-1" />
                                <button
                                    onClick={() => {
                                        setEditItem(link);
                                        setIsCreateModalOpen(true);
                                    }}
                                    className="p-1.5 hover:bg-neutral-100 rounded"
                                >
                                    <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirmId(link.id)}
                                    className="p-1.5 hover:bg-red-100 rounded"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateItemModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditItem(null);
                }}
                editItem={editItem}
            />
            <ConfirmModal
                isOpen={!!deleteConfirmId}
                title="Delete Link"
                message="Are you sure you want to delete this link?"
                confirmText="Delete"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmId(null)}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
