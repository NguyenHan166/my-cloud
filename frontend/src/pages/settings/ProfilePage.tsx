import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Camera,
    Mail,
    User,
    Phone,
    Shield,
    Calendar,
    ArrowLeft,
    Save,
    Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // TODO: Call API to update profile
            // await userApi.updateProfile({ name, phone })
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            await refreshUser();
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
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
                            Profile
                        </h1>
                        <p className="text-neutral-600">
                            Manage your personal information
                        </p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                    {/* Cover & Avatar */}
                    <div className="relative h-32 bg-gradient-to-r from-primary-500 to-purple-500">
                        <div className="absolute -bottom-12 left-6">
                            <div className="relative">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name || "User"}
                                        className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-3xl">
                                            {user?.name?.[0]?.toUpperCase() ||
                                                user?.email?.[0]?.toUpperCase() ||
                                                "U"}
                                        </span>
                                    </div>
                                )}
                                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-lg shadow-md hover:bg-neutral-50 transition-colors">
                                    <Camera className="w-4 h-4 text-neutral-600" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="pt-16 pb-6 px-6">
                        {/* Name & Role */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-neutral-900">
                                    {user?.name || "User"}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            user?.role === "ADMIN"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-neutral-100 text-neutral-600"
                                        }`}
                                    >
                                        {user?.role || "USER"}
                                    </span>
                                    {user?.isEmailVerified && (
                                        <span className="flex items-center gap-1 text-xs text-green-600">
                                            <Shield className="w-3 h-3" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                            </div>

                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Fields */}
                        <div className="space-y-4">
                            {/* Email (readonly) */}
                            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                                <div className="p-2 bg-white rounded-lg">
                                    <Mail className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-neutral-500 mb-0.5">
                                        Email
                                    </p>
                                    <p className="text-neutral-900 font-medium">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            {/* Name */}
                            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                                <div className="p-2 bg-white rounded-lg">
                                    <User className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-neutral-500 mb-0.5">
                                        Name
                                    </p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Enter your name"
                                        />
                                    ) : (
                                        <p className="text-neutral-900 font-medium">
                                            {user?.name || "Not set"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                                <div className="p-2 bg-white rounded-lg">
                                    <Phone className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-neutral-500 mb-0.5">
                                        Phone
                                    </p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(e.target.value)
                                            }
                                            className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Enter your phone number"
                                        />
                                    ) : (
                                        <p className="text-neutral-900 font-medium">
                                            {user?.phone || "Not set"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Created At */}
                            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                                <div className="p-2 bg-white rounded-lg">
                                    <Calendar className="w-5 h-5 text-neutral-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-neutral-500 mb-0.5">
                                        Member since
                                    </p>
                                    <p className="text-neutral-900 font-medium">
                                        {formatDate(user?.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 bg-white rounded-2xl border border-red-200 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-red-600 mb-2">
                            Danger Zone
                        </h3>
                        <p className="text-neutral-600 text-sm mb-4">
                            Once you delete your account, there is no going
                            back. Please be certain.
                        </p>
                        <button className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
