import { useState } from "react";
import type { ItemType, Importance, QueryItemsDto } from "@/types/item.types";
import {
    Search,
    Plus,
    Grid,
    List,
    SlidersHorizontal,
    X,
    FileText,
    Link as LinkIcon,
    StickyNote,
    Pin,
    ChevronDown,
    ArrowDownAZ,
    ArrowUpAZ,
} from "lucide-react";

interface LibraryToolbarProps {
    viewMode: "grid" | "list";
    onViewModeChange: (mode: "grid" | "list") => void;
    onSearchChange: (search: string) => void;
    onFilterChange: (filters: Partial<QueryItemsDto>) => void;
    onCreateClick: () => void;
    filters: QueryItemsDto;
}

export default function LibraryToolbar({
    viewMode,
    onViewModeChange,
    onSearchChange,
    onFilterChange,
    onCreateClick,
    filters,
}: LibraryToolbarProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        const timer = setTimeout(() => {
            onSearchChange(value);
        }, 500);
        return () => clearTimeout(timer);
    };

    const activeFilterCount = [
        filters.type,
        filters.importance,
        filters.isPinned,
    ].filter(Boolean).length;

    const clearAllFilters = () => {
        onFilterChange({
            type: undefined,
            importance: undefined,
            isPinned: undefined,
            sortBy: "createdAt",
            sortOrder: "desc",
        });
    };

    return (
        <div className="space-y-3">
            {/* Search + Actions row */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                </div>

                {/* View toggle */}
                <div className="flex-shrink-0 flex bg-neutral-100 rounded-lg p-0.5">
                    <button
                        onClick={() => onViewModeChange("grid")}
                        className={`p-1.5 rounded-md transition-all ${
                            viewMode === "grid"
                                ? "bg-white text-sky-600 shadow-sm"
                                : "text-neutral-400 hover:text-neutral-600"
                        }`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onViewModeChange("list")}
                        className={`p-1.5 rounded-md transition-all ${
                            viewMode === "list"
                                ? "bg-white text-sky-600 shadow-sm"
                                : "text-neutral-400 hover:text-neutral-600"
                        }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>

                {/* Filter button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex-shrink-0 relative h-9 w-9 flex items-center justify-center rounded-lg border transition-all ${
                        showFilters
                            ? "bg-sky-50 border-sky-200 text-sky-700"
                            : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Add button */}
                <button
                    onClick={onCreateClick}
                    className="flex-shrink-0 h-9 w-9 sm:w-auto sm:px-3 flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                </button>
            </div>

            {/* Filters panel - Mobile responsive */}
            {showFilters && (
                <div className="bg-neutral-50/50 border border-neutral-200/80 rounded-xl p-3 space-y-3 overflow-hidden">
                    {/* Type filter - horizontal scroll on mobile */}
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                            Type
                        </span>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                            {[
                                { val: "", label: "All", icon: null },
                                { val: "FILE", label: "Files", icon: FileText },
                                { val: "LINK", label: "Links", icon: LinkIcon },
                                {
                                    val: "NOTE",
                                    label: "Notes",
                                    icon: StickyNote,
                                },
                            ].map(({ val, label, icon: Icon }) => (
                                <button
                                    key={val}
                                    onClick={() =>
                                        onFilterChange({
                                            type:
                                                (val as ItemType) || undefined,
                                        })
                                    }
                                    className={`flex-shrink-0 h-8 px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg transition-all ${
                                        (filters.type || "") === val
                                            ? "bg-sky-500 text-white shadow-sm"
                                            : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                                    }`}
                                >
                                    {Icon && <Icon className="w-3.5 h-3.5" />}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Priority filter - horizontal scroll on mobile */}
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                            Priority
                        </span>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                            {[
                                {
                                    val: "",
                                    label: "All",
                                    bg: "bg-neutral-100",
                                    activeBg: "bg-neutral-600",
                                },
                                {
                                    val: "URGENT",
                                    label: "🔴",
                                    bg: "bg-red-100 text-red-700",
                                    activeBg: "bg-red-500",
                                },
                                {
                                    val: "HIGH",
                                    label: "🟠",
                                    bg: "bg-orange-100 text-orange-700",
                                    activeBg: "bg-orange-500",
                                },
                                {
                                    val: "MEDIUM",
                                    label: "🟡",
                                    bg: "bg-yellow-100 text-yellow-700",
                                    activeBg: "bg-yellow-500",
                                },
                                {
                                    val: "LOW",
                                    label: "🟢",
                                    bg: "bg-green-100 text-green-700",
                                    activeBg: "bg-green-500",
                                },
                            ].map(({ val, label, bg, activeBg }) => (
                                <button
                                    key={val}
                                    onClick={() =>
                                        onFilterChange({
                                            importance:
                                                (val as Importance) ||
                                                undefined,
                                        })
                                    }
                                    className={`flex-shrink-0 h-8 px-3 text-xs font-medium rounded-lg transition-all ${
                                        (filters.importance || "") === val
                                            ? `${activeBg} text-white shadow-sm`
                                            : `${bg} border border-neutral-200 hover:opacity-80`
                                    }`}
                                >
                                    {val === ""
                                        ? label
                                        : `${label} ${
                                              val.charAt(0) +
                                              val.slice(1).toLowerCase()
                                          }`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort row - wrap on mobile */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200/60">
                        {/* Sort dropdown */}
                        <div className="relative">
                            <select
                                value={filters.sortBy || "createdAt"}
                                onChange={(e) =>
                                    onFilterChange({
                                        sortBy: e.target
                                            .value as QueryItemsDto["sortBy"],
                                    })
                                }
                                className="h-8 pl-2.5 pr-7 text-xs font-medium bg-white border border-neutral-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            >
                                <option value="createdAt">Created</option>
                                <option value="updatedAt">Modified</option>
                                <option value="title">Title</option>
                                <option value="importance">Priority</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                        </div>

                        {/* Sort order */}
                        <button
                            onClick={() =>
                                onFilterChange({
                                    sortOrder:
                                        filters.sortOrder === "desc"
                                            ? "asc"
                                            : "desc",
                                })
                            }
                            className="h-8 px-2.5 flex items-center gap-1 text-xs font-medium bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50"
                        >
                            {filters.sortOrder === "desc" ? (
                                <>
                                    <ArrowDownAZ className="w-3.5 h-3.5" />
                                </>
                            ) : (
                                <>
                                    <ArrowUpAZ className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>

                        {/* Pinned toggle */}
                        <button
                            onClick={() =>
                                onFilterChange({
                                    isPinned: filters.isPinned
                                        ? undefined
                                        : true,
                                })
                            }
                            className={`h-8 px-2.5 flex items-center gap-1 text-xs font-medium rounded-lg transition-all ${
                                filters.isPinned
                                    ? "bg-amber-500 text-white shadow-sm"
                                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                            }`}
                        >
                            <Pin
                                className={`w-3.5 h-3.5 ${
                                    filters.isPinned ? "fill-current" : ""
                                }`}
                            />
                            <span className="hidden xs:inline">Pinned</span>
                        </button>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Clear */}
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="h-8 px-2.5 flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                <X className="w-3 h-3" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
