import type { Item } from "@/lib/types";

interface ItemDetailProps {
    item: Item;
    onBack: () => void;
    onDelete: (id: string) => void;
    getItemIcon: (item: Item) => string;
}

export function ItemDetail({
    item,
    onBack,
    onDelete,
    getItemIcon,
}: ItemDetailProps) {
    const getFileUrl = (item: Item): string => {
        if (item.type === "LINK" && item.url) return item.url;
        if (item.type === "FILE" && item.files?.[0]) {
            const fileInfo = item.files[0] as unknown as {
                file?: { url?: string };
                url?: string;
            };
            return fileInfo?.file?.url || fileInfo?.url || "";
        }
        return "";
    };

    const handleOpenItem = () => {
        const url = getFileUrl(item);
        if (url) {
            browser.tabs.create({ url });
        }
    };

    const handleCopyLink = async () => {
        const url = getFileUrl(item);
        if (url) {
            await navigator.clipboard.writeText(url);
        }
    };

    const handleCopyContent = async () => {
        if (item.content) {
            await navigator.clipboard.writeText(item.content);
        }
    };

    const fileUrl = getFileUrl(item);
    const fileInfo = item.files?.[0] as unknown as {
        file?: {
            mimeType?: string;
            url?: string;
            originalName?: string;
            size?: number;
        };
    };
    const file = fileInfo?.file;

    // Get tags from itemTags if available
    const itemWithTags = item as unknown as {
        itemTags?: Array<{ tag: { name: string; color: string } }>;
        tagsText?: string;
    };
    const tags = itemWithTags.itemTags?.map((t) => t.tag) || [];

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatFileSize = (size: number) => {
        if (size > 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`;
        if (size > 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${size} B`;
    };

    return (
        <div className="item-detail">
            {/* Header */}
            <div className="detail-header">
                <button className="back-btn" onClick={onBack}>
                    ← Quay lại
                </button>
            </div>

            {/* Content */}
            <div className="detail-body">
                {/* Title Section */}
                <div className="detail-title-section">
                    <span className="detail-icon-large">
                        {getItemIcon(item)}
                    </span>
                    <h2 className="detail-title">{item.title}</h2>
                    <span className={`type-badge ${item.type.toLowerCase()}`}>
                        {item.type}
                    </span>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="detail-tags">
                        {tags.map((tag, i) => (
                            <span
                                key={i}
                                className="tag-badge"
                                style={{
                                    backgroundColor: tag.color + "20",
                                    color: tag.color,
                                    borderColor: tag.color + "40",
                                }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Meta Row */}
                {(item.category || item.project) && (
                    <div className="detail-meta-row">
                        {item.category && (
                            <span className="meta-chip">
                                📂 {item.category}
                            </span>
                        )}
                        {item.project && (
                            <span className="meta-chip">📋 {item.project}</span>
                        )}
                    </div>
                )}

                {/* Description */}
                {item.description && (
                    <div className="detail-section">
                        <div className="section-label">Mô tả</div>
                        <p className="section-content">{item.description}</p>
                    </div>
                )}

                {/* NOTE Content */}
                {item.type === "NOTE" && item.content && (
                    <div className="detail-section content-section">
                        <div className="section-header">
                            <span className="section-label">Nội dung</span>
                            <button
                                className="copy-btn"
                                onClick={handleCopyContent}
                            >
                                📋 Copy
                            </button>
                        </div>
                        <div className="content-box">
                            <pre>{item.content}</pre>
                        </div>
                    </div>
                )}

                {/* LINK URL */}
                {item.type === "LINK" && item.url && (
                    <div className="detail-section">
                        <div className="section-label">Liên kết</div>
                        <div className="link-box">
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleOpenItem();
                                }}
                            >
                                {item.url}
                            </a>
                        </div>
                    </div>
                )}

                {/* FILE Info */}
                {item.type === "FILE" && file && (
                    <div className="detail-section">
                        <div className="section-label">Tệp đính kèm</div>
                        <div className="file-box">
                            <div className="file-info-row">
                                <span className="file-name">
                                    {file.originalName}
                                </span>
                                {file.size && (
                                    <span className="file-size">
                                        {formatFileSize(file.size)}
                                    </span>
                                )}
                            </div>
                            {file.mimeType && (
                                <span className="file-mime">
                                    {file.mimeType}
                                </span>
                            )}
                        </div>
                        {file.mimeType?.startsWith("image/") && file.url && (
                            <div className="image-preview-container">
                                <img
                                    src={file.url}
                                    alt={item.title}
                                    className="image-preview"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Importance */}
                {item.importance && item.importance !== "MEDIUM" && (
                    <div className="detail-importance-row">
                        <span
                            className={`importance-chip ${item.importance.toLowerCase()}`}
                        >
                            {item.importance === "HIGH" && "⚠️ Quan trọng"}
                            {item.importance === "CRITICAL" &&
                                "🔴 Rất quan trọng"}
                            {item.importance === "LOW" && "Thấp"}
                        </span>
                    </div>
                )}

                {/* Timestamps */}
                <div className="detail-timestamps">
                    <span>📅 Tạo: {formatDate(item.createdAt)}</span>
                    {item.updatedAt !== item.createdAt && (
                        <span>✏️ Sửa: {formatDate(item.updatedAt)}</span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="detail-actions-bar">
                {fileUrl && (
                    <>
                        <button
                            className="action-btn primary"
                            onClick={handleOpenItem}
                        >
                            ↗️ Mở
                        </button>
                        <button className="action-btn" onClick={handleCopyLink}>
                            📋 Copy Link
                        </button>
                    </>
                )}
                {item.type === "NOTE" && item.content && !fileUrl && (
                    <button
                        className="action-btn primary"
                        onClick={handleCopyContent}
                    >
                        📋 Copy nội dung
                    </button>
                )}
                <button
                    className="action-btn danger"
                    onClick={() => onDelete(item.id)}
                >
                    🗑️ Xóa
                </button>
            </div>
        </div>
    );
}
