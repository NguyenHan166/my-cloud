import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, ArrowLeft, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api/endpoints/auth";
import OtpInput from "@/components/ui/OtpInput";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            toast.error("Please request password reset first");
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 8) {
            toast.error("Please enter the complete 8-digit OTP");
            return;
        }

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

        setIsLoading(true);
        try {
            const response = await authApi.resetPassword({
                token: otp,
                newPassword,
            });
            toast.success(
                response.data.message || "Password reset successfully!"
            );
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message || "Failed to reset password");
            setOtp("");
        } finally {
            setIsLoading(false);
        }
    };

    const passwordsMatch = confirmPassword && newPassword === confirmPassword;
    const passwordsDontMatch =
        confirmPassword && newPassword !== confirmPassword;

    return (
        <div className="min-h-screen bg-gradient-mesh relative overflow-hidden flex items-center justify-center px-4 py-8">
            {/* Animated floating shapes */}
            <div
                className="floating-shape w-72 h-72 bg-primary-500/30 top-0 left-10"
                style={{ animationDelay: "0s" }}
            />
            <div
                className="floating-shape w-80 h-80 bg-accent-500/20 bottom-0 right-10"
                style={{ animationDelay: "2s" }}
            />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md animate-slide-up">
                {/* Glass card */}
                <div className="glass rounded-2xl p-8 shadow-glass">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                            Reset password
                        </h1>
                        <p className="text-neutral-600">
                            Enter the OTP sent to
                        </p>
                        <p className="text-primary-600 font-semibold mt-1">
                            {email}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* OTP */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-4 text-center">
                                Enter verification code
                            </label>
                            <OtpInput
                                value={otp}
                                onChange={setOtp}
                                disabled={isLoading}
                            />
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">
                                New Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300"
                                    required
                                />
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
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    disabled={isLoading}
                                    className={`w-full pl-12 pr-4 py-3.5 bg-neutral-50 border rounded-xl text-neutral-900 placeholder-neutral-400
                           focus:outline-none focus:ring-2 focus:border-transparent focus:bg-white
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300 ${
                               passwordsDontMatch
                                   ? "border-red-500 focus:ring-red-500"
                                   : passwordsMatch
                                   ? "border-green-500 focus:ring-green-500"
                                   : "border-neutral-200 focus:ring-primary-500"
                           }`}
                                    required
                                />
                            </div>
                            {passwordsDontMatch && (
                                <p className="text-xs text-red-500">
                                    Passwords do not match
                                </p>
                            )}
                            {passwordsMatch && (
                                <p className="text-xs text-green-500">
                                    Passwords match ✓
                                </p>
                            )}
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading || otp.length !== 8}
                            className="btn-glow w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Resetting...</span>
                                </>
                            ) : (
                                <span>Reset Password</span>
                            )}
                        </button>
                    </form>

                    {/* Back link */}
                    <div className="mt-8 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 text-sm transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to sign in
                        </Link>
                    </div>
                </div>

                {/* Brand */}
                <p className="text-center mt-6 text-white/60 text-sm">
                    CloudHan — Your Personal Cloud Storage
                </p>
            </div>
        </div>
    );
}
