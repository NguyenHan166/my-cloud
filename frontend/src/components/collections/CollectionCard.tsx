import { useState } from "react";
import {
    Folder,
    MoreHorizontal,
    Edit2,
    Trash2,
    Move,
    Globe,
    Lock,
} from "lucide-react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { Collection } from "@/types/collection.types";
import { cn } from "@/lib/utils/cn";

interface CollectionCardProps {
    collection: Collection;
    onClick: () => void;
    onEdit?: (collection: Collection) => void;
    onDelete?: (collection: Collection) => void;
    onMove?: (collection: Collection) => void;
    isDraggable?: boolean;
    isDroppable?: boolean;
}

export default function CollectionCard({
    collection,
    onClick,
    onEdit,
    onDelete,
    onMove,
    isDraggable = true,
    isDroppable = true,
}: CollectionCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    // Draggable
    const {
        attributes: dragAttributes,
        listeners: dragListeners,
        setNodeRef: setDragRef,
        isDragging,
    } = useDraggable({
        id: `collection:${collection.id}`,
        disabled: !isDraggable,
    });

    // Droppable (for receiving items or collections)
    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `collection:${collection.id}`,
        disabled: !isDroppable,
    });

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleAction = (
        e: React.MouseEvent,
        action: (collection: Collection) => void
    ) => {
        e.stopPropagation();
        setShowMenu(false);
        action(collection);
    };

    // Combine refs
    const setRefs = (node: HTMLDivElement | null) => {
        setDragRef(node);
        setDropRef(node);
    };

    return (
        <div
            ref={setRefs}
            onClick={onClick}
            {...dragAttributes}
            {...dragListeners}
            className={cn(
                "group relative bg-white rounded-xl border p-4",
                "transition-all duration-200 cursor-pointer",
                isDragging && "opacity-50 scale-95",
                isOver
                    ? "border-sky-400 bg-sky-50 shadow-lg shadow-sky-200/50 ring-2 ring-sky-400"
                    : "border-neutral-200 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50"
            )}
        >
            {/* Drop indicator */}
            {isOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-sky-400/10 rounded-xl pointer-events-none z-10">
                    <span className="text-sm font-medium text-sky-600">
                        Drop here
                    </span>
                </div>
            )}

            {/* Cover image or icon */}
            <div className="relative h-28 bg-gradient-to-br from-sky-50 to-blue-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {collection.coverImage ? (
                    <img
                        src={collection.coverImage}
                        alt={collection.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Folder className="w-12 h-12 text-sky-400" />
                )}

                {/* Items & children count badge */}
                <div className="absolute bottom-2 left-2 flex gap-1.5">
                    {collection._count && (
                        <>
                            {collection._count.items > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-medium bg-white/90 backdrop-blur rounded-full text-neutral-600">
                                    {collection._count.items} items
                                </span>
                            )}
                            {collection._count.children > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-medium bg-sky-100/90 backdrop-blur rounded-full text-sky-700">
                                    {collection._count.children} folders
                                </span>
                            )}
                        </>
                    )}
                </div>

                {/* Public/Private indicator - moved to left to avoid menu overlap */}
                <div className="absolute top-2 left-2">
                    {collection.isPublic ? (
                        <div
                            className="p-1 bg-white/80 rounded-full shadow-sm"
                            title="Public"
                        >
                            <Globe className="w-3.5 h-3.5 text-green-500" />
                        </div>
                    ) : (
                        <div
                            className="p-1 bg-white/80 rounded-full shadow-sm"
                            title="Private"
                        >
                            <Lock className="w-3.5 h-3.5 text-neutral-400" />
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-1">
                <h3 className="font-semibold text-neutral-900 truncate group-hover:text-sky-600 transition-colors">
                    {collection.name}
                </h3>
                {collection.description && (
                    <p className="text-xs text-neutral-500 line-clamp-2">
                        {collection.description}
                    </p>
                )}
            </div>

            {/* Actions menu */}
            <div className="absolute top-2 right-2">
                <button
                    onClick={handleMenuClick}
                    className={cn(
                        "p-1.5 rounded-lg transition-all bg-white/80 shadow-sm border border-neutral-200/50",
                        showMenu
                            ? "bg-neutral-100"
                            : "hover:bg-neutral-100 hover:shadow"
                    )}
                >
                    <MoreHorizontal className="w-4 h-4 text-neutral-600" />
                </button>

                {/* Dropdown */}
                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                            }}
                        />
                        <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 animate-in fade-in zoom-in-95 duration-100">
                            {onEdit && (
                                <button
                                    onClick={(e) => handleAction(e, onEdit)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit
                                </button>
                            )}
                            {onMove && (
                                <button
                                    onClick={(e) => handleAction(e, onMove)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                >
                                    <Move className="w-4 h-4" />
                                    Move
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    onClick={(e) => handleAction(e, onDelete)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
