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
            setTags([...tags, response.data.tag]);
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
                tags.map((t) => (t.id === editingTagId ? response.data.tag : t))
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
        <div className="min-h-full bg-neutral-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">
                            Settings
                        </h1>
                        <p className="text-neutral-600">
                            Manage your preferences
                        </p>
                    </div>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">
                    {/* Tags Section */}
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-neutral-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary-50 rounded-xl">
                                        <Tags className="w-5 h-5 text-primary-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-neutral-900">
                                            Tags
                                        </h2>
                                        <p className="text-sm text-neutral-500">
                                            Manage your tags for organizing
                                            items
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAddingTag(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Tag
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Add new tag form */}
                            {isAddingTag && (
                                <div className="mb-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                                    <div className="flex items-center gap-4 mb-4">
                                        <input
                                            type="text"
                                            value={newTagName}
                                            onChange={(e) =>
                                                setNewTagName(e.target.value)
                                            }
                                            placeholder="Enter tag name"
                                            className="flex-1 px-4 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            autoFocus
                                            disabled={isSavingTag}
                                        />
                                    </div>

                                    {/* Color picker */}
                                    <div className="mb-4">
                                        <p className="text-sm text-neutral-600 mb-2">
                                            Choose color
                                        </p>
                                        <div className="flex gap-2">
                                            {TAG_COLORS.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() =>
                                                        setNewTagColor(color)
                                                    }
                                                    disabled={isSavingTag}
                                                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                                                        newTagColor === color
                                                            ? "ring-2 ring-offset-2 ring-primary-500"
                                                            : ""
                                                    }`}
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-neutral-500">
                                                Preview:
                                            </span>
                                            <span
                                                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                                style={{
                                                    backgroundColor:
                                                        newTagColor,
                                                }}
                                            >
                                                #{newTagName || "tag"}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setIsAddingTag(false);
                                                    setNewTagName("");
                                                }}
                                                disabled={isSavingTag}
                                                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddTag}
                                                disabled={isSavingTag}
                                                className="px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isSavingTag && (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                )}
                                                Create Tag
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tags list */}
                            {isLoadingTags ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {tags.length === 0 ? (
                                        <div className="text-center py-8 text-neutral-500">
                                            <Tags className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                                            <p>
                                                No tags yet. Create your first
                                                tag!
                                            </p>
                                        </div>
                                    ) : (
                                        tags.map((tag) => (
                                            <div
                                                key={tag.id}
                                                className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                                            >
                                                {editingTagId === tag.id ? (
                                                    <>
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <input
                                                                type="text"
                                                                value={
                                                                    editingTagName
                                                                }
                                                                onChange={(e) =>
                                                                    setEditingTagName(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                disabled={
                                                                    isSavingTag
                                                                }
                                                                className="flex-1 max-w-[200px] px-3 py-1 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                            />
                                                            <div className="flex gap-1">
                                                                {TAG_COLORS.map(
                                                                    (color) => (
                                                                        <button
                                                                            key={
                                                                                color
                                                                            }
                                                                            onClick={() =>
                                                                                setEditingTagColor(
                                                                                    color
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                isSavingTag
                                                                            }
                                                                            className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                                                                                editingTagColor ===
                                                                                color
                                                                                    ? "ring-2 ring-offset-1 ring-primary-500"
                                                                                    : ""
                                                                            }`}
                                                                            style={{
                                                                                backgroundColor:
                                                                                    color,
                                                                            }}
                                                                        />
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() =>
                                                                    setEditingTagId(
                                                                        null
                                                                    )
                                                                }
                                                                disabled={
                                                                    isSavingTag
                                                                }
                                                                className="p-2 hover:bg-neutral-200 rounded-lg"
                                                            >
                                                                <X className="w-4 h-4 text-neutral-500" />
                                                            </button>
                                                            <button
                                                                onClick={
                                                                    handleSaveEdit
                                                                }
                                                                disabled={
                                                                    isSavingTag
                                                                }
                                                                className="p-2 hover:bg-green-100 rounded-lg"
                                                            >
                                                                {isSavingTag ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                                                                ) : (
                                                                    <Check className="w-4 h-4 text-green-600" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-4 h-4 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        tag.color ||
                                                                        TAG_COLORS[0],
                                                                }}
                                                            />
                                                            <span
                                                                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                                                style={{
                                                                    backgroundColor:
                                                                        tag.color ||
                                                                        TAG_COLORS[0],
                                                                }}
                                                            >
                                                                #{tag.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() =>
                                                                    handleEditTag(
                                                                        tag
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingTagId ===
                                                                    tag.id
                                                                }
                                                                className="p-2 hover:bg-neutral-200 rounded-lg disabled:opacity-50"
                                                            >
                                                                <Edit2 className="w-4 h-4 text-neutral-500" />
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
                                                                className="p-2 hover:bg-red-100 rounded-lg disabled:opacity-50"
                                                            >
                                                                {deletingTagId ===
                                                                tag.id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                                                ) : (
                                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50 rounded-xl">
                                    <Palette className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900">
                                        Appearance
                                    </h2>
                                    <p className="text-sm text-neutral-500">
                                        Customize the look and feel
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Moon className="w-5 h-5 text-neutral-500" />
                                        <span className="font-medium text-neutral-700">
                                            Dark Mode
                                        </span>
                                    </div>
                                    <button className="relative w-12 h-6 bg-neutral-200 rounded-full transition-colors">
                                        <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-5 h-5 text-neutral-500" />
                                        <span className="font-medium text-neutral-700">
                                            Language
                                        </span>
                                    </div>
                                    <select className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                                        <option value="en">English</option>
                                        <option value="vi">Tiếng Việt</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-50 rounded-xl">
                                    <Bell className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900">
                                        Notifications
                                    </h2>
                                    <p className="text-sm text-neutral-500">
                                        Manage notification preferences
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-neutral-700">
                                            Email notifications
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            Receive updates via email
                                        </p>
                                    </div>
                                    <button className="relative w-12 h-6 bg-primary-500 rounded-full transition-colors">
                                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-neutral-700">
                                            Push notifications
                                        </p>
                                        <p className="text-sm text-neutral-500">
                                            Receive browser notifications
                                        </p>
                                    </div>
                                    <button className="relative w-12 h-6 bg-neutral-200 rounded-full transition-colors">
                                        <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-50 rounded-xl">
                                    <Shield className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-neutral-900">
                                        Security
                                    </h2>
                                    <p className="text-sm text-neutral-500">
                                        Manage your account security
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="w-full flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-5 h-5 text-neutral-500" />
                                        <div className="text-left">
                                            <p className="font-medium text-neutral-700">
                                                Change password
                                            </p>
                                            <p className="text-sm text-neutral-500">
                                                Update your password
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowLeft className="w-5 h-5 text-neutral-400 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-up shadow-modal">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-neutral-900">
                                Change Password
                            </h2>
                            <button
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                                className="p-2 hover:bg-neutral-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-neutral-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">
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
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewPassword(!showNewPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="w-5 h-5 text-neutral-400" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-neutral-400" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-neutral-500">
                                    Minimum 6 characters
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">
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
                                        className={`w-full px-4 py-3 bg-neutral-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white pr-12 ${
                                            confirmPassword &&
                                            newPassword !== confirmPassword
                                                ? "border-red-500 focus:ring-red-500"
                                                : confirmPassword &&
                                                  newPassword ===
                                                      confirmPassword
                                                ? "border-green-500 focus:ring-green-500"
                                                : "border-neutral-200 focus:ring-primary-500"
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5 text-neutral-400" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-neutral-400" />
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
                                className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
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
