import { useState } from "react";
import { Pause, Play, X, CheckCircle } from "lucide-react";

export interface UploadProgressProps {
    filename: string;
    progress: number;
    status?: "uploading" | "paused" | "completed" | "error";
    currentChunk?: number;
    totalChunks?: number;
    onPause?: () => void;
    onResume?: () => void;
    onCancel?: () => void;
}

export function UploadProgress({
    filename,
    progress,
    status = "uploading",
    currentChunk,
    totalChunks,
    onPause,
    onResume,
    onCancel,
}: UploadProgressProps) {
    const [isHovered, setIsHovered] = useState(false);

    const getStatusText = () => {
        if (status === "completed") return "Completed";
        if (status === "paused") return "Paused";
        if (status === "error") return "Error";
        if (currentChunk && totalChunks) {
            return `Uploading chunk ${currentChunk}/${totalChunks}`;
        }
        return "Uploading...";
    };

    const getStatusColor = () => {
        if (status === "completed") return "text-green-600";
        if (status === "paused") return "text-yellow-600";
        if (status === "error") return "text-red-600";
        return "text-blue-600";
    };

    return (
        <div
            className="upload-progress-item bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium text-gray-900 truncate">
                        {filename}
                    </p>
                    <p className={`text-sm ${getStatusColor()}`}>
                        {getStatusText()}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {status === "completed" ? (
                        <div className="text-green-600">
                            <CheckCircle size={20} />
                        </div>
                    ) : (
                        <>
                            <span className="text-sm font-semibold text-gray-700">
                                {Math.round(progress)}%
                            </span>

                            {isHovered && status !== "error" && (
                                <div className="flex gap-1">
                                    {status === "paused" ? (
                                        <button
                                            onClick={onResume}
                                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            title="Resume upload"
                                        >
                                            <Play
                                                size={16}
                                                className="text-gray-700"
                                            />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={onPause}
                                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                                            title="Pause upload"
                                        >
                                            <Pause
                                                size={16}
                                                className="text-gray-700"
                                            />
                                        </button>
                                    )}
                                    <button
                                        onClick={onCancel}
                                        className="p-1 hover:bg-red-100 rounded transition-colors"
                                        title="Cancel upload"
                                    >
                                        <X size={16} className="text-red-600" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${
                        status === "completed"
                            ? "bg-green-500"
                            : status === "paused"
                              ? "bg-yellow-500"
                              : status === "error"
                                ? "bg-red-500"
                                : "bg-blue-500"
                    }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
