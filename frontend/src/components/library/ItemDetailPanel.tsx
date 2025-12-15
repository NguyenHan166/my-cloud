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
    Share2,
    Copy,
} from "lucide-react";
import type { Item } from "@/types/item.types";
import {
    getItemTypeIcon,
    getImportanceBadgeColor,
} from "@/lib/utils/item.utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import MonacoEditor from "@/components/ui/MonacoEditor";
import { getLanguageLabel } from "@/lib/constants/languageOptions";
import FilePreviewModal from "./FilePreviewModal";
import { AddToCollectionModal } from "@/components/collections";
import ShareLinkModal from "@/components/shared/ShareLinkModal";

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
    const [showShareModal, setShowShareModal] = useState(false);
    const [noteDisplayMode, setNoteDisplayMode] = useState<string | null>(null);

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
                className={`fixed top-14 bottom-0 right-0 w-full sm:w-[480px] bg-gradient-to-b from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-950 shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
                    isVisible && !isClosing
                        ? "translate-x-0"
                        : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex-shrink-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                            <Icon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                                {item.title}
                            </h2>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                {item.type}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-all"
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
                            <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
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
                            <div className="rounded-xl overflow-hidden border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center justify-between px-3 py-2 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
                                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                        📝 Note Content
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    item.content || ""
                                                );
                                                // Optional: show a toast notification
                                            }}
                                            className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 dark:hover:bg-amber-800 px-2 py-1 rounded transition-colors"
                                            title="Copy content"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy
                                        </button>
                                        <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded">
                                            {getLanguageLabel(
                                                noteDisplayMode ||
                                                    item.contentType ||
                                                    "plaintext"
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <MonacoEditor
                                    value={item.content}
                                    onChange={() => {}}
                                    language={
                                        noteDisplayMode ||
                                        item.contentType ||
                                        "plaintext"
                                    }
                                    onLanguageChange={setNoteDisplayMode}
                                    height="300px"
                                    readOnly={true}
                                />
                            </div>
                        )}

                        {/* Attachments for NOTE type */}
                        {item.type === "NOTE" &&
                            item.files &&
                            item.files.length > 0 && (
                                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                            📎 Attachments ({item.files.length})
                                        </span>
                                    </div>
                                    <div className="p-3 grid grid-cols-2 gap-2">
                                        {item.files.map((itemFile, index) => {
                                            const file = itemFile.file;
                                            const isImage =
                                                file?.mimeType?.startsWith(
                                                    "image/"
                                                );
                                            return (
                                                <div
                                                    key={itemFile.id}
                                                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
                                                    onClick={() => {
                                                        setPreviewIndex(index);
                                                        setPreviewOpen(true);
                                                    }}
                                                >
                                                    {isImage && file?.url ? (
                                                        <img
                                                            src={file.url}
                                                            alt={
                                                                file.originalName
                                                            }
                                                            className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-24 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                                                            <span className="text-xs text-neutral-500">
                                                                {
                                                                    file?.originalName
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                        <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        {/* File Preview Modal for NOTE attachments */}
                        {item.type === "NOTE" &&
                            item.files &&
                            item.files.length > 0 && (
                                <FilePreviewModal
                                    files={item.files}
                                    initialIndex={previewIndex}
                                    isOpen={previewOpen}
                                    onClose={() => setPreviewOpen(false)}
                                />
                            )}

                        {/* Files Gallery */}
                        {item.type === "FILE" &&
                            item.files &&
                            item.files.length > 0 && (
                                <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                            📁 Files ({item.files.length})
                                        </span>
                                    </div>
                                    <div className="p-3 grid grid-cols-2 gap-2">
                                        {item.files.map((itemFile, index) => {
                                            const file = itemFile.file;
                                            const isImage =
                                                file?.mimeType?.startsWith(
                                                    "image/"
                                                );
                                            const isVideo =
                                                file?.mimeType?.startsWith(
                                                    "video/"
                                                );
                                            return (
                                                <div
                                                    key={itemFile.id}
                                                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700"
                                                    onClick={() => {
                                                        setPreviewIndex(index);
                                                        setPreviewOpen(true);
                                                    }}
                                                >
                                                    {isImage && file?.url ? (
                                                        <img
                                                            src={file.url}
                                                            alt={
                                                                file.originalName
                                                            }
                                                            className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    ) : isVideo && file?.url ? (
                                                        <video
                                                            src={file.url}
                                                            className="w-full h-28 object-cover"
                                                            muted
                                                        />
                                                    ) : (
                                                        <div className="w-full h-28 bg-neutral-100 dark:bg-neutral-700 flex flex-col items-center justify-center gap-1">
                                                            <Download className="w-6 h-6 text-neutral-400" />
                                                            <span className="text-xs text-neutral-500 px-2 text-center truncate w-full">
                                                                {file?.mimeType
                                                                    ?.split(
                                                                        "/"
                                                                    )[1]
                                                                    ?.toUpperCase() ||
                                                                    "FILE"}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {/* Primary badge */}
                                                    {itemFile.isPrimary && (
                                                        <div className="absolute top-1 left-1 bg-sky-500 text-white text-xs px-1.5 py-0.5 rounded">
                                                            ★
                                                        </div>
                                                    )}
                                                    {/* Hover overlay */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2">
                                                        <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    {/* Filename */}
                                                    <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 truncate">
                                                        {file?.originalName}
                                                    </p>
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
                                <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700">
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">
                                        Category
                                    </span>
                                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
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
                        variant="outline"
                        onClick={() => setShowShareModal(true)}
                        className="py-2.5 px-4"
                        title="Share"
                    >
                        <Share2 className="w-4 h-4" />
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

            {/* Share Link Modal */}
            <ShareLinkModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                itemId={item.id}
                itemTitle={item.title}
            />
        </>
    );
}
