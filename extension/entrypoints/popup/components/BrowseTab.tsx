import { useState, useEffect } from "react";
import { itemsApi } from "@/lib/api";
import type { Item } from "@/lib/types";
import { ItemDetail } from "./ItemDetail";
import { CreateItemForm } from "./CreateItemForm";

export function BrowseTab() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        loadRecentItems();
    }, []);

    const loadRecentItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await itemsApi.getRecentItems(8);
            console.log("[BrowseTab] Response:", response);

            if (response.data?.data) {
                const responseData = response.data.data as unknown as {
                    data?: Item[];
                    items?: Item[];
                };
                const itemsArray =
                    responseData.data || responseData.items || [];
                console.log("[BrowseTab] Items found:", itemsArray.length);
                setItems(itemsArray);
            } else if (response.error) {
                setError(response.error);
            }
        } catch (err) {
            console.error("[BrowseTab] Error:", err);
            setError("Failed to load items");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const result = await itemsApi.deleteItem(id);
        if (!result.error) {
            setItems(items.filter((item) => item.id !== id));
            if (selectedItem?.id === id) {
                setSelectedItem(null);
            }
        }
    };

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
        loadRecentItems();
    };

    const getItemIcon = (item: Item): string => {
        switch (item.type) {
            case "LINK":
                return "🔗";
            case "NOTE":
                return "📝";
            case "FOLDER":
                return "📁";
            case "FILE":
                const fileInfo = item.files?.[0] as unknown as {
                    file?: { mimeType?: string };
                    mimeType?: string;
                };
                const mimeType =
                    fileInfo?.file?.mimeType || fileInfo?.mimeType || "";
                if (mimeType.startsWith("image/")) return "🖼️";
                if (mimeType.startsWith("video/")) return "🎬";
                if (mimeType.startsWith("audio/")) return "🎵";
                if (mimeType.includes("pdf")) return "📄";
                if (mimeType.includes("zip") || mimeType.includes("rar"))
                    return "📦";
                return "📎";
            default:
                return "📄";
        }
    };

    if (loading) {
        return (
            <div className="browse-tab loading-state">
                <div className="spinner small"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="browse-tab">
                <p className="error">{error}</p>
                <button className="retry-btn" onClick={loadRecentItems}>
                    Retry
                </button>
            </div>
        );
    }

    // Show create form
    if (showCreateForm) {
        return (
            <CreateItemForm
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateForm(false)}
            />
        );
    }

    // Show item detail view
    if (selectedItem) {
        return (
            <ItemDetail
                item={selectedItem}
                onBack={() => setSelectedItem(null)}
                onDelete={handleDelete}
                getItemIcon={getItemIcon}
            />
        );
    }

    return (
        <div className="browse-tab">
            <div className="browse-header">
                <span>Items gần đây</span>
                <div className="header-actions">
                    <button
                        className="create-btn"
                        onClick={() => setShowCreateForm(true)}
                        title="Tạo mới"
                    >
                        ➕
                    </button>
                    <button
                        className="refresh-btn"
                        onClick={loadRecentItems}
                        title="Làm mới"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="empty-state-container">
                    <p className="empty-state">Chưa có item nào</p>
                    <button
                        className="create-first-btn"
                        onClick={() => setShowCreateForm(true)}
                    >
                        ➕ Tạo item đầu tiên
                    </button>
                </div>
            ) : (
                <div className="items-list">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="item-row clickable"
                            onClick={() => setSelectedItem(item)}
                        >
                            <span className="item-icon">
                                {getItemIcon(item)}
                            </span>
                            <span className="item-title" title={item.title}>
                                {item.title}
                            </span>
                            <span className="item-arrow">›</span>
                        </div>
                    ))}
                </div>
            )}

            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    browser.tabs.create({
                        url: "https://cloudhan.nguyenvanhan.io.vn",
                    });
                }}
                className="open-app-link"
            >
                Mở PersonalCloud Web →
            </a>
        </div>
    );
}
