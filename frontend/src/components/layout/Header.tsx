import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Menu,
    User,
    Settings,
    LogOut,
    Bell,
    ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import toast from "react-hot-toast";

export interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            toast.success(`Searching for: ${searchQuery}`);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    return (
        <header className="backdrop-blur-xl border-b sticky top-0 z-30 transition-colors duration-300 bg-white/80 dark:bg-neutral-900/80 border-neutral-200/50 dark:border-neutral-700/50">
            <div className="flex items-center gap-4 px-4 lg:px-6 py-3">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                </button>

                {/* Search bar */}
                <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by title, tags, content…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-neutral-100/50 dark:bg-neutral-800/50 border border-transparent rounded-xl text-sm
                       text-neutral-900 dark:text-neutral-100
                       focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 
                       focus:bg-white dark:focus:bg-neutral-800
                       placeholder-neutral-400 dark:placeholder-neutral-500 transition-all duration-300"
                        />
                    </div>
                </form>

                {/* Dark mode toggle */}
                <DarkModeToggle />

                {/* Notification button */}
                <button className="relative p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors hidden sm:flex">
                    <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
                </button>

                {/* User menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-1.5 pr-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                    >
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name || "User"}
                                className="w-8 h-8 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                    {user?.name?.[0]?.toUpperCase() ||
                                        user?.email?.[0]?.toUpperCase() ||
                                        "U"}
                                </span>
                            </div>
                        )}
                        <span className="hidden md:block text-sm font-medium text-neutral-700 dark:text-neutral-200 max-w-[120px] truncate">
                            {user?.name || user?.email?.split("@")[0]}
                        </span>
                        <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-500 hidden md:block" />
                    </button>

                    {/* Dropdown menu */}
                    {showUserMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowUserMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-modal border border-neutral-200/50 py-2 z-20 animate-slide-down">
                                {/* User info */}
                                <div className="px-4 py-3 border-b border-neutral-100">
                                    <div className="flex items-center gap-3">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name || "User"}
                                                className="w-10 h-10 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">
                                                    {user?.name?.[0]?.toUpperCase() ||
                                                        user?.email?.[0]?.toUpperCase() ||
                                                        "U"}
                                                </span>
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-neutral-900 truncate">
                                                {user?.name || "User"}
                                            </p>
                                            <p className="text-xs text-neutral-500 truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            navigate("/profile");
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            navigate("/settings");
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </button>
                                </div>

                                <hr className="my-1 border-neutral-100" />

                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            handleLogout();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
