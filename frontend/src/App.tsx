import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Public pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Protected pages
import LibraryPage from "./pages/library/LibraryPage";
import LinksPage from "./pages/links/LinksPage";
import NotesPage from "./pages/notes/NotesPage";
import ProfilePage from "./pages/settings/ProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        {/* Public routes (no layout) */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/verify-otp" element={<VerifyOtpPage />} />
                        <Route
                            path="/forgot-password"
                            element={<ForgotPasswordPage />}
                        />
                        <Route
                            path="/reset-password"
                            element={<ResetPasswordPage />}
                        />

                        {/* Protected routes (with AppLayout) */}
                        <Route
                            path="/library"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <LibraryPage />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/collections"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <div className="container mx-auto px-4 py-8">
                                            <h1 className="text-3xl font-bold">
                                                Collections
                                            </h1>
                                            <p className="text-neutral-600 mt-2">
                                                Coming soon...
                                            </p>
                                        </div>
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/links"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <LinksPage />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/notes"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <NotesPage />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/shared-links"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <div className="container mx-auto px-4 py-8">
                                            <h1 className="text-3xl font-bold">
                                                Shared Links
                                            </h1>
                                            <p className="text-neutral-600 mt-2">
                                                Coming soon...
                                            </p>
                                        </div>
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/trash"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <div className="container mx-auto px-4 py-8">
                                            <h1 className="text-3xl font-bold">
                                                Trash
                                            </h1>
                                            <p className="text-neutral-600 mt-2">
                                                Coming soon...
                                            </p>
                                        </div>
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <ProfilePage />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <AppLayout>
                                        <SettingsPage />
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Default redirect */}
                        <Route
                            path="/"
                            element={<Navigate to="/library" replace />}
                        />
                        <Route
                            path="*"
                            element={<Navigate to="/library" replace />}
                        />
                    </Routes>

                    {/* Toast notifications */}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: "#fff",
                                color: "#171717",
                                boxShadow:
                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
                            },
                            success: {
                                iconTheme: {
                                    primary: "#0ea5e9",
                                    secondary: "#fff",
                                },
                            },
                        }}
                    />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
