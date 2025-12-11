import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Mail, ArrowLeft, RefreshCw, Sparkles } from "lucide-react";
import { authApi } from "@/lib/api/endpoints/auth";
import OtpInput from "@/components/ui/OtpInput";
import toast from "react-hot-toast";

export default function VerifyOtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [canResend, setCanResend] = useState(true);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!email) {
            toast.error("Email not found. Please register again.");
            navigate("/register");
        }
    }, [email, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (otp.length !== 8) {
            toast.error("Please enter the complete 8-digit OTP");
            return;
        }

        setIsVerifying(true);
        try {
            const response = await authApi.verifyOtp({ email, otp });
            toast.success(
                response.data.message || "Email verified successfully!"
            );
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message || "Invalid or expired OTP");
            setOtp("");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResendOtp = async () => {
        if (!canResend) return;

        setIsResending(true);
        try {
            const response = await authApi.resendOtp({ email });
            toast.success(response.data.message || "OTP resent successfully!");
            setCanResend(false);
            setCountdown(60);
            setOtp("");
        } catch (error: any) {
            toast.error(error.message || "Failed to resend OTP");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-mesh relative overflow-hidden flex items-center justify-center px-4">
            {/* Animated floating shapes */}
            <div
                className="floating-shape w-72 h-72 bg-primary-500/30 top-10 left-10"
                style={{ animationDelay: "0s" }}
            />
            <div
                className="floating-shape w-80 h-80 bg-accent-500/20 bottom-10 right-10"
                style={{ animationDelay: "3s" }}
            />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md animate-slide-up">
                {/* Glass card */}
                <div className="glass rounded-2xl p-8 shadow-glass">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow">
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                            Verify your email
                        </h1>
                        <p className="text-neutral-600">
                            We sent an 8-digit code to
                        </p>
                        <p className="text-primary-600 font-semibold mt-1">
                            {email}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-4 text-center">
                                Enter verification code
                            </label>
                            <OtpInput
                                value={otp}
                                onChange={setOtp}
                                disabled={isVerifying}
                            />
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isVerifying || otp.length !== 8}
                            className="btn-glow w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isVerifying ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <span>Verify Email</span>
                            )}
                        </button>
                    </form>

                    {/* Resend */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-neutral-600 mb-3">
                            Didn't receive the code?
                        </p>
                        <button
                            onClick={handleResendOtp}
                            disabled={!canResend || isResending}
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${
                                    isResending ? "animate-spin" : ""
                                }`}
                            />
                            {canResend
                                ? "Resend OTP"
                                : `Resend in ${countdown}s`}
                        </button>
                    </div>

                    {/* Back link */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 text-sm transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to registration
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
