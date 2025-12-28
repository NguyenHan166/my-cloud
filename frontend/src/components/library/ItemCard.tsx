import type { Item } from "@/types/item.types";
import {
    getItemTypeIcon,
    getImportanceBadgeColor,
} from "@/lib/utils/item.utils";
import { Pin } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { ReminderBadge } from "@/components/shared/ReminderBadge";

interface ItemCardProps {
    item: Item;
    onClick: () => void;
    onPin?: () => void;
}

export default function ItemCard({ item, onClick, onPin }: ItemCardProps) {
    const Icon = getItemTypeIcon(item.type);
    const primaryFile = item.files?.find((f) => f.isPrimary) || item.files?.[0];
    const fileData = primaryFile?.file;
    const showThumbnail = fileData?.mimeType?.startsWith("image/");

    return (
        <div
            className={`group relative bg-white dark:bg-neutral-800 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                item.isPinned
                    ? "border-sky-300 dark:border-sky-700 shadow-lg shadow-sky-100 dark:shadow-sky-900/50"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-2xl dark:hover:shadow-xl dark:hover:shadow-sky-900/30"
            }`}
            onClick={onClick}
        >
            {/* Thumbnail or Icon */}
            <div className="relative h-40 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center overflow-hidden">
                {showThumbnail && fileData?.url ? (
                    <>
                        <img
                            src={fileData.url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                ) : (
                    <div className="relative">
                        <div className="absolute inset-0 bg-sky-500/10 blur-3xl" />
                        <Icon className="relative w-12 h-12 text-sky-500" />
                    </div>
                )}

                {/* Type badge and Pin button in header */}
                <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
                    {/* Type badge */}
                    <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            {item.type}
                        </span>
                    </div>

                    {/* Pin button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onPin?.();
                        }}
                        className={`rounded-lg p-1.5 shadow-md transition-all ${
                            item.isPinned
                                ? "bg-sky-500 hover:bg-sky-600"
                                : "bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-neutral-700 hover:shadow-lg"
                        }`}
                        aria-label={item.isPinned ? "Unpin" : "Pin"}
                        title={
                            item.isPinned ? "Click to unpin" : "Click to pin"
                        }
                    >
                        <Pin
                            className={`w-3.5 h-3.5 transition-colors ${
                                item.isPinned
                                    ? "text-white fill-white"
                                    : "text-neutral-600 dark:text-neutral-300 hover:text-sky-600 dark:hover:text-sky-400"
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {item.title}
                </h3>

                {/* Description */}
                {item.description && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                        {item.description}
                    </p>
                )}

                {/* Tags */}
                {item.itemTags && item.itemTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.itemTags.slice(0, 3).map((itemTag) => (
                            <Badge
                                key={itemTag.tagId}
                                variant="outline"
                                size="sm"
                                style={{
                                    backgroundColor: itemTag.tag.color
                                        ? `${itemTag.tag.color}15`
                                        : undefined,
                                    borderColor: itemTag.tag.color,
                                    color: itemTag.tag.color,
                                }}
                            >
                                {itemTag.tag.name}
                            </Badge>
                        ))}
                        {item.itemTags.length > 3 && (
                            <Badge variant="outline" size="sm">
                                +{item.itemTags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Reminder Badge */}
                {item.reminderAt && (
                    <div className="mb-3">
                        <ReminderBadge reminderAt={item.reminderAt} />
                    </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500 dark:text-neutral-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <Badge
                        variant="default"
                        size="sm"
                        className={getImportanceBadgeColor(item.importance)}
                    >
                        {item.importance}
                    </Badge>
                </div>
            </div>

            {/* Shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
        </div>
    );
}
