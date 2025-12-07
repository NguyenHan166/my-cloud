import React, { useState } from "react";
import { Button, Input, Modal } from "@/components/common";
import * as usersApi from "@/api/usersApi";
import type { AdminUser } from "@/api/usersApi";

interface UserCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (newUser: AdminUser) => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
    isOpen,
    onClose,
    onCreate,
}) => {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        name: "",
        phone: "",
        role: "USER" as "ADMIN" | "USER",
        isEmailVerified: false,
        isActive: true,
    });

    // Reset form when modal closes
    const handleClose = () => {
        setFormData({
            email: "",
            password: "",
            name: "",
            phone: "",
            role: "USER",
            isEmailVerified: false,
            isActive: true,
        });
        setError(null);
        onClose();
    };

    // Handle save
    const handleCreate = async () => {
        // Validation
        if (!formData.email.trim()) {
            setError("Vui lòng nhập email");
            return;
        }
        if (!formData.password || formData.password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const newUser = await usersApi.createUser({
                email: formData.email.trim(),
                password: formData.password,
                name: formData.name.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                role: formData.role,
                isEmailVerified: formData.isEmailVerified,
                isActive: formData.isActive,
            });
            onCreate(newUser);
            handleClose();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Thêm người dùng mới"
            size="md"
        >
            {error && (
                <div className="mb-4 p-3 rounded-lg text-sm bg-red-100 text-red-700">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-text mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData((prev) => ({
                                ...prev,
                                email: e.target.value,
                            }))
                        }
                        placeholder="user@example.com"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-text mb-1">
                        Mật khẩu <span className="text-red-500">*</span>
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
                        placeholder="Ít nhất 6 ký tự"
                    />
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
                <Button variant="ghost" onClick={handleClose}>
                    Hủy
                </Button>
                <Button onClick={handleCreate} loading={saving}>
                    Tạo người dùng
                </Button>
            </div>
        </Modal>
    );
};
