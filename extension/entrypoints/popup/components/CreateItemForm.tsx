import { useState } from "react";
import { itemsApi } from "@/lib/api";
import type { CreateItemDto, ItemType, ImportanceLevel } from "@/lib/types";
import { TagSelector } from "./TagSelector";

interface CreateItemFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function CreateItemForm({ onSuccess, onCancel }: CreateItemFormProps) {
    const [type, setType] = useState<ItemType>("NOTE");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [project, setProject] = useState("");
    const [importance, setImportance] = useState<ImportanceLevel>("MEDIUM");
    const [files, setFiles] = useState<File[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        setFiles(selectedFiles);
        // Auto-fill title from filename if empty
        if (!title && selectedFiles.length > 0) {
            setTitle(selectedFiles[0].name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!title.trim()) {
            setError("Tiêu đề là bắt buộc");
            return;
        }

        if (type === "LINK" && !url.trim()) {
            setError("URL là bắt buộc cho loại Link");
            return;
        }

        if (type === "NOTE" && !content.trim()) {
            setError("Nội dung là bắt buộc cho loại Note");
            return;
        }

        if (type === "FILE" && files.length === 0) {
            setError("Vui lòng chọn file");
            return;
        }

        setIsSubmitting(true);

        try {
            const itemData: CreateItemDto = {
                type,
                title: title.trim(),
                description: description.trim() || undefined,
                category: category.trim() || undefined,
                project: project.trim() || undefined,
                importance: importance !== "MEDIUM" ? importance : undefined,
                url: type === "LINK" ? url.trim() : undefined,
                content: type === "NOTE" ? content : undefined,
                tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
            };

            const result = await itemsApi.createItem(
                itemData,
                type === "FILE" ? files : undefined
            );

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Lỗi không xác định");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-item-form">
            <div className="form-header">
                <h3>Tạo Item Mới</h3>
                <button className="close-btn" onClick={onCancel}>
                    ✕
                </button>
            </div>

            {/* Type Tabs */}
            <div className="type-tabs">
                <button
                    type="button"
                    className={type === "NOTE" ? "active" : ""}
                    onClick={() => setType("NOTE")}
                >
                    📝 Note
                </button>
                <button
                    type="button"
                    className={type === "LINK" ? "active" : ""}
                    onClick={() => setType("LINK")}
                >
                    🔗 Link
                </button>
                <button
                    type="button"
                    className={type === "FILE" ? "active" : ""}
                    onClick={() => setType("FILE")}
                >
                    📎 File
                </button>
            </div>

            <form onSubmit={handleSubmit} className="form-body">
                {/* Title */}
                <div className="form-field">
                    <label>
                        Tiêu đề <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Nhập tiêu đề..."
                    />
                </div>

                {/* Type-specific fields */}
                {type === "LINK" && (
                    <div className="form-field">
                        <label>
                            URL <span className="required">*</span>
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>
                )}

                {type === "NOTE" && (
                    <div className="form-field">
                        <label>
                            Nội dung <span className="required">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Nhập nội dung..."
                            rows={5}
                        />
                    </div>
                )}

                {type === "FILE" && (
                    <div className="form-field">
                        <label>
                            File <span className="required">*</span>
                        </label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                id="file-input"
                            />
                            <label htmlFor="file-input" className="file-label">
                                {files.length > 0
                                    ? `${files.length} file đã chọn`
                                    : "📁 Chọn file..."}
                            </label>
                        </div>
                        {files.length > 0 && (
                            <div className="selected-files">
                                {files.map((file, i) => (
                                    <span key={i} className="file-chip">
                                        {file.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Description */}
                <div className="form-field">
                    <label>Mô tả</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Mô tả ngắn (tùy chọn)"
                    />
                </div>

                {/* Category & Project */}
                <div className="form-row">
                    <div className="form-field half">
                        <label>Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Phân loại"
                        />
                    </div>
                    <div className="form-field half">
                        <label>Project</label>
                        <input
                            type="text"
                            value={project}
                            onChange={(e) => setProject(e.target.value)}
                            placeholder="Dự án"
                        />
                    </div>
                </div>

                {/* Importance */}
                <div className="form-field">
                    <label>Mức độ quan trọng</label>
                    <select
                        value={importance}
                        onChange={(e) =>
                            setImportance(e.target.value as ImportanceLevel)
                        }
                    >
                        <option value="LOW">🟢 Thấp</option>
                        <option value="MEDIUM">🟡 Trung bình</option>
                        <option value="HIGH">🟠 Cao</option>
                        <option value="URGENT">🔴 Khẩn cấp</option>
                    </select>
                </div>

                {/* Tags */}
                <div className="form-field">
                    <label>Tags</label>
                    <TagSelector
                        selectedTagIds={selectedTagIds}
                        onTagsChange={setSelectedTagIds}
                    />
                </div>

                {/* Error */}
                {error && <p className="form-error">{error}</p>}

                {/* Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="btn-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Đang tạo..." : "Tạo Item"}
                    </button>
                </div>
            </form>
        </div>
    );
}
