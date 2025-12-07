import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button, Input } from "@/components/common";
import { useAuthStore } from "@/stores";

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Mật khẩu xác nhận không khớp",
        path: ["confirmPassword"],
    });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const resetPassword = useAuthStore((state) => state.resetPassword);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Get token from URL
    const token = searchParams.get("token");

    // Redirect if no token
    useEffect(() => {
        if (!token) {
            navigate("/auth/login");
        }
    }, [token, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await resetPassword(token, data.password);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate("/auth/login");
                }, 3000);
            } else {
                setError(result.error || "Đặt lại mật khẩu thất bại");
            }
        } catch (err) {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-text">
                    Link không hợp lệ
                </h1>
                <p className="text-muted mt-2">
                    Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                </p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-text">Thành công!</h1>
                <p className="text-muted mt-2">
                    Mật khẩu đã được đặt lại. Đang chuyển đến trang đăng nhập...
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-text">
                    Đặt lại mật khẩu
                </h1>
                <p className="text-muted mt-2">
                    Tạo mật khẩu mới cho tài khoản của bạn
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-text mb-1.5">
                        Mật khẩu mới
                    </label>
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            leftIcon={<Lock className="w-4 h-4" />}
                            {...register("password")}
                            className={errors.password ? "border-red-500" : ""}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text mb-1.5">
                        Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            leftIcon={<Lock className="w-4 h-4" />}
                            {...register("confirmPassword")}
                            className={
                                errors.confirmPassword ? "border-red-500" : ""
                            }
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Đang xử lý...
                        </>
                    ) : (
                        "Đặt lại mật khẩu"
                    )}
                </Button>
            </form>
        </div>
    );
};
