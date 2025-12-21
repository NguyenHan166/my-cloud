import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Public pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import VerifyOtpPage from "./pages/auth/VerifyOtpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import SharedLinkPage from "./pages/shared/SharedLinkPage";
import MySharesPage from "./pages/shared/MySharesPage";

// Protected pages
import LibraryPage from "./pages/library/LibraryPage";
import { CollectionsPage } from "./pages/collections";
import LinksPage from "./pages/links/LinksPage";
import NotesPage from "./pages/notes/NotesPage";
import ProfilePage from "./pages/settings/ProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";
import TrashPage from "./pages/trash/TrashPage";
import ToolsPage from "./pages/tools/ToolsPage";
import QRGeneratorPage from "./pages/tools/QRGeneratorPage";
import VietQRPage from "./pages/tools/VietQRPage";
import CryptoToolboxPage from "./pages/tools/CryptoToolboxPage";
import LunarCalendarPage from "./pages/tools/LunarCalendarPage";
import CodeFormatterPage from "./pages/tools/CodeFormatterPage";
import ColorPickerPage from "./pages/tools/ColorPickerPage";

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
                <ThemeProvider>
                    <AuthProvider>
                        <Routes>
                            {/* Public routes (no layout) */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/register"
                                element={<RegisterPage />}
                            />
                            <Route
                                path="/verify-otp"
                                element={<VerifyOtpPage />}
                            />
                            <Route
                                path="/forgot-password"
                                element={<ForgotPasswordPage />}
                            />
                            <Route
                                path="/reset-password"
                                element={<ResetPasswordPage />}
                            />
                            {/* Public shared link route (no layout, no auth) */}
                            <Route
                                path="/s/:token"
                                element={<SharedLinkPage />}
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
                                        <CollectionsPage />
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
                                            <MySharesPage />
                                        </AppLayout>
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/trash"
                                element={
                                    <ProtectedRoute>
                                        <AppLayout>
                                            <TrashPage />
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
                            <Route
                                path="/tools"
                                element={
                                    <ProtectedRoute>
                                        <AppLayout>
                                            <ToolsPage />
                                        </AppLayout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tools/qr-generator"
                                element={
                                    <ProtectedRoute>
                                        <AppLayout>
                                            <QRGeneratorPage />
                                        </AppLayout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tools/vietqr"
                                element={
                                    <ProtectedRoute>
                                        <AppLayout>
                                            <VietQRPage />
                                        </AppLayout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tools/crypto"
                                element={
                                    <ProtectedRoute>
                                        <AppLayout>
                                            <CryptoToolboxPage />
                                        </AppLayout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tools/calendar"
                                element={
                                    <ProtectedRoute>
                                        <AppLayout>
                                            <LunarCalendarPage />
                                        </AppLayout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tools/formatter"
                                element={
                                    <ProtectedRoute>
                                        <AppLayout>
                                            <CodeFormatterPage />
                                        </AppLayout>
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tools/color-picker"
                                element={
                                    <ProtectedRoute>
                                        <AppLayout>
                                            <ColorPickerPage />
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
                            containerStyle={{
                                zIndex: 9999, // Ensure toasts appear above modals (z-50 = 50)
                            }}
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
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
