import { useState, useEffect } from "react";
import { authApi, storageApi } from "@/lib/api";
import { useExtensionStore } from "@/lib/store";
import { BrowseTab, SettingsTab } from "./components";
import "./App.css";

function App() {
    const {
        isAuthenticated,
        user,
        isLoading,
        storageUsage,
        activeTab,
        error,
        setAuthenticated,
        setUser,
        setLoading,
        setStorageUsage,
        setActiveTab,
        setError,
        reset,
    } = useExtensionStore();

    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Check auth status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        setLoading(true);
        try {
            const response = await authApi.getProfile();
            if (response.data?.data) {
                setAuthenticated(true);
                setUser(response.data.data);
                await loadStorageUsage();
            } else {
                setAuthenticated(false);
                setUser(null);
            }
        } catch {
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const loadStorageUsage = async () => {
        const usageResponse = await storageApi.getUsage();
        if (usageResponse.data?.data) {
            setStorageUsage(usageResponse.data.data);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError(null);

        try {
            const response = await authApi.login(
                loginForm.email,
                loginForm.password
            );
            if (response.error) {
                setError(response.error);
            } else if (response.data?.data) {
                setAuthenticated(true);
                setUser(response.data.data.user);
                await loadStorageUsage();
                setLoginForm({ email: "", password: "" });
            }
        } catch {
            setError("Login failed");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        await authApi.logout();
        reset();
        setLoading(false);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="popup-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Login screen
    if (!isAuthenticated) {
        return (
            <div className="popup-container">
                <div className="header">
                    <h1>☁️ PersonalCloud</h1>
                </div>
                <form className="login-form" onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={loginForm.email}
                        onChange={(e) =>
                            setLoginForm({
                                ...loginForm,
                                email: e.target.value,
                            })
                        }
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={(e) =>
                            setLoginForm({
                                ...loginForm,
                                password: e.target.value,
                            })
                        }
                        required
                    />
                    {error && <p className="error">{error}</p>}
                    <button type="submit" disabled={isLoggingIn}>
                        {isLoggingIn ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        );
    }

    // Main app screen
    return (
        <div className="popup-container">
            <div className="header">
                <h1>☁️ PersonalCloud</h1>
                <span className="user-name">{user?.name || user?.email}</span>
            </div>

            {/* Storage Usage */}
            {storageUsage && (
                <div className="storage-bar">
                    <div className="storage-info">
                        <span>Storage</span>
                        <span>
                            {storageUsage.formattedUsed} /{" "}
                            {storageUsage.formattedMax}
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${storageUsage.usedPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={activeTab === "browse" ? "active" : ""}
                    onClick={() => setActiveTab("browse")}
                >
                    📁 Items
                </button>
                <button
                    className={activeTab === "settings" ? "active" : ""}
                    onClick={() => setActiveTab("settings")}
                >
                    ⚙️ Cài đặt
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === "browse" && <BrowseTab />}
                {activeTab === "settings" && (
                    <SettingsTab onLogout={handleLogout} user={user} />
                )}
            </div>
        </div>
    );
}

export default App;
