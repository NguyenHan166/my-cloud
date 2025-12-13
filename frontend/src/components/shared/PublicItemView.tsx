import { Download, Eye, ExternalLink, FileText } from "lucide-react";
import type { PublicItem } from "@/types/sharedLink.types";
import Badge from "@/components/ui/Badge";

interface PublicItemViewProps {
    item: PublicItem;
    expiresAt: string;
    accessCount: number;
}

export default function PublicItemView({
    item,
    expiresAt,
    accessCount,
}: PublicItemViewProps) {
    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case "URGENT":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            case "HIGH":
                return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
            case "MEDIUM":
                return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            default:
                return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400";
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Title Section */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                        <FileText className="w-8 h-8 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                            {item.title}
                        </h1>
                        {item.description && (
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                {item.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2">
                    <Badge
                        variant="outline"
                        className={getImportanceColor(item.importance)}
                    >
                        {item.importance}
                    </Badge>
                    {item.category && (
                        <Badge variant="outline">📁 {item.category}</Badge>
                    )}
                    {item.project && (
                        <Badge variant="outline">📊 {item.project}</Badge>
                    )}
                </div>
            </div>

            {/* URL for LINK type */}
            {item.type === "LINK" && item.url && (
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 rounded-2xl p-6 border border-sky-200 dark:border-sky-800">
                    <div className="flex items-center gap-2 mb-3">
                        <ExternalLink className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        <span className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                            Link
                        </span>
                    </div>
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 dark:text-sky-400 hover:underline break-all font-medium"
                    >
                        {item.url}
                    </a>
                    {item.domain && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                            Domain: {item.domain}
                        </p>
                    )}
                </div>
            )}

            {/* Content for NOTE type */}
            {item.type === "NOTE" && item.content && (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                    <pre className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300 text-sm font-sans leading-relaxed">
                        {item.content}
                    </pre>
                </div>
            )}

            {/* Files for FILE type */}
            {item.type === "FILE" && item.files.length > 0 && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                            📁 Files ({item.files.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
                        {item.files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                            >
                                {file.isPrimary && (
                                    <Badge variant="primary" size="sm">
                                        ★
                                    </Badge>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                                        {file.originalName}
                                    </p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {file.mimeType} •{" "}
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={file.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                                        title="Preview"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </a>
                                    <a
                                        href={file.url}
                                        download
                                        className="p-2 text-neutral-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-sm">
                    <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-3">
                        🏷️ Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, index) => (
                            <Badge
                                key={index}
                                variant="outline"
                                style={{
                                    backgroundColor: `${tag.color}15`,
                                    borderColor: tag.color,
                                    color: tag.color,
                                }}
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Link Info */}
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <span>⏰</span>
                        <span>
                            Expires: {new Date(expiresAt).toLocaleDateString()}{" "}
                            at {new Date(expiresAt).toLocaleTimeString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                        <span>👁️</span>
                        <span>Views: {accessCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
