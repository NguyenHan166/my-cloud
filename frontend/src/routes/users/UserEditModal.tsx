import React, { useState, useEffect } from "react";
import { Button, Input, Modal } from "@/components/common";
import { Edit3 } from "lucide-react";
import * as usersApi from "@/api/usersApi";
import { uploadAvatarForUser } from "@/api/uploadApi";
import type { AdminUser } from "@/api/usersApi";

interface UserEditModalProps {
    user: AdminUser | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedUser: AdminUser) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
    user,
    isOpen,
    onClose,
    onSave,
}) => {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        avatar: "",
        password: "",
        role: "USER" as "ADMIN" | "USER",
        isEmailVerified: false,
        isActive: true,
    });

    // Sync form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                avatar: user.avatar || "",
                password: "",
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isActive: user.isActive,
            });
            setError(null);
        }
    }, [user]);

    // Handle avatar upload
    const handleAvatarChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            const result = await uploadAvatarForUser(user.id, file);
            setFormData((prev) => ({ ...prev, avatar: result.avatar }));
        } catch (error: any) {
            setError(error.message);
        }
    };

    // Handle save
    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setError(null);

        try {
            const updatedUser = await usersApi.updateUser(user.id, {
                name: formData.name || undefined,
                phone: formData.phone || undefined,
                password: formData.password || undefined,
                role: formData.role,
                isEmailVerified: formData.isEmailVerified,
                isActive: formData.isActive,
            });
            onSave(updatedUser);
            onClose();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (!user) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Chỉnh sửa: ${user.email}`}
            size="md"
        >
            {error && (
                <div className="mb-4 p-3 rounded-lg text-sm bg-red-100 text-red-700">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                            {formData.avatar ? (
                                <img
                                    src={formData.avatar}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                                    {(formData.name || user.email)
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer">
                            <Edit3 className="w-3 h-3 text-white" />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    </div>
                    <div>
                        <p className="font-medium text-text">Avatar</p>
                        <p className="text-xs text-muted">
                            Tối đa 5MB (JPEG, PNG, GIF, WEBP)
                        </p>
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-text mb-1">
                        Tên
                    </label>
                    <Input
                        value={formData.name}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                        placeholder="Nhập tên"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium text-text mb-1">
                        Số điện thoại
                    </label>
                    <Input
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                phone: e.target.value,
                            }))
                        }
                        placeholder="Nhập số điện thoại"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-text mb-1">
                        Mật khẩu mới (để trống nếu không đổi)
                    </label>
                    <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                password: e.target.value,
                            }))
                        }
                        placeholder="Nhập mật khẩu mới"
                    />
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-text mb-1">
                        Role
                    </label>
                    <select
                        value={formData.role}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                role: e.target.value as "ADMIN" | "USER",
                            }))
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isEmailVerified}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    isEmailVerified: e.target.checked,
                                }))
                            }
                            className="w-4 h-4 rounded text-primary"
                        />
                        <span className="text-sm text-text">
                            Đã xác thực email
                        </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    isActive: e.target.checked,
                                }))
                            }
                            className="w-4 h-4 rounded text-primary"
                        />
                        <span className="text-sm text-text">
                            Tài khoản hoạt động
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={onClose}>
                    Hủy
                </Button>
                <Button onClick={handleSave} loading={saving}>
                    Lưu thay đổi
                </Button>
            </div>
        </Modal>
    );
};
