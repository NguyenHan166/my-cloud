import { useState, useEffect } from "react";
import {
    X,
    Pin,
    Trash2,
    ExternalLink,
    Download,
    Calendar,
    Clock,
    Edit3,
    Eye,
    FolderPlus,
} from "lucide-react";
import type { Item } from "@/types/item.types";
import {
    getItemTypeIcon,
    getImportanceBadgeColor,
} from "@/lib/utils/item.utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import FilePreviewModal from "./FilePreviewModal";
import { AddToCollectionModal } from "@/components/collections";

interface ItemDetailPanelProps {
    item: Item | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (item: Item) => void;
    onPin?: (id: string) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
}

export default function ItemDetailPanel({
    item,
    isOpen,
    onClose,
    onEdit,
    onPin,
    onDelete,
}: ItemDetailPanelProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [showAddToCollection, setShowAddToCollection] = useState(false);

    // Handle open/close animation
    useEffect(() => {
        if (isOpen) {
            // Small delay for enter animation to work
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            setIsClosing(false);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    if (!item) return null;

    const Icon = getItemTypeIcon(item.type);
    const primaryFile =
        item.files?.find((f) => f.isPrimary)?.file || item.files?.[0]?.file;
    const isImage = primaryFile?.mimeType?.startsWith("image/");

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className={`fixed top-14 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
                        isVisible && !isClosing ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={handleClose}
                />
            )}

            {/* Panel */}
            <div
                className={`fixed top-14 bottom-0 right-0 w-full sm:w-[480px] bg-gradient-to-b from-slate-50 to-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
                    isVisible && !isClosing
                        ? "translate-x-0"
                        : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 rounded-lg">
                            <Icon className="w-5 h-5 text-sky-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 line-clamp-1">
                                {item.title}
                            </h2>
                            <span className="text-xs text-neutral-500">
                                {item.type}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2.5 bg-neutral-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-all"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Hero Image for FILE type */}
                    {item.type === "FILE" && isImage && primaryFile?.url && (
                        <div className="relative h-48 bg-neutral-100">
                            <img
                                src={primaryFile.url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>
                    )}

                    <div className="p-4 space-y-4">
                        {/* Description Card */}
                        {item.description && (
                            <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
                                <p className="text-neutral-700 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        )}

                        {/* URL for LINK type */}
                        {item.type === "LINK" && item.url && (
                            <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <ExternalLink className="w-4 h-4 text-sky-600" />
                                    <span className="text-sm font-medium text-sky-700">
                                        Link
                                    </span>
                                </div>
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-600 hover:text-sky-700 hover:underline break-all text-sm font-medium"
                                >
                                    {item.url}
                                </a>
                                {item.domain && (
                                    <p className="text-xs text-neutral-500 mt-1">
                                        {item.domain}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Content for NOTE type */}
                        {item.type === "NOTE" && item.content && (
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                <pre className="whitespace-pre-wrap text-neutral-700 text-sm font-sans leading-relaxed">
                                    {item.content}
                                </pre>
                            </div>
                        )}

                        {/* Files List */}
                        {item.type === "FILE" &&
                            item.files &&
                            item.files.length > 0 && (
                                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
                                        <span className="text-sm font-semibold text-neutral-700">
                                            📁 Files ({item.files.length})
                                        </span>
                                    </div>
                                    <div className="divide-y divide-neutral-100">
                                        {item.files.map((itemFile, index) => {
                                            const file = itemFile.file;
                                            return (
                                                <div
                                                    key={itemFile.id}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors cursor-pointer group"
                                                    onClick={() => {
                                                        setPreviewIndex(index);
                                                        setPreviewOpen(true);
                                                    }}
                                                >
                                                    {itemFile.isPrimary && (
                                                        <Badge
                                                            variant="primary"
                                                            size="sm"
                                                        >
                                                            ★
                                                        </Badge>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-neutral-900 truncate group-hover:text-sky-600 transition-colors">
                                                            {file?.originalName ||
                                                                "Unnamed"}
                                                        </p>
                                                        <p className="text-xs text-neutral-500">
                                                            {file?.mimeType}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPreviewIndex(
                                                                    index
                                                                );
                                                                setPreviewOpen(
                                                                    true
                                                                );
                                                            }}
                                                            className="p-2 text-neutral-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                            title="Preview"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {file?.url && (
                                                            <a
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        {/* File Preview Modal */}
                        {item.type === "FILE" &&
                            item.files &&
                            item.files.length > 0 && (
                                <FilePreviewModal
                                    files={item.files}
                                    initialIndex={previewIndex}
                                    isOpen={previewOpen}
                                    onClose={() => setPreviewOpen(false)}
                                />
                            )}

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {item.category && (
                                <div className="bg-white rounded-xl p-3 border border-neutral-200">
                                    <span className="text-xs text-neutral-500 block mb-1">
                                        Category
                                    </span>
                                    <span className="text-sm font-medium text-neutral-900">
                                        {item.category}
                                    </span>
                                </div>
                            )}
                            {item.project && (
                                <div className="bg-white rounded-xl p-3 border border-neutral-200">
                                    <span className="text-xs text-neutral-500 block mb-1">
                                        Project
                                    </span>
                                    <span className="text-sm font-medium text-neutral-900">
                                        {item.project}
                                    </span>
                                </div>
                            )}
                            <div className="bg-white rounded-xl p-3 border border-neutral-200">
                                <span className="text-xs text-neutral-500 block mb-1">
                                    Importance
                                </span>
                                <Badge
                                    variant="default"
                                    size="sm"
                                    className={getImportanceBadgeColor(
                                        item.importance
                                    )}
                                >
                                    {item.importance}
                                </Badge>
                            </div>
                            <div className="bg-white rounded-xl p-3 border border-neutral-200">
                                <span className="text-xs text-neutral-500 block mb-1">
                                    Status
                                </span>
                                <Badge
                                    variant={
                                        item.isPinned ? "primary" : "outline"
                                    }
                                    size="sm"
                                >
                                    {item.isPinned ? "📌 Pinned" : "Not Pinned"}
                                </Badge>
                            </div>
                        </div>

                        {/* Tags */}
                        {item.itemTags && item.itemTags.length > 0 && (
                            <div className="bg-white rounded-xl p-4 border border-neutral-200">
                                <span className="text-xs text-neutral-500 block mb-2">
                                    Tags
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {item.itemTags.map((itemTag) => (
                                        <Badge
                                            key={itemTag.tagId}
                                            variant="outline"
                                            style={{
                                                backgroundColor: itemTag.tag
                                                    .color
                                                    ? `${itemTag.tag.color}15`
                                                    : undefined,
                                                borderColor: itemTag.tag.color,
                                                color: itemTag.tag.color,
                                            }}
                                        >
                                            {itemTag.tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="flex gap-3 text-xs text-neutral-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>
                                    Created:{" "}
                                    {new Date(
                                        item.createdAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                    Updated:{" "}
                                    {new Date(
                                        item.updatedAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex-shrink-0 bg-white border-t border-neutral-200 px-4 py-3 flex gap-2">
                    <Button
                        variant="primary"
                        onClick={() => onEdit && onEdit(item)}
                        className="flex-1 py-2.5"
                    >
                        <Edit3 className="w-4 h-4 mr-1.5" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowAddToCollection(true)}
                        className="py-2.5 px-4"
                        title="Add to Collection"
                    >
                        <FolderPlus className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={item.isPinned ? "primary" : "outline"}
                        onClick={() => onPin && onPin(item.id)}
                        className="py-2.5 px-4"
                    >
                        <Pin className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="danger"
                        onClick={async () => {
                            if (onDelete) {
                                await onDelete(item.id);
                            }
                        }}
                        className="py-2.5 px-4"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Add to Collection Modal */}
            <AddToCollectionModal
                isOpen={showAddToCollection}
                onClose={() => setShowAddToCollection(false)}
                itemIds={[item.id]}
                itemTitle={item.title}
            />
        </>
    );
}
