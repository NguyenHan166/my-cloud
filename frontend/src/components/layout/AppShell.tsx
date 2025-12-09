import React, {
    useState,
    createContext,
    useContext,
    useEffect,
    useRef,
} from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { classNames } from "@/utils/classNames";
import { Avatar, IconButton, Input, Tooltip } from "@/components/common";
import { useMediaQuery } from "@/hooks";
import { useAuthStore, useTagsStore } from "@/stores";
import {
    Library,
    FolderOpen,
    FileText,
    Link,
    StickyNote,
    Share2,
    Trash2,
    Search,
    Settings,
    ChevronDown,
    ChevronRight,
    PanelLeftClose,
    PanelLeft,
    Globe,
    Menu,
    X,
    Cloud,
    User,
    Users,
    Tag as TagIcon,
    LogOut,
} from "lucide-react";

// Context for sidebar state
interface SidebarContextValue {
    isCollapsed: boolean;
    toggleCollapse: () => void;
    isMobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("useSidebar must be used within AppShell");
    return context;
};

// Navigation items (adminOnly items will be filtered based on user role)
const navItems = [
    { path: "/app/library", label: "Library", icon: Library },
    { path: "/app/collections", label: "Collections", icon: FolderOpen },
    { path: "/app/files", label: "Files", icon: FileText },
    { path: "/app/links", label: "Links", icon: Link },
    { path: "/app/notes", label: "Notes", icon: StickyNote },
    { path: "/app/shared-links", label: "Shared Links", icon: Share2 },
    { path: "/app/trash", label: "Trash", icon: Trash2 },
    { divider: true },
    {
        path: "/app/users",
        label: "Quản lý Users",
        icon: Users,
        adminOnly: true,
    },
    { divider: true, adminOnly: true },
    { path: "/public", label: "Public Library", icon: Globe, external: true },
];



