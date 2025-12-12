import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
    X,
    FileText,
    Link as LinkIcon,
    StickyNote,
    Trash2,
    File,
} from "lucide-react";
import type { Item, ItemType, Importance, ItemFile } from "@/types/item.types";
import { itemsApi } from "@/lib/api/endpoints/items";
import { tagsApi } from "@/lib/api/endpoints/tags";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FileUploader from "./FileUploader";
import TagSelector from "./TagSelector";

interface CreateItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    editItem?: Item | null;
}

export default function CreateItemModal({
    isOpen,
    onClose,
    editItem,
}: CreateItemModalProps) {
    const queryClient = useQueryClient();
    const isEditMode = !!editItem;

    // Form state
    const [type, setType] = useState<ItemType>("FILE");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [project, setProject] = useState("");
    const [importance, setImportance] = useState<Importance>("MEDIUM");
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);

    // Existing files management (for edit mode)
    const [existingFiles, setExistingFiles] = useState<ItemFile[]>([]);
    const [removeFileIds, setRemoveFileIds] = useState<string[]>([]);

    // Initialize form with editItem data
    useEffect(() => {
        if (editItem && isOpen) {
            setType(editItem.type);
            setTitle(editItem.title || "");
            setDescription(editItem.description || "");
            setUrl(editItem.url || "");
            setContent(editItem.content || "");
            setCategory(editItem.category || "");
            setProject(editItem.project || "");
            setImportance(editItem.importance || "MEDIUM");
            setSelectedTagIds(editItem.itemTags?.map((t) => t.tagId) || []);
            setFiles([]);
            // Initialize existing files
            setExistingFiles(editItem.files || []);
            setRemoveFileIds([]);
        } else if (!editItem && isOpen) {
            resetForm();
        }
    }, [editItem, isOpen]);

    // Handle removing existing file
    const handleRemoveExistingFile = (fileId: string) => {
        setRemoveFileIds((prev) => [...prev, fileId]);
        setExistingFiles((prev) => prev.filter((f) => f.fileId !== fileId));
    };

    // Create item mutation
    const createMutation = useMutation({
        mutationFn: async () => {
            const itemData = {
                type,
                title,
                description: description || undefined,
                category: category || undefined,
                project: project || undefined,
                importance,
                url: type === "LINK" ? url : undefined,
                content: type === "NOTE" ? content : undefined,
                tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
            };

            return itemsApi.createItem(
                itemData,
                type === "FILE" && files.length > 0 ? files : undefined
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            toast.success("Item created successfully!");
            resetForm();
            onClose();
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to create item"
            );
        },
    });

    // Update item mutation
    const updateMutation = useMutation({
        mutationFn: async () => {
            if (!editItem) return;
            return itemsApi.updateItem(
                editItem.id,
                {
                    title,
                    description: description || undefined,
                    category: category || undefined,
                    project: project || undefined,
                    importance,
                    url: type === "LINK" ? url : undefined,
                    content: type === "NOTE" ? content : undefined,
                    tagIds:
                        selectedTagIds.length > 0 ? selectedTagIds : undefined,
                    removeFileIds:
                        removeFileIds.length > 0 ? removeFileIds : undefined,
                },
                files.length > 0 ? files : undefined
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
            toast.success("Item updated successfully!");
            resetForm();
            onClose();
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to update item"
            );
        },
    });

    // Create tag mutation
    const createTagMutation = useMutation({
        mutationFn: ({ name, color }: { name: string; color: string }) =>
            tagsApi.create({ name, color }),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
            const newTag = response.data.tag;
            setSelectedTagIds([...selectedTagIds, newTag.id]);
            toast.success("Tag created!");
        },
        onError: () => {
            toast.error("Failed to create tag");
        },
    });

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setUrl("");
        setContent("");
        setCategory("");
        setProject("");
        setImportance("MEDIUM");
        setSelectedTagIds([]);
        setFiles([]);
        setExistingFiles([]);
        setRemoveFileIds([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        if (type === "FILE" && files.length === 0 && !isEditMode) {
            toast.error("Please upload at least one file");
            return;
        }

        if (type === "LINK" && !url.trim()) {
            toast.error("URL is required for link items");
            return;
        }

        if (type === "NOTE" && !content.trim()) {
            toast.error("Content is required for note items");
            return;
        }

        if (isEditMode) {
            updateMutation.mutate();
        } else {
            createMutation.mutate();
        }
    };

    const handleCreateTag = (name: string, color: string) => {
        createTagMutation.mutate({ name, color });
    };

    if (!isOpen) return null;

    const tabs: Array<{ type: ItemType; icon: any; label: string }> = [
        { type: "FILE", icon: FileText, label: "File" },
        { type: "LINK", icon: LinkIcon, label: "Link" },
        { type: "NOTE", icon: StickyNote, label: "Note" },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                        {isEditMode ? "Edit Item" : "Create New Item"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-neutral-600" />
                    </button>
                </div>

                {/* Type tabs */}
                <div className="flex border-b border-neutral-200 px-6">
                    {tabs.map(({ type: tabType, icon: Icon, label }) => (
                        <button
                            key={tabType}
                            type="button"
                            onClick={() => setType(tabType)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                                type === tabType
                                    ? "border-sky-500 text-sky-600"
                                    : "border-transparent text-neutral-600 hover:text-neutral-900"
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto p-6 space-y-5"
                >
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter title..."
                            required
                        />
                    </div>

                    {/* Type-specific fields */}
                    {type === "FILE" && (
                        <div className="space-y-4">
                            {/* Existing files (edit mode only) */}
                            {isEditMode && existingFiles.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                        Current Files ({existingFiles.length})
                                    </label>
                                    <div className="space-y-2">
                                        {existingFiles.map((itemFile) => (
                                            <div
                                                key={itemFile.id}
                                                className="flex items-center gap-3 px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200"
                                            >
                                                <File className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900 truncate">
                                                        {itemFile.file
                                                            ?.originalName ||
                                                            "Unknown file"}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">
                                                        {
                                                            itemFile.file
                                                                ?.mimeType
                                                        }
                                                        {itemFile.isPrimary && (
                                                            <span className="ml-2 text-sky-600 font-medium">
                                                                ★ Primary
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveExistingFile(
                                                            itemFile.fileId
                                                        )
                                                    }
                                                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Remove file"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add new files */}
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    {isEditMode ? "Add New Files" : "Files"}{" "}
                                    {!isEditMode && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </label>
                                <FileUploader
                                    files={files}
                                    onFilesChange={setFiles}
                                />
                            </div>
                        </div>
                    )}

                    {type === "LINK" && (
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                URL <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                required
                            />
                        </div>
                    )}

                    {type === "NOTE" && (
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Write your note..."
                                rows={6}
                                required
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description..."
                            rows={3}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                        />
                    </div>

                    {/* Category & Project */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Category
                            </label>
                            <Input
                                type="text"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="e.g., Work, Personal"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Project
                            </label>
                            <Input
                                type="text"
                                value={project}
                                onChange={(e) => setProject(e.target.value)}
                                placeholder="e.g., Website Redesign"
                            />
                        </div>
                    </div>

                    {/* Importance */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Importance
                        </label>
                        <select
                            value={importance}
                            onChange={(e) =>
                                setImportance(e.target.value as Importance)
                            }
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="LOW">🟢 Low</option>
                            <option value="MEDIUM">🟡 Medium</option>
                            <option value="HIGH">🟠 High</option>
                            <option value="URGENT">🔴 Urgent</option>
                        </select>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Tags
                        </label>
                        <TagSelector
                            selectedTagIds={selectedTagIds}
                            onTagsChange={setSelectedTagIds}
                            onCreateTag={handleCreateTag}
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-neutral-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={
                            createMutation.isPending || updateMutation.isPending
                        }
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        onClick={handleSubmit}
                        className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600"
                        disabled={
                            createMutation.isPending || updateMutation.isPending
                        }
                    >
                        {createMutation.isPending || updateMutation.isPending
                            ? isEditMode
                                ? "Updating..."
                                : "Creating..."
                            : isEditMode
                            ? "Update Item"
                            : "Create Item"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
