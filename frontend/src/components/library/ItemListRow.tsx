import type { Item } from "@/types/item.types";
import {
    getItemTypeIcon,
    getImportanceBadgeColor,
    formatFileSize,
} from "@/lib/utils/item.utils";
import { Pin } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { ReminderBadge } from "@/components/shared/ReminderBadge";

interface ItemListRowProps {
    item: Item;
    onClick: () => void;
    onPin?: () => void;
    onDelete?: () => void;
}

export default function ItemListRow({
    item,
    onClick,
    onPin,
}: ItemListRowProps) {
    const Icon = getItemTypeIcon(item.type);
    const primaryFile = item.files?.find((f) => f.isPrimary) || item.files?.[0];
    const fileData = primaryFile?.file;

    return (
        <div
            className={`group transition-all duration-200 cursor-pointer ${
                item.isPinned
                    ? "bg-gradient-to-r from-sky-50 dark:from-sky-900/30 to-transparent border-l-4 border-sky-500 dark:border-sky-600"
                    : "bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 hover:bg-gradient-to-r hover:from-sky-50/50 dark:hover:from-sky-900/20 hover:to-transparent hover:border-sky-300 dark:hover:border-sky-700"
            }`}
            onClick={onClick}
        >
            <div className="flex items-center gap-4 px-4 py-3">
                {/* Type Icon */}
                <div className="flex-shrink-0">
                    <div className="relative">
                        <div className="absolute inset-0 bg-sky-500/10 dark:bg-sky-400/10 blur-xl group-hover:bg-sky-500/20 dark:group-hover:bg-sky-400/20 transition-colors" />
                        <Icon className="relative w-5 h-5 text-sky-500 dark:text-sky-400 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors" />
                    </div>
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {item.title}
                        </h3>
                        {item.isPinned && (
                            <Pin className="w-4 h-4 text-sky-600 dark:text-sky-400 fill-sky-600 dark:fill-sky-400 flex-shrink-0" />
                        )}
                    </div>
                    {item.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate mt-0.5">
                            {item.description}
                        </p>
                    )}
                </div>

                {/* Tags */}
                <div className="hidden md:flex flex-wrap gap-1.5 max-w-xs">
                    {item.itemTags?.slice(0, 2).map((itemTag) => (
                        <Badge
                            key={itemTag.tagId}
                            variant="default"
                            style={{
                                backgroundColor: itemTag.tag.color
                                    ? `${itemTag.tag.color}20`
                                    : undefined,
                                borderColor: itemTag.tag.color,
                                color: itemTag.tag.color,
                            }}
                        >
                            {itemTag.tag.name}
                        </Badge>
                    ))}
                    {item.itemTags && item.itemTags.length > 2 && (
                        <Badge variant="default">
                            +{item.itemTags.length - 2}
                        </Badge>
                    )}
                </div>

                {/* Reminder Badge */}
                {item.reminderAt && (
                    <div className="hidden md:block flex-shrink-0">
                        <ReminderBadge
                            reminderAt={item.reminderAt}
                            showTime={false}
                        />
                    </div>
                )}

                {/* Metadata */}
                <div className="hidden lg:flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    {fileData?.size && (
                        <span>{formatFileSize(fileData.size)}</span>
                    )}
                </div>

                {/* Importance Badge */}
                <div className="flex-shrink-0">
                    <Badge
                        variant="default"
                        className={getImportanceBadgeColor(item.importance)}
                    >
                        {item.importance}
                    </Badge>
                </div>

                {/* Pin Button - Always visible */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onPin?.();
                    }}
                    className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                        item.isPinned
                            ? "bg-sky-500 text-white hover:bg-sky-600"
                            : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400"
                    }`}
                    aria-label={item.isPinned ? "Unpin" : "Pin"}
                    title={item.isPinned ? "Click to unpin" : "Click to pin"}
                >
                    <Pin
                        className={`w-4 h-4 ${
                            item.isPinned ? "fill-white" : ""
                        }`}
                    />
                </button>
            </div>
        </div>
    );
}
