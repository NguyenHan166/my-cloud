import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    BookOpen,
    FolderOpen,
    Link as LinkIcon,
    FileText,
    Share2,
    Trash2,
    X,
    Sparkles,
    Loader2,
    Tag as TagIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { tagsApi, type Tag } from "@/lib/api/endpoints/tags";

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

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(true);

    // Fetch tags from API
    useEffect(() => {
        const fetchTags = async () => {
            try {
                setIsLoadingTags(true);
                const response = await tagsApi.getAll();
                if (response.success) {
                    // Take first 5 tags for quick access
                    setTags(response.data.slice(0, 5));
                }
            } catch (error) {
                console.error("Failed to fetch tags:", error);
            } finally {
                setIsLoadingTags(false);
            }
        };

        fetchTags();
    }, []);

    const handleTagClick = (tag: Tag) => {
        // Navigate to library with tag filter
        navigate(`/library?tags=${encodeURIComponent(tag.id)}`);
        // Close sidebar on mobile
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

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
                    <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                        <TagIcon className="w-3 h-3" />
                        Quick Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {isLoadingTags ? (
                            <div className="flex items-center gap-2 text-white/50 text-xs px-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Loading tags...
                            </div>
                        ) : tags.length === 0 ? (
                            <p className="text-white/40 text-xs px-2">
                                No tags yet
                            </p>
                        ) : (
                            tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => handleTagClick(tag)}
                                    className="px-3 py-1.5 text-xs font-medium rounded-full 
                                        border transition-all duration-200 hover:scale-105"
                                    style={{
                                        backgroundColor: tag.color
                                            ? `${tag.color}20`
                                            : "rgba(255,255,255,0.05)",
                                        borderColor:
                                            tag.color ||
                                            "rgba(255,255,255,0.1)",
                                        color:
                                            tag.color ||
                                            "rgba(255,255,255,0.7)",
                                    }}
                                >
                                    #{tag.name}
                                </button>
                            ))
                        )}
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
