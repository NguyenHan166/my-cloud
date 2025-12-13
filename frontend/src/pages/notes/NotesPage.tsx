import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    StickyNote,
    Plus,
    Search,
    Grid,
    List,
    Pin,
    Trash2,
    Edit3,
    Copy,
    Eye,
    Calendar,
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

export default function NotesPage() {
    const queryClient = useQueryClient();

    // State
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [importance, setImportance] = useState<Importance | undefined>();
    const [isPinnedOnly, setIsPinnedOnly] = useState(false);
    const [sortBy, setSortBy] = useState<QueryItemsDto["sortBy"]>("createdAt");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Item | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [previewNote, setPreviewNote] = useState<Item | null>(null);

    // Fetch notes only
    const filters: QueryItemsDto = {
        type: "NOTE",
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
            toast.success("Note updated");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => itemsApi.deleteItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            toast.success("Note deleted");
        },
        onError: () => toast.error("Failed to delete note"),
    });

    const notes = data?.data?.data || [];

    const copyContent = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success("Content copied!");
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await deleteMutation.mutateAsync(deleteConfirmId);
        } finally {
            setDeleteConfirmId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "short",
            });
        } catch {
            return "";
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
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
                    title="Failed to load notes"
                    message="There was an error loading your notes."
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
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <StickyNote className="w-6 h-6 text-amber-500" />
                        Notes
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                        {notes.length} not es
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditItem(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="h-9 px-4 flex items-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Note
                </button>
            </div>

            {/* Search, View toggle & Filter */}
            <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 text-sm border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                </div>
                <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 rounded-md ${
                            viewMode === "grid"
                                ? "bg-white dark:bg-neutral-700 text-amber-600 shadow-sm"
                                : "text-neutral-400 dark:text-neutral-500"
                        }`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 rounded-md ${
                            viewMode === "list"
                                ? "bg-white dark:bg-neutral-700 text-amber-600 shadow-sm"
                                : "text-neutral-400 dark:text-neutral-500"
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`relative h-9 w-9 flex items-center justify-center rounded-lg border transition-all ${
                        showFilters
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-white border-neutral-200 text-neutral-600"
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div className="bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 rounded-xl p-3 mb-4 space-y-3">
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

            {/* Notes */}
            {notes.length === 0 ? (
                <EmptyState
                    icon={<StickyNote className="w-12 h-12" />}
                    title="No notes yet"
                    description="Create your first note to get started"
                    action={{
                        label: "New Note",
                        onClick: () => setIsCreateModalOpen(true),
                    }}
                />
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className={`group bg-white dark:bg-neutral-850 border rounded-xl hover:shadow-lg transition-all cursor-pointer ${
                                note.isPinned
                                    ? "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 ring-1 ring-amber-200 dark:ring-amber-800"
                                    : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                            }`}
                            onClick={() => setPreviewNote(note)}
                        >
                            <div className="p-4 pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 flex-1">
                                        {note.title}
                                    </h3>
                                    {note.isPinned && (
                                        <Pin className="w-4 h-4 text-amber-500 fill-current flex-shrink-0" />
                                    )}
                                </div>
                            </div>
                            <div className="px-4 pb-3">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-4 whitespace-pre-wrap">
                                    {note.content}
                                </p>
                            </div>
                            {note.itemTags?.length > 0 && (
                                <div className="px-4 pb-3 flex flex-wrap gap-1">
                                    {note.itemTags.slice(0, 2).map((it) => (
                                        <Badge
                                            key={it.tag.id}
                                            variant="default"
                                            size="sm"
                                            style={{
                                                backgroundColor:
                                                    it.tag.color + "20",
                                                color: it.tag.color,
                                            }}
                                        >
                                            {it.tag.name}
                                        </Badge>
                                    ))}
                                    {note.itemTags.length > 2 && (
                                        <Badge variant="default" size="sm">
                                            +{note.itemTags.length - 2}
                                        </Badge>
                                    )}
                                </div>
                            )}
                            <div className="px-4 py-2.5 border-t border-neutral-100 flex items-center justify-between">
                                <span className="text-xs text-neutral-400 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />{" "}
                                    {formatDate(note.createdAt)}
                                </span>
                                <div
                                    className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() =>
                                            pinMutation.mutate(note.id)
                                        }
                                        className="p-1.5 hover:bg-neutral-100 rounded"
                                    >
                                        <Pin
                                            className={`w-3.5 h-3.5 ${
                                                note.isPinned
                                                    ? "text-amber-500 fill-current"
                                                    : "text-neutral-400"
                                            }`}
                                        />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditItem(note);
                                            setIsCreateModalOpen(true);
                                        }}
                                        className="p-1.5 hover:bg-neutral-100 rounded"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setDeleteConfirmId(note.id)
                                        }
                                        className="p-1.5 hover:bg-red-100 rounded"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            className={`group bg-white dark:bg-neutral-850 border rounded-xl p-4 hover:shadow-md transition-all ${
                                note.isPinned
                                    ? "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/30"
                                    : "border-neutral-200 dark:border-neutral-700"
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <StickyNote className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                            {note.title}
                                        </h3>
                                        {note.isPinned && (
                                            <Pin className="w-3.5 h-3.5 text-amber-500 fill-current flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2 whitespace-pre-wrap">
                                        {note.content}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
                                        <Calendar className="w-3 h-3" />{" "}
                                        {formatDate(note.createdAt)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setPreviewNote(note)}
                                        className="p-2 hover:bg-neutral-100 rounded-lg"
                                        title="Preview"
                                    >
                                        <Eye className="w-4 h-4 text-neutral-500" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            copyContent(note.content || "")
                                        }
                                        className="p-2 hover:bg-neutral-100 rounded-lg"
                                        title="Copy"
                                    >
                                        <Copy className="w-4 h-4 text-neutral-500" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            pinMutation.mutate(note.id)
                                        }
                                        className={`p-2 rounded-lg ${
                                            note.isPinned
                                                ? "bg-amber-100 text-amber-600"
                                                : "hover:bg-neutral-100 text-neutral-500"
                                        }`}
                                    >
                                        <Pin
                                            className={`w-4 h-4 ${
                                                note.isPinned
                                                    ? "fill-current"
                                                    : ""
                                            }`}
                                        />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditItem(note);
                                            setIsCreateModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-neutral-100 rounded-lg"
                                    >
                                        <Edit3 className="w-4 h-4 text-neutral-500" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setDeleteConfirmId(note.id)
                                        }
                                        className="p-2 hover:bg-red-100 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Note Preview Modal */}
            {previewNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setPreviewNote(null)}
                    />
                    <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                {previewNote.title}
                            </h2>
                            <p className="text-sm text-neutral-500 mt-1">
                                {formatDate(previewNote.createdAt)}
                            </p>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed">
                                {previewNote.content}
                            </p>
                        </div>
                        <div className="p-4 border-t border-neutral-200 flex justify-end gap-2">
                            <button
                                onClick={() =>
                                    copyContent(previewNote.content || "")
                                }
                                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg"
                            >
                                <Copy className="w-4 h-4 inline mr-2" /> Copy
                            </button>
                            <button
                                onClick={() => {
                                    setEditItem(previewNote);
                                    setIsCreateModalOpen(true);
                                    setPreviewNote(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg"
                            >
                                <Edit3 className="w-4 h-4 inline mr-2" /> Edit
                            </button>
                        </div>
                    </div>
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
                title="Delete Note"
                message="Are you sure you want to delete this note?"
                confirmText="Delete"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmId(null)}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
