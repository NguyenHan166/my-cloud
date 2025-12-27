import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Plus } from "lucide-react";
import type { Tag } from "@/types/item.types";
import { tagsApi } from "@/lib/api/endpoints/tags";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface TagSelectorProps {
    selectedTagIds: string[];
    onTagsChange: (tagIds: string[]) => void;
    onCreateTag?: (name: string, color: string) => void;
}

const PRESET_COLORS = [
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#EAB308",
    "#84CC16",
    "#22C55E",
    "#10B981",
    "#14B8A6",
    "#06B6D4",
    "#0EA5E9",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#A855F7",
    "#D946EF",
    "#EC4899",
    "#F43F5E",
];

export default function TagSelector({
    selectedTagIds,
    onTagsChange,
    onCreateTag,
}: TagSelectorProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: tagsResponse } = useQuery({
        queryKey: ["tags"],
        queryFn: () => tagsApi.getAll(),
    });

    // API returns { success, data: Tag[], timestamp }
    const tags: Tag[] = (tagsResponse?.data as Tag[]) || [];

    const filteredTags = tags.filter((tag: Tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedTags = tags.filter((tag: Tag) =>
        selectedTagIds.includes(tag.id)
    );

    const toggleTag = (tagId: string) => {
        if (selectedTagIds.includes(tagId)) {
            onTagsChange(selectedTagIds.filter((id) => id !== tagId));
        } else {
            onTagsChange([...selectedTagIds, tagId]);
        }
    };

    const handleCreateTag = () => {
        if (newTagName.trim() && onCreateTag) {
            onCreateTag(newTagName.trim(), newTagColor);
            setNewTagName("");
            setNewTagColor(PRESET_COLORS[0]);
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* Selected tags - Compact chips */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg border border-neutral-200 dark:border-neutral-600">
                    {selectedTags.map((tag: Tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-white hover:opacity-80 transition-all group"
                            style={{ backgroundColor: tag.color }}
                        >
                            #{tag.name}
                            <X className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        </button>
                    ))}
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Input
                    type="text"
                    placeholder="Search tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm pr-20"
                />
                {!isCreating && (
                    <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded transition-colors"
                    >
                        <Plus className="w-3 h-3" />
                        New
                    </button>
                )}
            </div>

            {/* Create new tag - Inline compact */}
            {isCreating && (
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3 space-y-2">
                    <input
                        type="text"
                        placeholder="New tag name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter" && newTagName.trim()) {
                                handleCreateTag();
                            } else if (e.key === "Escape") {
                                setIsCreating(false);
                                setNewTagName("");
                            }
                        }}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                        autoFocus
                    />
                    <div className="flex gap-1 flex-wrap">
                        {PRESET_COLORS.slice(0, 12).map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setNewTagColor(color)}
                                className={`w-6 h-6 rounded-md transition-all ${
                                    newTagColor === color
                                        ? "ring-2 ring-offset-1 dark:ring-offset-neutral-700 ring-neutral-900 dark:ring-white scale-110"
                                        : "hover:scale-105 opacity-70 hover:opacity-100"
                                }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button
                            type="button"
                            onClick={handleCreateTag}
                            disabled={!newTagName.trim()}
                            className="flex-1 px-3 py-1.5 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            Create
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreating(false);
                                setNewTagName("");
                            }}
                            className="px-3 py-1.5 text-sm bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-500 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Tag list - Grid layout */}
            <div className="max-h-60 overflow-y-auto border border-neutral-200 dark:border-neutral-600 rounded-lg p-2">
                {filteredTags.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5">
                        {filteredTags.map((tag: Tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                className={`text-left px-2.5 py-2 rounded-lg transition-all border ${
                                    selectedTagIds.includes(tag.id)
                                        ? "border-2 shadow-sm scale-[0.98]"
                                        : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                                }`}
                                style={
                                    selectedTagIds.includes(tag.id)
                                        ? {
                                              borderColor: tag.color,
                                              backgroundColor: `${tag.color}10`,
                                          }
                                        : undefined
                                }
                            >
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                        #{tag.name}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-6">
                        {searchTerm ? "No matching tags" : "No tags available"}
                    </p>
                )}
            </div>
        </div>
    );
}
