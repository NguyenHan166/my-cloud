import React, { useState, useEffect } from "react";
import {
    Search,
    Plus,
    X,
    Trash2,
    Loader2,
    ShieldCheck,
    Mail,
    MailX,
    UserCheck,
    UserX,
    RefreshCw,
    Edit3,
} from "lucide-react";
import { Button, Input, Badge, Avatar } from "@/components/common";
import * as usersApi from "@/api/usersApi";
import type { AdminUser, QueryUsersParams } from "@/api/usersApi";
import { UserEditModal } from "./UserEditModal";
import { UserCreateModal } from "./UserCreateModal";

export const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
    });
    const [filters, setFilters] = useState<{
        isActive?: boolean;
        isEmailVerified?: boolean;
    }>({});
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Fetch users
    const fetchUsers = async (params?: QueryUsersParams) => {
        setLoading(true);
        try {
            const response = await usersApi.getUsers({
                page: pagination.page,
                limit: pagination.limit,
                search: searchQuery || undefined,
                ...filters,
                ...params,
            });
            setUsers(response.users);
            setPagination(response.pagination);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers({ page: 1, search: searchQuery || undefined });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Toggle user status
    const handleToggleStatus = async (userId: string) => {
        setActionLoading(userId);
        try {
            const result = await usersApi.toggleUserStatus(userId);
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? result.user : u))
            );
        } catch (error) {
            console.error("Failed to toggle user status:", error);
        } finally {
            setActionLoading(null);
        }
    };

    // Delete user
    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Bạn có chắc muốn xóa vĩnh viễn user này?")) return;
        setActionLoading(userId);
        try {
            await usersApi.deleteUser(userId);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (error) {
            console.error("Failed to delete user:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">
                        Quản lý người dùng
                    </h1>
                    <p className="text-muted mt-1">
                        Quản lý tài khoản người dùng trong hệ thống
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm người dùng
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 max-w-md">
                    <Input
                        placeholder="Tìm kiếm theo email hoặc tên..."
                        leftIcon={<Search className="w-4 h-4" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={
                            filters.isActive === true ? "primary" : "secondary"
                        }
                        onClick={() =>
                            setFilters((prev) => ({
                                ...prev,
                                isActive:
                                    prev.isActive === true ? undefined : true,
                            }))
                        }
                    >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Hoạt động
                    </Button>
                    <Button
                        variant={
                            filters.isActive === false ? "primary" : "secondary"
                        }
                        onClick={() =>
                            setFilters((prev) => ({
                                ...prev,
                                isActive:
                                    prev.isActive === false ? undefined : false,
                            }))
                        }
                    >
                        <UserX className="w-4 h-4 mr-2" />
                        Đã khóa
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => fetchUsers({ page: 1 })}
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Apply filters */}
            {(filters.isActive !== undefined ||
                filters.isEmailVerified !== undefined) && (
                <Button
                    variant="secondary"
                    onClick={() => {
                        setFilters({});
                        fetchUsers({ page: 1 });
                    }}
                    className="text-sm"
                >
                    <X className="w-4 h-4 mr-1" />
                    Xóa bộ lọc
                </Button>
            )}

            {/* Table */}
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-muted">
                        Không tìm thấy người dùng nào
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                                        Người dùng
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                                        Ngày tạo
                                    </th>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-muted">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    name={
                                                        user.name || user.email
                                                    }
                                                    size="sm"
                                                />
                                                <div>
                                                    <p className="font-medium text-text">
                                                        {user.name || "—"}
                                                    </p>
                                                    <p className="text-sm text-muted">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant={
                                                    user.role === "ADMIN"
                                                        ? "info"
                                                        : "default"
                                                }
                                            >
                                                {user.role === "ADMIN" && (
                                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                                )}
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <Badge
                                                    variant={
                                                        user.isActive
                                                            ? "success"
                                                            : "error"
                                                    }
                                                >
                                                    {user.isActive
                                                        ? "Hoạt động"
                                                        : "Đã khóa"}
                                                </Badge>
                                                <span className="text-xs text-muted flex items-center gap-1">
                                                    {user.isEmailVerified ? (
                                                        <>
                                                            <Mail className="w-3 h-3" />{" "}
                                                            Đã xác thực
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MailX className="w-3 h-3" />{" "}
                                                            Chưa xác thực
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() =>
                                                        setEditingUser(user)
                                                    }
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={
                                                        user.isActive
                                                            ? "danger"
                                                            : "primary"
                                                    }
                                                    onClick={() =>
                                                        handleToggleStatus(
                                                            user.id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        user.id
                                                    }
                                                >
                                                    {actionLoading ===
                                                    user.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : user.isActive ? (
                                                        <>
                                                            <UserX className="w-4 h-4 mr-1" />
                                                            Khóa
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck className="w-4 h-4 mr-1" />
                                                            Mở
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() =>
                                                        handleDeleteUser(
                                                            user.id
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading ===
                                                        user.id
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <p className="text-sm text-muted">
                            Trang {pagination.page} / {pagination.totalPages} (
                            {pagination.total} người dùng)
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={pagination.page === 1}
                                onClick={() =>
                                    fetchUsers({ page: pagination.page - 1 })
                                }
                            >
                                Trước
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={
                                    pagination.page === pagination.totalPages
                                }
                                onClick={() =>
                                    fetchUsers({ page: pagination.page + 1 })
                                }
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Edit Modal */}
            <UserEditModal
                user={editingUser}
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                onSave={(updatedUser) => {
                    setUsers((prev) =>
                        prev.map((u) =>
                            u.id === updatedUser.id ? updatedUser : u
                        )
                    );
                }}
            />

            {/* User Create Modal */}
            <UserCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={(newUser) => {
                    setUsers((prev) => [newUser, ...prev]);
                    setPagination((prev) => ({
                        ...prev,
                        total: prev.total + 1,
                    }));
                }}
            />
        </div>
    );
};
