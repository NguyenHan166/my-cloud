import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage from "./pages/auth/LoginPage";
import LibraryPage from "./pages/library/LibraryPage";

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
                        {/* Public routes */}
                        <Route path="/login" element={<LoginPage />} />

                        {/* Protected routes */}
                        <Route
                            path="/library"
                            element={
                                <ProtectedRoute>
                                    <LibraryPage />
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
