import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import { authApi } from "@/lib/api/endpoints/auth";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.forgotPassword({ email });
            toast.success(response.data.message || "Password reset OTP sent!");
            navigate("/reset-password", { state: { email } });
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-mesh relative overflow-hidden flex items-center justify-center px-4">
            {/* Animated floating shapes */}
            <div
                className="floating-shape w-64 h-64 bg-primary-500/30 top-20 right-20"
                style={{ animationDelay: "1s" }}
            />
            <div
                className="floating-shape w-72 h-72 bg-accent-500/20 bottom-20 left-20"
                style={{ animationDelay: "3s" }}
            />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md animate-slide-up">
                {/* Glass card */}
                <div className="glass rounded-2xl p-8 shadow-glass">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow">
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                            Forgot password?
                        </h1>
                        <p className="text-neutral-600">
                            No worries, we'll send you reset instructions
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">
                                Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-glow w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <span>Send Reset OTP</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
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
