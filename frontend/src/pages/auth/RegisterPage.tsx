import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { authApi } from "@/lib/api/endpoints/auth";
import toast from "react-hot-toast";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.register({
                email,
                password,
                name: name || undefined,
            });
            toast.success(response.data.message || "Registration successful!");
            navigate("/verify-otp", { state: { email } });
        } catch (error: any) {
            toast.error(error.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-mesh relative overflow-hidden flex items-center justify-center px-4">
            {/* Animated floating shapes */}
            <div
                className="floating-shape w-72 h-72 bg-accent-500/30 top-0 right-0"
                style={{ animationDelay: "0s" }}
            />
            <div
                className="floating-shape w-96 h-96 bg-primary-500/20 bottom-0 left-0"
                style={{ animationDelay: "2s" }}
            />
            <div
                className="floating-shape w-64 h-64 bg-accent-400/25 bottom-1/4 right-1/3"
                style={{ animationDelay: "4s" }}
            />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md animate-slide-up">
                {/* Glass card */}
                <div className="glass rounded-2xl p-8 shadow-glass">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6 shadow-glow">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                            Create account
                        </h1>
                        <p className="text-neutral-600">Join CloudHan today</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">
                                Email <span className="text-red-500">*</span>
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

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">
                                Name{" "}
                                <span className="text-neutral-400">
                                    (optional)
                                </span>
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full pl-12 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
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

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-glow w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-neutral-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
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
