import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Folder, Globe, Lock, Image } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { collectionsApi } from "@/lib/api/endpoints/collections";
import type { Collection, CreateCollectionDto } from "@/types/collection.types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface CreateCollectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    parentId?: string | null; // Parent collection ID (null = root)
    editCollection?: Collection | null;
}

export default function CreateCollectionModal({
    isOpen,
    onClose,
    parentId = null,
    editCollection = null,
}: CreateCollectionModalProps) {
    const queryClient = useQueryClient();
    const isEditMode = !!editCollection;

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (editCollection) {
                setName(editCollection.name);
                setDescription(editCollection.description || "");
                setCoverImage(editCollection.coverImage || "");
                setIsPublic(editCollection.isPublic);
            } else {
                setName("");
                setDescription("");
                setCoverImage("");
                setIsPublic(false);
            }
        }
    }, [isOpen, editCollection]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateCollectionDto) => collectionsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            toast.success("Collection created!");
            onClose();
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to create collection"
            );
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: CreateCollectionDto) =>
            collectionsApi.update(editCollection!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["collections"] });
            toast.success("Collection updated!");
            onClose();
        },
        onError: (error: any) => {
            toast.error(
                error.response?.data?.message || "Failed to update collection"
            );
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        const data: CreateCollectionDto = {
            name: name.trim(),
            description: description.trim() || undefined,
            coverImage: coverImage.trim() || undefined,
            isPublic,
            parentId: parentId || undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 rounded-xl">
                            <Folder className="w-5 h-5 text-sky-600" />
                        </div>
                        <h2 className="text-lg font-bold text-neutral-900">
                            {isEditMode ? "Edit Collection" : "New Collection"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Collection"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description..."
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 resize-none"
                        />
                    </div>

                    {/* Cover Image URL */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                            <span className="flex items-center gap-1">
                                <Image className="w-4 h-4" />
                                Cover Image URL
                            </span>
                        </label>
                        <Input
                            type="url"
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    {/* Public toggle */}
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            {isPublic ? (
                                <Globe className="w-4 h-4 text-green-600" />
                            ) : (
                                <Lock className="w-4 h-4 text-neutral-500" />
                            )}
                            <span className="text-sm font-medium text-neutral-700">
                                {isPublic ? "Public" : "Private"}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative w-10 h-6 rounded-full transition-colors ${
                                isPublic ? "bg-green-500" : "bg-neutral-300"
                            }`}
                        >
                            <span
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                    isPublic ? "translate-x-5" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>

                    {/* Parent info */}
                    {parentId && !isEditMode && (
                        <p className="text-xs text-neutral-500 bg-sky-50 px-3 py-2 rounded-lg">
                            This collection will be created inside the current
                            folder.
                        </p>
                    )}
                </form>

                {/* Footer */}
                <div className="flex gap-3 p-5 border-t border-neutral-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        onClick={handleSubmit}
                        className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600"
                        disabled={isPending}
                    >
                        {isPending
                            ? isEditMode
                                ? "Saving..."
                                : "Creating..."
                            : isEditMode
                            ? "Save"
                            : "Create"}
                    </Button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
