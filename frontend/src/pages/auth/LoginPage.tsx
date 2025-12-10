import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            await login({ email, password });
            toast.success("Welcome back!");
            navigate("/library");
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : "Login failed";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-card p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                            CloudHan
                        </h1>
                        <p className="text-neutral-600">
                            Sign in to your account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            leftIcon={<Mail className="w-5 h-5" />}
                            disabled={isLoading}
                        />

                        <Input
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            leftIcon={<Lock className="w-5 h-5" />}
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center text-sm">
                        <a
                            href="/forgot-password"
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Forgot password?
                        </a>
                        <span className="mx-2 text-neutral-400">·</span>
                        <a
                            href="/register"
                            className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Create account
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
