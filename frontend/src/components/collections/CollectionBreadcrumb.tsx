import { ChevronRight, Home, Folder } from "lucide-react";
import type { BreadcrumbItem } from "@/types/collection.types";
import { cn } from "@/lib/utils/cn";

interface CollectionBreadcrumbProps {
    items: BreadcrumbItem[];
    onNavigate: (item: BreadcrumbItem | null) => void; // null = root
}

export default function CollectionBreadcrumb({
    items,
    onNavigate,
}: CollectionBreadcrumbProps) {
    return (
        <nav className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide">
            {/* Home/Root */}
            <button
                onClick={() => onNavigate(null)}
                className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors",
                    items.length === 0
                        ? "text-sky-600 bg-sky-50"
                        : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                )}
            >
                <Home className="w-4 h-4" />
                <span className="font-medium">Collections</span>
            </button>

            {/* Breadcrumb items */}
            {items.map((item, index) => (
                <div key={item.id} className="flex items-center">
                    <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                    <button
                        onClick={() => onNavigate(item)}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors max-w-[150px]",
                            index === items.length - 1
                                ? "text-sky-600 bg-sky-50 font-medium"
                                : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                        )}
                    >
                        <Folder className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                    </button>
                </div>
            ))}
        </nav>
    );
}
