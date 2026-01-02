import { useState } from "react";
import { itemsApi } from "@/lib/api";

interface UploadTabProps {
    onUploadComplete: () => void;
}

export function UploadTab({ onUploadComplete }: UploadTabProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        await uploadFiles(files);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        await uploadFiles(files);
        e.target.value = "";
    };

    const uploadFiles = async (files: File[]) => {
        setUploading(true);
        setMessage("");

        try {
            let successCount = 0;
            for (const file of files) {
                const result = await itemsApi.createItem(
                    { type: "FILE", title: file.name },
                    [file]
                );
                if (result.error) {
                    setMessage(`❌ Error: ${result.error}`);
                    return;
                }
                successCount++;
            }
            setMessage(`✅ ${successCount} file(s) uploaded!`);
            onUploadComplete();
        } catch (err) {
            setMessage(
                `❌ Upload failed: ${
                    err instanceof Error ? err.message : "Unknown error"
                }`
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-tab">
            <div
                className={`drop-zone ${isDragging ? "dragging" : ""}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                {uploading ? (
                    <div className="uploading-state">
                        <div className="spinner small"></div>
                        <p>Uploading...</p>
                    </div>
                ) : (
                    <>
                        <p>📁 Drag files here</p>
                        <p className="or-text">or</p>
                        <label className="file-input-label">
                            Choose files
                            <input
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                hidden
                            />
                        </label>
                    </>
                )}
            </div>
            {message && (
                <p
                    className={`message ${
                        message.startsWith("❌") ? "error" : "success"
                    }`}
                >
                    {message}
                </p>
            )}

            <div className="quick-actions">
                <p className="hint">
                    💡 Right-click on images or links to save directly!
                </p>
            </div>
        </div>
    );
}
