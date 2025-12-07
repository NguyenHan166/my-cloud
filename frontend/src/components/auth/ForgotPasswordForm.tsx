import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button, Input } from "@/components/common";
import { useAuthStore } from "@/stores";

const forgotPasswordSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm: React.FC = () => {
    const forgotPassword = useAuthStore((state) => state.forgotPassword);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [submittedEmail, setSubmittedEmail] = useState<string>("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const result = await forgotPassword(data.email);
            if (result.success) {
                setSubmittedEmail(data.email);
                setSuccessMessage(
                    result.message ||
                        "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu."
                );
            } else {
                setError(result.error || "Gửi yêu cầu thất bại");
            }
        } catch (err) {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    // Show success state
    if (successMessage) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-text mb-2">
                    Email đã được gửi!
                </h1>
                <p className="text-muted mb-6">{successMessage}</p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm mb-6">
                    📧 Vui lòng kiểm tra hộp thư{" "}
                    <span className="font-medium">{submittedEmail}</span> và
                    click vào link đặt lại mật khẩu.
                </div>
                <Link to="/auth/login">
                    <Button variant="secondary" className="w-full">
                        Quay lại đăng nhập
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Back button */}
            <Link
                to="/auth/login"
                className="flex items-center gap-2 text-muted hover:text-text mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Quay lại đăng nhập</span>
            </Link>

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-text">Quên mật khẩu?</h1>
                <p className="text-muted mt-2">
                    Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
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
                        Email
                    </label>
                    <Input
                        type="email"
                        placeholder="email@example.com"
                        leftIcon={<Mail className="w-4 h-4" />}
                        {...register("email")}
                        className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Đang gửi...
                        </>
                    ) : (
                        "Gửi link đặt lại mật khẩu"
                    )}
                </Button>
            </form>

            {/* Register link */}
            <p className="mt-6 text-center text-sm text-muted">
                Nhớ mật khẩu rồi?{" "}
                <Link
                    to="/auth/login"
                    className="text-primary font-medium hover:underline"
                >
                    Đăng nhập
                </Link>
            </p>
        </div>
    );
};
