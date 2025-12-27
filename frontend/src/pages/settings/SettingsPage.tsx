import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Tags,
    Plus,
    X,
    Edit2,
    Trash2,
    Check,
    Palette,
    Bell,
    Moon,
    Globe,
    Shield,
    Loader2,
    Lock,
    Eye,
    EyeOff,
} from "lucide-react";
import { tagsApi, type Tag } from "@/lib/api/endpoints/tags";
import { usersApi } from "@/lib/api/endpoints/users";
import { useTheme } from "@/contexts/ThemeContext";
import toast from "react-hot-toast";

const TAG_COLORS = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#6b7280", // gray
];

export default function SettingsPage() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    // Tags state
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(true);
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [isSavingTag, setIsSavingTag] = useState(false);
    const [editingTagId, setEditingTagId] = useState<string | null>(null);
    const [editingTagName, setEditingTagName] = useState("");
    const [editingTagColor, setEditingTagColor] = useState("");
    const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

    // Change password state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Load tags on mount
    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            setIsLoadingTags(true);
            const response = await tagsApi.getAll();
            setTags(response.data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load tags");
        } finally {
            setIsLoadingTags(false);
        }
    };

    const handleAddTag = async () => {
        if (!newTagName.trim()) {
            toast.error("Please enter a tag name");
            return;
        }

        if (
            tags.some((t) => t.name.toLowerCase() === newTagName.toLowerCase())
        ) {
            toast.error("Tag already exists");
            return;
        }

        setIsSavingTag(true);
        try {
            const response = await tagsApi.create({
                name: newTagName.trim().toLowerCase(),
                color: newTagColor,
            });
            setTags([...tags, response.data.data]);
            setNewTagName("");
            setNewTagColor(TAG_COLORS[0]);
            setIsAddingTag(false);
            toast.success(response.data.message || "Tag created successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to create tag");
        } finally {
            setIsSavingTag(false);
        }
    };

    const handleEditTag = (tag: Tag) => {
        setEditingTagId(tag.id);
        setEditingTagName(tag.name);
        setEditingTagColor(tag.color || TAG_COLORS[0]);
    };

    const handleSaveEdit = async () => {
        if (!editingTagName.trim()) {
            toast.error("Please enter a tag name");
            return;
        }

        if (!editingTagId) return;

        setIsSavingTag(true);
        try {
            const response = await tagsApi.update(editingTagId, {
                name: editingTagName.trim().toLowerCase(),
                color: editingTagColor,
            });
            setTags(
                tags.map((t) =>
                    t.id === editingTagId ? response.data.data : t
                )
            );
            setEditingTagId(null);
            toast.success(response.data.message || "Tag updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update tag");
        } finally {
            setIsSavingTag(false);
        }
    };

    const handleDeleteTag = async (tagId: string) => {
        if (!confirm("Are you sure you want to delete this tag?")) return;

        setDeletingTagId(tagId);
        try {
            const response = await tagsApi.delete(tagId);
            setTags(tags.filter((t) => t.id !== tagId));
            toast.success(response.data.message || "Tag deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete tag");
        } finally {
            setDeletingTagId(null);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword) {
            toast.error("Please enter a new password");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsChangingPassword(true);
        try {
            const response = await usersApi.changePassword(newPassword);
            toast.success(
                response.data.message || "Password changed successfully"
            );
            setShowPasswordModal(false);
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            toast.error(error.message || "Failed to change password");
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="min-h-full bg-neutral-50 dark:bg-neutral-900 py-4 sm:py-8">
            <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 sm:mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 sm:p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg sm:rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 dark:text-neutral-300" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            Settings
                        </h1>
                        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                            Manage your preferences
                        </p>
                    </div>
                </div>

                {/* Settings Sections */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Tags Section */}
                    <div className="bg-white dark:bg-neutral-800 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm">
                        <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg sm:rounded-xl">
                                        <Tags className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 dark:text-primary-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                            Tags
                                        </h2>
                                        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                                            {tags.length} tags
                                        </p>
                                    </div>
                                </div>
                                {!isAddingTag && (
                                    <button
                                        onClick={() => setIsAddingTag(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-500 text-white rounded-lg sm:rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm"
                                    >
                                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span className="hidden xs:inline">
                                            New
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            {/* Add new tag form - Inline compact */}
                            {isAddingTag && (
                                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg sm:rounded-xl border border-primary-200 dark:border-primary-800">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <div className="flex-1 space-y-2 sm:space-y-3">
                                            <input
                                                type="text"
                                                value={newTagName}
                                                onChange={(e) =>
                                                    setNewTagName(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyPress={(e) => {
                                                    if (
                                                        e.key === "Enter" &&
                                                        !isSavingTag
                                                    ) {
                                                        handleAddTag();
                                                    }
                                                }}
                                                placeholder="Tag name"
                                                className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                                                autoFocus
                                                disabled={isSavingTag}
                                            />
                                            <div className="flex gap-1 sm:gap-1.5 flex-wrap">
                                                {TAG_COLORS.map((color) => (
                                                    <button
                                                        key={color}
                                                        onClick={() =>
                                                            setNewTagColor(
                                                                color
                                                            )
                                                        }
                                                        disabled={isSavingTag}
                                                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg transition-all ${
                                                            newTagColor ===
                                                            color
                                                                ? "ring-2 ring-offset-1 sm:ring-offset-2 dark:ring-offset-neutral-800 ring-primary-500 scale-110"
                                                                : "hover:scale-105 opacity-70 hover:opacity-100"
                                                        }`}
                                                        style={{
                                                            backgroundColor:
                                                                color,
                                                        }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5 sm:gap-2">
                                            <button
                                                onClick={handleAddTag}
                                                disabled={
                                                    isSavingTag ||
                                                    !newTagName.trim()
                                                }
                                                className="p-1.5 sm:p-2 bg-primary-500 text-white rounded-md sm:rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Create"
                                            >
                                                {isSavingTag ? (
                                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsAddingTag(false);
                                                    setNewTagName("");
                                                    setNewTagColor(
                                                        TAG_COLORS[0]
                                                    );
                                                }}
                                                disabled={isSavingTag}
                                                className="p-1.5 sm:p-2 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-md sm:rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                                                title="Cancel"
                                            >
                                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    {newTagName && (
                                        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-primary-200 dark:border-primary-800/50 flex items-center gap-1.5 sm:gap-2">
                                            <span className="text-[10px] sm:text-xs text-neutral-600 dark:text-neutral-400">
                                                Preview:
                                            </span>
                                            <span
                                                className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-white shadow-sm"
                                                style={{
                                                    backgroundColor:
                                                        newTagColor,
                                                }}
                                            >
                                                #{newTagName}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tags list - Grid layout */}
                            {isLoadingTags ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                                </div>
                            ) : tags.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                                    <Tags className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-600" />
                                    <p className="font-medium">No tags yet</p>
                                    <p className="text-sm mt-1">
                                        Create your first tag to organize items
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                    {tags.map((tag) => (
                                        <div
                                            key={tag.id}
                                            className="group relative bg-neutral-50 dark:bg-neutral-700/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 hover:shadow-md transition-all border border-neutral-200 dark:border-neutral-600"
                                        >
                                            {editingTagId === tag.id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editingTagName}
                                                        onChange={(e) =>
                                                            setEditingTagName(
                                                                e.target.value
                                                            )
                                                        }
                                                        onKeyPress={(e) => {
                                                            if (
                                                                e.key ===
                                                                    "Enter" &&
                                                                !isSavingTag
                                                            ) {
                                                                handleSaveEdit();
                                                            } else if (
                                                                e.key ===
                                                                "Escape"
                                                            ) {
                                                                setEditingTagId(
                                                                    null
                                                                );
                                                            }
                                                        }}
                                                        disabled={isSavingTag}
                                                        className="w-full px-2 py-1.5 text-sm bg-white dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-100"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-1 flex-wrap">
                                                        {TAG_COLORS.map(
                                                            (color) => (
                                                                <button
                                                                    key={color}
                                                                    onClick={() =>
                                                                        setEditingTagColor(
                                                                            color
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isSavingTag
                                                                    }
                                                                    className={`w-6 h-6 rounded-md transition-all ${
                                                                        editingTagColor ===
                                                                        color
                                                                            ? "ring-2 ring-offset-1 dark:ring-offset-neutral-700 ring-primary-500 scale-110"
                                                                            : "hover:scale-105 opacity-60 hover:opacity-100"
                                                                    }`}
                                                                    style={{
                                                                        backgroundColor:
                                                                            color,
                                                                    }}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1.5 pt-1">
                                                        <button
                                                            onClick={
                                                                handleSaveEdit
                                                            }
                                                            disabled={
                                                                isSavingTag
                                                            }
                                                            className="flex-1 px-2 py-1.5 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
                                                        >
                                                            {isSavingTag
                                                                ? "Saving..."
                                                                : "Save"}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setEditingTagId(
                                                                    null
                                                                )
                                                            }
                                                            disabled={
                                                                isSavingTag
                                                            }
                                                            className="px-2 py-1.5 text-xs bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-500 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                                        <span
                                                            className="inline-flex px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium text-white shadow-sm truncate max-w-[120px] sm:max-w-none"
                                                            style={{
                                                                backgroundColor:
                                                                    tag.color ||
                                                                    TAG_COLORS[0],
                                                            }}
                                                        >
                                                            #{tag.name}
                                                        </span>
                                                        <div className="flex gap-0.5 sm:gap-1">
                                                            <button
                                                                onClick={() =>
                                                                    handleEditTag(
                                                                        tag
                                                                    )
                                                                }
                                                                className="p-1 sm:p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-600 dark:text-neutral-400" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteTag(
                                                                        tag.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingTagId ===
                                                                    tag.id
                                                                }
                                                                className="p-1 sm:p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                {deletingTagId ===
                                                                tag.id ? (
                                                                    <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin text-red-600 dark:text-red-400" />
                                                                ) : (
                                                                    <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600 dark:text-red-400" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                                                        <div
                                                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm flex-shrink-0"
                                                            style={{
                                                                backgroundColor:
                                                                    tag.color ||
                                                                    TAG_COLORS[0],
                                                            }}
                                                        />
                                                        <span className="truncate">
                                                            Color
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                                    <Palette className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                        Appearance
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Customize the look and feel
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Moon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                                        <span className="font-medium text-neutral-700 dark:text-neutral-200">
                                            Dark Mode
                                        </span>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${
                                            theme === "dark"
                                                ? "bg-primary-500"
                                                : "bg-neutral-200 dark:bg-neutral-600"
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                                theme === "dark"
                                                    ? "right-1"
                                                    : "left-1"
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                                        <span className="font-medium text-neutral-700 dark:text-neutral-200">
                                            Language
                                        </span>
                                    </div>
                                    <select className="px-3 py-1.5 bg-white dark:bg-neutral-600 border border-neutral-200 dark:border-neutral-500 rounded-lg text-neutral-700 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                        <option value="en">English</option>
                                        <option value="vi">Tiếng Việt</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-xl">
                                    <Bell className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                        Notifications
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Manage notification preferences
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
                                    <div>
                                        <p className="font-medium text-neutral-700 dark:text-neutral-200">
                                            Email notifications
                                        </p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Receive updates via email
                                        </p>
                                    </div>
                                    <button className="relative w-12 h-6 bg-primary-500 rounded-full transition-colors">
                                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl">
                                    <div>
                                        <p className="font-medium text-neutral-700 dark:text-neutral-200">
                                            Push notifications
                                        </p>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            Receive browser notifications
                                        </p>
                                    </div>
                                    <button className="relative w-12 h-6 bg-neutral-200 dark:bg-neutral-600 rounded-full transition-colors">
                                        <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl">
                                    <Shield className="w-5 h-5 text-green-500 dark:text-green-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                                        Security
                                    </h2>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Manage your account security
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                                        <div className="text-left">
                                            <p className="font-medium text-neutral-700 dark:text-neutral-200">
                                                Change password
                                            </p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                Update your password
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowLeft className="w-5 h-5 text-neutral-400 dark:text-neutral-500 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-up shadow-modal">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                                Change Password
                            </h2>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
                            >
                                <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showNewPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        placeholder="Enter new password"
                                        disabled={isChangingPassword}
                                        className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-neutral-600 text-neutral-900 dark:text-neutral-100 pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewPassword(!showNewPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Minimum 6 characters
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Confirm new password"
                                        disabled={isChangingPassword}
                                        className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-700 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-neutral-600 text-neutral-900 dark:text-neutral-100 pr-12 ${
                                            confirmPassword &&
                                            newPassword !== confirmPassword
                                                ? "border-red-500 focus:ring-red-500"
                                                : confirmPassword &&
                                                    newPassword ===
                                                        confirmPassword
                                                  ? "border-green-500 focus:ring-green-500"
                                                  : "border-neutral-200 dark:border-neutral-600 focus:ring-primary-500"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                                        )}
                                    </button>
                                </div>
                                {confirmPassword &&
                                    newPassword !== confirmPassword && (
                                        <p className="text-xs text-red-500">
                                            Passwords do not match
                                        </p>
                                    )}
                                {confirmPassword &&
                                    newPassword === confirmPassword && (
                                        <p className="text-xs text-green-500">
                                            Passwords match ✓
                                        </p>
                                    )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                                disabled={isChangingPassword}
                                className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-xl font-medium hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={
                                    isChangingPassword ||
                                    !newPassword ||
                                    newPassword !== confirmPassword
                                }
                                className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isChangingPassword && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
