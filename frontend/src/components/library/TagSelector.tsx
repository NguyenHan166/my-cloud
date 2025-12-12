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
            {/* Selected tags */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag: Tag) => (
                        <Badge
                            key={tag.id}
                            variant="outline"
                            style={{
                                backgroundColor: `${tag.color}15`,
                                borderColor: tag.color,
                                color: tag.color,
                            }}
                            className="pr-1"
                        >
                            {tag.name}
                            <button
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                className="ml-1.5 p-0.5 hover:bg-black/10 rounded"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Search */}
            <Input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
            />

            {/* Tag list */}
            <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-lg p-2 space-y-1">
                {filteredTags.length > 0 ? (
                    filteredTags.map((tag: Tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                selectedTagIds.includes(tag.id)
                                    ? "bg-sky-50 border border-sky-300"
                                    : "hover:bg-neutral-50 border border-transparent"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                />
                                <span className="text-sm font-medium text-neutral-900">
                                    {tag.name}
                                </span>
                            </div>
                        </button>
                    ))
                ) : (
                    <p className="text-sm text-neutral-500 text-center py-4">
                        No tags found
                    </p>
                )}
            </div>

            {/* Create new tag */}
            {isCreating ? (
                <div className="border border-neutral-200 rounded-lg p-3 space-y-3">
                    <Input
                        type="text"
                        placeholder="Tag name"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        className="text-sm"
                    />

                    {/* Color picker */}
                    <div>
                        <label className="block text-xs font-medium text-neutral-700 mb-2">
                            Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewTagColor(color)}
                                    className={`w-8 h-8 rounded-lg transition-transform ${
                                        newTagColor === color
                                            ? "ring-2 ring-neutral-900 scale-110"
                                            : "hover:scale-105"
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsCreating(false);
                                setNewTagName("");
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleCreateTag}
                            disabled={!newTagName.trim()}
                            className="flex-1"
                        >
                            Create
                        </Button>
                    </div>
                </div>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreating(true)}
                    className="w-full"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Tag
                </Button>
            )}
        </div>
    );
}