interface AppShellProps {
    onTagSelect?: (tagId: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
    onTagSelect,
}) => {
    const { isMobile } = useMediaQuery();
    const { user } = useAuthStore();
    const { loadTags, getPopularTags } = useTagsStore();
    const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed on desktop
    const [isMobileOpen, setMobileOpen] = useState(false);
    const [isTagsExpanded, setIsTagsExpanded] = useState(true);
    const location = useLocation();

    // Load tags on mount
    useEffect(() => {
        loadTags();
    }, [loadTags]);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile drawer is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileOpen]);

    // Sidebar content (shared between mobile drawer and desktop sidebar)
    const SidebarContent = ({
        showToggle = true,
    }: {
        showToggle?: boolean;
    }) => (
        <>
            {/* Logo & Toggle */}
            <div className="flex items-center justify-between h-16 px-3 border-b border-border">
                {(!isCollapsed || isMobile) && (
                    <NavLink
                        to="/app/library"
                        className="text-lg font-bold text-primary truncate hover:opacity-80 transition-opacity"
                    >
                        CloudHan
                    </NavLink>
                )}
                {showToggle && !isMobile && (
                    <Tooltip
                        content={isCollapsed ? "Expand" : "Collapse"}
                        position="right"
                    >
                        <IconButton
                            aria-label={
                                isCollapsed
                                    ? "Expand sidebar"
                                    : "Collapse sidebar"
                            }
                            icon={
                                isCollapsed ? (
                                    <PanelLeft className="w-full h-full" />
                                ) : (
                                    <PanelLeftClose className="w-full h-full" />
                                )
                            }
                            onClick={toggleCollapse}
                        />
                    </Tooltip>
                )}
                {isMobile && (
                    <IconButton
                        aria-label="Close menu"
                        icon={<X className="w-full h-full" />}
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
                <ul className="space-y-1 px-2">
                    {navItems
                        .filter((item) => {
                            // Filter out adminOnly items for non-admin users
                            if ("adminOnly" in item && item.adminOnly) {
                                return user?.role === "ADMIN";
                            }
                            return true;
                        })
                        .map((item, index) => {
                            // Handle divider
                            if ("divider" in item && item.divider) {
                                return (
                                    <li
                                        key={`divider-${index}`}
                                        className="my-2"
                                    >
                                        <hr className="border-border" />
                                    </li>
                                );
                            }

                            // Type guard for nav items
                            if (!item.path || !item.icon) return null;

                            const NavIcon = item.icon;
                            const showLabel = !isCollapsed || isMobile;

                            return (
                                <li key={item.path}>
                                    <Tooltip
                                        content={item.label}
                                        position="right"
                                        delay={
                                            isCollapsed && !isMobile
                                                ? 100
                                                : 1000
                                        }
                                    >
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) =>
                                                classNames(
                                                    "flex items-center gap-3 px-3 py-2 rounded-lg",
                                                    "transition-colors duration-200",
                                                    !showLabel &&
                                                        "justify-center",
                                                    isActive
                                                        ? "bg-primary/10 text-primary font-medium"
                                                        : "text-text-secondary hover:bg-gray-100 hover:text-text"
                                                )
                                            }
                                        >
                                            <NavIcon className="w-5 h-5 flex-shrink-0" />
                                            {showLabel && (
                                                <span className="whitespace-nowrap">{item.label}</span>
                                            )}
                                        </NavLink>
                                    </Tooltip>
                                </li>
                            );
                        })}
                </ul>

                {/* Tags section - only show when expanded or on mobile */}
                {(!isCollapsed || isMobile) && (
                    <div className="mt-6 px-2">
                        <button
                            onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted hover:text-text"
                        >
                            <span>Popular Tags</span>
                            {isTagsExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </button>
                        {isTagsExpanded && (
                            <ul className="mt-1 space-y-1">
                                {getPopularTags(5).map((tag) => (
                                    <li key={tag.id}>
                                        <button
                                            onClick={() =>
                                                onTagSelect?.(tag.id)
                                            }
                                            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-text-secondary hover:bg-gray-100 rounded-md transition-colors"
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{
                                                    backgroundColor:
                                                        tag.color || "#94A3B8",
                                                }}
                                            />
                                            <span className="truncate">
                                                {tag.name}
                                            </span>
                                            {tag.itemCount !== undefined && (
                                                <span className="ml-auto text-xs text-muted">
                                                    {tag.itemCount}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </nav>

            {/* User section at bottom */}
            <div className="p-3 border-t border-border">
                <div
                    className={classNames(
                        "flex items-center gap-3",
                        isCollapsed && !isMobile && "justify-center"
                    )}
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    {(!isCollapsed || isMobile) && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">
                                {user?.name || "User"}
                            </p>
                            <p className="text-xs text-muted truncate">
                                {user?.email || ""}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    return (
        <SidebarContext.Provider
            value={{ isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen }}
        >
            <div className="relative h-screen bg-background overflow-hidden">
                {/* Mobile: Backdrop when drawer is open */}
                {isMobile && isMobileOpen && (
                    <div
                        className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
                        onClick={() => setMobileOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Desktop: Backdrop when sidebar is expanded */}
                {!isMobile && !isCollapsed && (
                    <div
                        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                        onClick={toggleCollapse}
                    />
                )}

                {/* Mobile Drawer */}
                {isMobile && (
                    <aside
                        className={classNames(
                            "fixed inset-y-0 left-0 z-50 w-64",
                            "flex flex-col bg-surface border-r border-border shadow-lg",
                            "transition-transform duration-300 ease-in-out",
                            isMobileOpen ? "translate-x-0" : "-translate-x-full"
                        )}
                    >
                        <SidebarContent showToggle={false} />
                    </aside>
                )}

                {/* Desktop Sidebar - overlay mode with hover to expand */}
                {!isMobile && (
                    <aside
                        className={classNames(
                            "fixed inset-y-0 left-0 z-50",
                            "flex flex-col bg-surface border-r border-border shadow-lg",
                            "transition-all duration-300 ease-in-out overflow-hidden",
                            isCollapsed ? "w-16" : "w-64"
                        )}
                        onMouseEnter={() => setIsCollapsed(false)}
                        onMouseLeave={() => setIsCollapsed(true)}
                    >
                        <SidebarContent />
                    </aside>
                )}

                {/* Main content area */}
                <div
                    className={classNames(
                        "flex flex-col h-screen",
                        !isMobile && "ml-16" // Only offset on desktop
                    )}
                >
                    {/* Header */}
                    <Header />

                    {/* Page content - scrollable */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarContext.Provider>
    );
};

// Header component
const Header: React.FC = () => {
    const { isMobile } = useMediaQuery();
    const { setMobileOpen } = useSidebar();

    return (
        <header className="h-16 bg-surface border-b border-border px-4 md:px-6 flex items-center gap-4">
            {/* Mobile: Hamburger menu */}
            {isMobile && (
                <IconButton
                    aria-label="Open menu"
                    icon={<Menu className="w-full h-full" />}
                    onClick={() => setMobileOpen(true)}
                />
            )}

            {/* Logo - clickable to go to library */}
            <NavLink
                to="/app/library"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
            >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-primary hidden sm:inline">CloudHan</span>
            </NavLink>

            {/* Search bar - centered, flexible width */}
            {!isMobile && (
                <div className="flex-1 flex justify-center">
                    <div className="w-full max-w-xl">
                        <Input
                            placeholder="Search by title, tags, content..."
                            leftIcon={<Search className="w-4 h-4" />}
                        />
                    </div>
                </div>
            )}

            {/* Spacer for mobile */}
            {isMobile && <div className="flex-1" />}

            {/* Right side actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Mobile search button */}
                {isMobile && (
                    <Tooltip content="Search" position="bottom">
                        <IconButton
                            aria-label="Search"
                            icon={<Search className="w-full h-full" />}
                        />
                    </Tooltip>
                )}

                {/* Profile dropdown */}
                <ProfileDropdown />
            </div>
        </header>
    );
};

// Profile Dropdown component
const ProfileDropdown: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate("/auth/login");
    };

    const userName = user?.name || "User";
    const userEmail = user?.email || "";
    const userAvatar = user?.avatar || null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={classNames(
                    "flex items-center gap-2 p-1.5 rounded-lg transition-colors",
                    "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50",
                    isOpen && "bg-gray-100"
                )}
                aria-label="Profile menu"
                aria-expanded={isOpen}
            >
                <Avatar name={userName} src={userAvatar} size="sm" />
                <ChevronDown
                    className={classNames(
                        "w-4 h-4 text-muted transition-transform hidden sm:block",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl border border-border shadow-lg z-50 overflow-hidden animate-fade-in">
                    {/* User info */}
                    <div className="p-4 border-b border-border bg-gray-50">
                        <div className="flex items-center gap-3">
                            <Avatar
                                name={userName}
                                src={userAvatar}
                                size="md"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-text truncate">
                                    {userName}
                                </p>
                                <p className="text-sm text-muted truncate">
                                    {userEmail}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                        <button
                            onClick={() => {
                                navigate("/app/settings?tab=profile");
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <User className="w-4 h-4 text-muted" />
                            <span>Profile</span>
                        </button>
                        <button
                            onClick={() => {
                                navigate("/app/settings");
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <Settings className="w-4 h-4 text-muted" />
                            <span>Settings</span>
                        </button>

                        <hr className="my-2 border-border" />

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
