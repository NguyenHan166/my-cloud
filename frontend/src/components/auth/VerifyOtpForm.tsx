import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/common";
import { useAuthStore } from "@/stores";

export const VerifyOtpForm: React.FC = () => {
    const navigate = useNavigate();
    const { pendingEmail, verifyOtp, resendOtp, setPendingEmail } =
        useAuthStore();

    const [otp, setOtp] = useState(["", "", "", "", "", "", "", ""]); // 8 digits
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Redirect if no pending email
    useEffect(() => {
        if (!pendingEmail) {
            navigate("/auth/login");
        }
    }, [pendingEmail, navigate]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 7) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 8);
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        if (pastedData.length === 8) {
            inputRefs.current[7]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 8) {
            setError("Vui lòng nhập đủ 8 số");
            return;
        }

        if (!pendingEmail) {
            setError("Không tìm thấy email đăng ký");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await verifyOtp(pendingEmail, otpString);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate("/auth/login");
                }, 2000);
            } else {
                setError(result.error || "Xác thực thất bại");
            }
        } catch (err) {
            setError("Có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend || !pendingEmail) return;
        setCanResend(false);
        setCountdown(60);
        const result = await resendOtp(pendingEmail);
        if (!result.success) {
            setError(result.error || "Gửi lại OTP thất bại");
        }
    };

    const handleBack = () => {
        setPendingEmail(null);
        navigate("/auth/login");
    };

    // Success state
    if (success) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-text mb-2">
                    Xác thực thành công!
                </h1>
                <p className="text-muted">Đang chuyển đến trang đăng nhập...</p>
            </div>
        );
    }

    if (!pendingEmail) return null;

    return (
        <div>
            {/* Back button */}
            <button
                onClick={handleBack}
                className="flex items-center gap-2 text-muted hover:text-text mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Quay lại</span>
            </button>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-text">Xác thực Email</h1>
                <p className="text-muted mt-2">
                    Chúng tôi đã gửi mã OTP 8 số đến
                    <br />
                    <span className="font-medium text-text">
                        {pendingEmail}
                    </span>
                </p>
                <p className="text-xs text-orange-500 mt-2">
                    ⏱️ Mã OTP có hiệu lực trong 30 phút
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                                handleChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="w-10 h-12 text-center text-lg font-semibold border-2 border-border rounded-lg focus:border-primary focus:outline-none transition-colors"
                        />
                    ))}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || otp.join("").length !== 8}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Đang xác thực...
                        </>
                    ) : (
                        "Xác nhận"
                    )}
                </Button>
            </form>

            {/* Resend */}
            <p className="mt-6 text-center text-sm text-muted">
                Không nhận được mã?{" "}
                {canResend ? (
                    <button
                        onClick={handleResend}
                        className="text-primary font-medium hover:underline"
                    >
                        Gửi lại
                    </button>
                ) : (
                    <span>Gửi lại sau {countdown}s</span>
                )}
            </p>
        </div>
    );
};

// Export for backwards compatibility
export const VerifyEmailPage = VerifyOtpForm;
