import { useState, useEffect } from "react";
import type { User } from "@/lib/types";

interface SettingsTabProps {
    onLogout: () => void;
    user: User | null;
}

export function SettingsTab({ onLogout, user }: SettingsTabProps) {
    const [apiUrl, setApiUrl] = useState(
        "https://apistorage.nguyenvanhan.io.vn"
    );
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const result = (await browser.storage.local.get([
            "customApiUrl",
            "notificationsEnabled",
        ])) as {
            customApiUrl?: string;
            notificationsEnabled?: boolean;
        };
        if (result.customApiUrl) setApiUrl(result.customApiUrl);
        if (result.notificationsEnabled !== undefined)
            setNotificationsEnabled(result.notificationsEnabled);
    };

    const saveSettings = async () => {
        await browser.storage.local.set({
            customApiUrl: apiUrl,
            notificationsEnabled,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="settings-tab">
            {user && (
                <div className="user-info">
                    <p className="user-email">{user.email}</p>
                    <p className="user-name-display">{user.name}</p>
                </div>
            )}

            <div className="settings-section">
                <label className="setting-label">
                    <span>🔔 Notifications</span>
                    <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={(e) =>
                            setNotificationsEnabled(e.target.checked)
                        }
                    />
                </label>
            </div>

            <div className="settings-section">
                <label className="setting-label">
                    <span>🔧 API URL</span>
                </label>
                <input
                    type="url"
                    className="api-url-input"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.example.com"
                />
            </div>

            <button className="save-settings-btn" onClick={saveSettings}>
                {saved ? "✅ Saved!" : "Save Settings"}
            </button>

            <button className="logout-btn" onClick={onLogout}>
                🚪 Logout
            </button>
        </div>
    );
}
