import { useState, useEffect } from "react";
import { tagsApi } from "@/lib/api";
import type { Tag } from "@/lib/types";

interface TagSelectorProps {
    selectedTagIds: string[];
    onTagsChange: (tagIds: string[]) => void;
}

const PRESET_COLORS = [
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#22C55E",
    "#06B6D4",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
];

export function TagSelector({
    selectedTagIds,
    onTagsChange,
}: TagSelectorProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        setLoading(true);
        try {
            const response = await tagsApi.getAll();
            if (response.data?.data) {
                setTags(response.data.data);
            }
        } catch (err) {
            console.error("Failed to load tags:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (tagId: string) => {
        if (selectedTagIds.includes(tagId)) {
            onTagsChange(selectedTagIds.filter((id) => id !== tagId));
        } else {
            onTagsChange([...selectedTagIds, tagId]);
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;

        setCreating(true);
        try {
            const response = await tagsApi.create({
                name: newTagName.trim(),
                color: newTagColor,
            });
            if (response.data?.data) {
                const newTag = response.data.data;
                setTags([...tags, newTag]);
                onTagsChange([...selectedTagIds, newTag.id]);
                setNewTagName("");
                setShowCreate(false);
            }
        } catch (err) {
            console.error("Failed to create tag:", err);
        } finally {
            setCreating(false);
        }
    };

    const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

    if (loading) {
        return <div className="tag-loading">Loading tags...</div>;
    }

    return (
        <div className="tag-selector">
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div className="selected-tags">
                    {selectedTags.map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            className="tag-chip selected"
                            style={{ backgroundColor: tag.color }}
                            onClick={() => toggleTag(tag.id)}
                        >
                            #{tag.name} ✕
                        </button>
                    ))}
                </div>
            )}

            {/* Tag List */}
            <div className="tag-list">
                {tags
                    .filter((tag) => !selectedTagIds.includes(tag.id))
                    .map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            className="tag-chip"
                            style={{
                                borderColor: tag.color,
                                color: tag.color,
                            }}
                            onClick={() => toggleTag(tag.id)}
                        >
                            #{tag.name}
                        </button>
                    ))}
                <button
                    type="button"
                    className="tag-add-btn"
                    onClick={() => setShowCreate(!showCreate)}
                >
                    ➕
                </button>
            </div>

            {/* Create New Tag */}
            {showCreate && (
                <div className="tag-create">
                    <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Tag name..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateTag();
                            if (e.key === "Escape") setShowCreate(false);
                        }}
                    />
                    <div className="color-picker">
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className={`color-btn ${
                                    newTagColor === color ? "active" : ""
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => setNewTagColor(color)}
                            />
                        ))}
                    </div>
                    <div className="tag-create-actions">
                        <button
                            type="button"
                            onClick={() => setShowCreate(false)}
                            className="btn-cancel-small"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateTag}
                            disabled={!newTagName.trim() || creating}
                            className="btn-create-small"
                        >
                            {creating ? "..." : "Tạo"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
