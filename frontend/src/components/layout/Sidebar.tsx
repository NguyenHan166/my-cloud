import { NavLink } from "react-router-dom";
import {
    BookOpen,
    FolderOpen,
    Link as LinkIcon,
    FileText,
    Share2,
    Trash2,
    X,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navigation = [
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Collections", href: "/collections", icon: FolderOpen },
    { name: "Links", href: "/links", icon: LinkIcon },
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Shared Links", href: "/shared-links", icon: Share2 },
    { name: "Trash", href: "/trash", icon: Trash2 },
];

const popularTags = ["work", "study", "design", "backend", "cloud"];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-out",
                    "w-72 flex flex-col",
                    "bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950",
                    "lg:translate-x-0 lg:static",
                    isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    CloudHan
                                </h1>
                                <p className="text-xs text-white/50">
                                    Personal Cloud
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Close sidebar"
                        >
                            <X className="w-5 h-5 text-white/70" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={() => {
                                if (window.innerWidth < 1024) onClose();
                            }}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-gradient-to-r from-primary-500/20 to-accent-500/10 text-white border border-primary-500/30 shadow-lg shadow-primary-500/10"
                                        : "text-white/70 hover:text-white hover:bg-white/5"
                                )
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* Tags section */}
                <div className="p-4 border-t border-white/10">
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">
                        Quick Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                            <button
                                key={tag}
                                className="px-3 py-1.5 text-xs font-medium bg-white/5 text-white/70 rounded-full 
                         hover:bg-primary-500/20 hover:text-primary-300 border border-white/10
                         hover:border-primary-500/30 transition-all duration-200"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Storage indicator (decorative) */}
                <div className="p-4 mx-4 mb-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-white/70">Storage</span>
                        <span className="text-white/50">2.4 GB / 10 GB</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                            style={{ width: "24%" }}
                        />
                    </div>
                </div>
            </aside>
        </>
    );
}
