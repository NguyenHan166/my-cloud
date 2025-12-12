import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { getFileIcon, formatFileSize } from "@/lib/utils/item.utils";

interface FileUploaderProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    maxFiles?: number;
    accept?: string;
}

export default function FileUploader({
    files,
    onFilesChange,
    maxFiles = 10,
    accept,
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        addFiles(selectedFiles);
    };

    const addFiles = (newFiles: File[]) => {
        const remainingSlots = maxFiles - files.length;
        const filesToAdd = newFiles.slice(0, remainingSlots);
        onFilesChange([...files, ...filesToAdd]);
    };

    const removeFile = (index: number) => {
        onFilesChange(files.filter((_, i) => i !== index));
    };

    const getFilePreview = (file: File) => {
        const isImage = file.type.startsWith("image/");

        if (isImage) {
            return URL.createObjectURL(file);
        }
        return null;
    };

    return (
        <div className="space-y-3">
            {/* Drop zone */}
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    isDragging
                        ? "border-sky-500 bg-sky-50"
                        : "border-neutral-300 hover:border-sky-400 hover:bg-neutral-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={accept}
                    onChange={handleFileInput}
                    className="hidden"
                />

                <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-700 font-medium mb-1">
                    Drag files here or click to browse
                </p>
                <p className="text-sm text-neutral-500">
                    Maximum {maxFiles} files ({files.length} selected)
                </p>
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => {
                        const preview = getFilePreview(file);
                        const Icon = getFileIcon(file.type);

                        return (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 group hover:border-sky-300 transition-colors"
                            >
                                {/* Preview/Icon */}
                                <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-neutral-100 flex items-center justify-center">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Icon className="w-6 h-6 text-neutral-500" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {formatFileSize(file.size)} •{" "}
                                        {file.type}
                                    </p>
                                </div>

                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="flex-shrink-0 p-1.5 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    aria-label="Remove file"
                                >
                                    <X className="w-4 h-4 text-red-600" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
