import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Download,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize2,
    FileText,
    FileIcon,
    FileCode,
    FileSpreadsheet,
    FileArchive,
    ArrowLeft,
} from "lucide-react";
import { isImageFile, isVideoFile, isPdfFile } from "@/lib/utils/item.utils";
import type { ItemFile } from "@/types/item.types";

interface FilePreviewModalProps {
    files: ItemFile[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
}

// Helper to check if file is previewable document (Word, Excel, text, etc.)
function isDocumentFile(mimeType?: string): boolean {
    if (!mimeType) return false;
    return (
        mimeType.includes("text/") ||
        mimeType.includes("application/msword") ||
        mimeType.includes("application/vnd.openxmlformats") ||
        mimeType.includes("application/vnd.ms-excel") ||
        mimeType.includes("application/vnd.ms-powerpoint")
    );
}

// Helper to check if file is code file
function isCodeFile(mimeType?: string): boolean {
    if (!mimeType) return false;
    return (
        mimeType.includes("javascript") ||
        mimeType.includes("json") ||
        mimeType.includes("html") ||
        mimeType.includes("css") ||
        mimeType.includes("xml") ||
        mimeType.includes("python") ||
        mimeType.includes("java")
    );
}

// Helper to get file icon for non-previewable files
function getFileTypeIcon(mimeType?: string) {
    if (!mimeType) return FileIcon;
    if (mimeType.includes("pdf")) return FileText;
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
        return FileSpreadsheet;
    if (mimeType.includes("zip") || mimeType.includes("archive"))
        return FileArchive;
    if (isCodeFile(mimeType)) return FileCode;
    if (isDocumentFile(mimeType)) return FileText;
    return FileIcon;
}

// Format file size
function formatFileSize(bytes?: number): string {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function FilePreviewModal({
    files,
    initialIndex = 0,
    isOpen,
    onClose,
}: FilePreviewModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const currentFile = files[currentIndex];
    const fileData = currentFile?.file;
    const mimeType = fileData?.mimeType;
    const fileUrl = fileData?.url;
    const fileName = fileData?.originalName || "File";

    // Reset state when file changes
    useEffect(() => {
        setZoom(1);
        setRotation(0);
        setIsLoading(true);
    }, [currentIndex]);

    // Reset index when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(initialIndex);
        }
    }, [isOpen, initialIndex]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case "Escape":
                    onClose();
                    break;
                case "ArrowLeft":
                    if (currentIndex > 0) {
                        setCurrentIndex((prev) => prev - 1);
                    }
                    break;
                case "ArrowRight":
                    if (currentIndex < files.length - 1) {
                        setCurrentIndex((prev) => prev + 1);
                    }
                    break;
                case "+":
                case "=":
                    setZoom((prev) => Math.min(prev + 0.25, 3));
                    break;
                case "-":
                    setZoom((prev) => Math.max(prev - 0.25, 0.5));
                    break;
            }
        },
        [isOpen, currentIndex, files.length, onClose]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen || !currentFile) return null;

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < files.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handleDownload = () => {
        if (fileUrl) {
            window.open(fileUrl, "_blank");
        }
    };

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
    const handleResetZoom = () => {
        setZoom(1);
        setRotation(0);
    };

    // Render content based on file type
    const renderContent = () => {
        if (!fileUrl) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                    <FileIcon className="w-24 h-24 mb-4" />
                    <p className="text-lg">File URL not available</p>
                </div>
            );
        }

        // Image preview
        if (isImageFile(mimeType || "")) {
            return (
                <div className="flex items-center justify-center h-full overflow-auto p-4">
                    <img
                        src={fileUrl}
                        alt={fileName}
                        className="max-w-full max-h-full object-contain transition-transform duration-200"
                        style={{
                            transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        }}
                        onLoad={() => setIsLoading(false)}
                        onError={() => setIsLoading(false)}
                    />
                </div>
            );
        }

        // Video preview
        if (isVideoFile(mimeType || "")) {
            return (
                <div className="flex items-center justify-center h-full p-4">
                    <video
                        src={fileUrl}
                        controls
                        autoPlay
                        className="max-w-full max-h-full rounded-lg shadow-2xl"
                        onLoadedData={() => setIsLoading(false)}
                        onError={() => setIsLoading(false)}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            );
        }

        // PDF preview
        if (isPdfFile(mimeType || "")) {
            return (
                <div className="w-full h-full p-4">
                    <iframe
                        src={`${fileUrl}#toolbar=1`}
                        className="w-full h-full rounded-lg shadow-2xl bg-white"
                        title={fileName}
                        onLoad={() => setIsLoading(false)}
                        onError={() => setIsLoading(false)}
                    />
                </div>
            );
        }

        // Text/Code files - try to display if possible
        if (
            mimeType?.startsWith("text/") ||
            mimeType === "application/json" ||
            isCodeFile(mimeType)
        ) {
            return (
                <div className="w-full h-full p-4">
                    <iframe
                        src={fileUrl}
                        className="w-full h-full rounded-lg shadow-2xl bg-white"
                        title={fileName}
                        onLoad={() => setIsLoading(false)}
                        onError={() => setIsLoading(false)}
                    />
                </div>
            );
        }

        // Non-previewable files - show info card
        const Icon = getFileTypeIcon(mimeType);
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl">
                    <Icon className="w-32 h-32 mb-6 mx-auto text-white/80" />
                    <h3 className="text-2xl font-bold mb-2 text-center">
                        {fileName}
                    </h3>
                    <p className="text-white/60 mb-2 text-center">
                        {mimeType || "Unknown type"}
                    </p>
                    <p className="text-white/60 mb-6 text-center">
                        {formatFileSize(fileData?.size)}
                    </p>
                    <p className="text-white/40 text-sm text-center mb-6">
                        Preview not available for this file type
                    </p>
                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Download File
                    </button>
                </div>
            </div>
        );
    };

    const modalContent = (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-3 bg-gradient-to-b from-black/80 to-transparent">
                {/* Left side - Back button & File info */}
                <div className="flex items-center gap-2 text-white">
                    {/* Back/Close button - Prominent */}
                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-medium"
                        title="Đóng (Esc)"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Đóng</span>
                    </button>

                    <div className="w-px h-6 bg-white/20 mx-1" />

                    <span className="font-medium truncate max-w-[120px] sm:max-w-[250px] text-sm sm:text-base">
                        {fileName}
                    </span>
                    {files.length > 1 && (
                        <span className="text-white/60 text-sm">
                            {currentIndex + 1} / {files.length}
                        </span>
                    )}
                </div>

                {/* Right side - Controls */}
                <div className="flex items-center gap-0.5 sm:gap-1">
                    {/* Zoom controls - only for images, hidden on mobile */}
                    {isImageFile(mimeType || "") && (
                        <div className="hidden sm:flex items-center gap-1">
                            <button
                                onClick={handleZoomOut}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Zoom Out (-)"
                            >
                                <ZoomOut className="w-5 h-5" />
                            </button>
                            <span className="text-white/60 text-sm min-w-[50px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Zoom In (+)"
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleRotate}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Rotate"
                            >
                                <RotateCw className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleResetZoom}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                title="Reset"
                            >
                                <Maximize2 className="w-5 h-5" />
                            </button>
                            <div className="w-px h-6 bg-white/20 mx-2" />
                        </div>
                    )}

                    <button
                        onClick={handleDownload}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Download"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/80 hover:text-white hover:bg-red-500/50 rounded-lg transition-colors"
                        title="Đóng (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Loading spinner */}
            {isLoading &&
                (isImageFile(mimeType || "") ||
                    isVideoFile(mimeType || "") ||
                    isPdfFile(mimeType || "")) && (
                    <div className="absolute inset-0 flex items-center justify-center z-5">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                )}

            {/* Content */}
            <div className="h-full pt-14 pb-4">{renderContent()}</div>

            {/* Navigation arrows - only show if multiple files */}
            {files.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all ${
                            currentIndex === 0
                                ? "opacity-30 cursor-not-allowed"
                                : "hover:bg-white/20 hover:scale-110"
                        }`}
                        title="Previous (←)"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentIndex === files.length - 1}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all ${
                            currentIndex === files.length - 1
                                ? "opacity-30 cursor-not-allowed"
                                : "hover:bg-white/20 hover:scale-110"
                        }`}
                        title="Next (→)"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                </>
            )}

            {/* Thumbnails - only show if multiple files */}
            {files.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-2">
                    {files.map((file, index) => {
                        const thumbFile = file.file;
                        const isImage = isImageFile(thumbFile?.mimeType || "");
                        const ThumbnailIcon = getFileTypeIcon(
                            thumbFile?.mimeType
                        );

                        return (
                            <button
                                key={file.id}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentIndex
                                        ? "border-sky-500 scale-110"
                                        : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                            >
                                {isImage && thumbFile?.url ? (
                                    <img
                                        src={thumbFile.url}
                                        alt={thumbFile.originalName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-neutral-700 flex items-center justify-center">
                                        <ThumbnailIcon className="w-5 h-5 text-white/60" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return createPortal(modalContent, document.body);
}
