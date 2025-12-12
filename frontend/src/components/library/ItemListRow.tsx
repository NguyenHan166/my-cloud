import type { Item } from "@/types/item.types";
import {
    getItemTypeIcon,
    getImportanceBadgeColor,
    formatFileSize,
} from "@/lib/utils/item.utils";
import { Pin } from "lucide-react";
import Badge from "@/components/ui/Badge";

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
                    ? "bg-gradient-to-r from-sky-50 to-transparent border-l-4 border-sky-500"
                    : "bg-white border-b border-neutral-200 hover:bg-gradient-to-r hover:from-sky-50/50 hover:to-transparent hover:border-sky-300"
            }`}
            onClick={onClick}
        >
            <div className="flex items-center gap-4 px-4 py-3">
                {/* Type Icon */}
                <div className="flex-shrink-0">
                    <div className="relative">
                        <div className="absolute inset-0 bg-sky-500/10 blur-xl group-hover:bg-sky-500/20 transition-colors" />
                        <Icon className="relative w-5 h-5 text-sky-500 group-hover:text-sky-600 transition-colors" />
                    </div>
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-neutral-900 truncate">
                            {item.title}
                        </h3>
                        {item.isPinned && (
                            <Pin className="w-4 h-4 text-sky-600 fill-sky-600 flex-shrink-0" />
                        )}
                    </div>
                    {item.description && (
                        <p className="text-sm text-neutral-600 truncate mt-0.5">
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

                {/* Metadata */}
                <div className="hidden lg:flex items-center gap-4 text-sm text-neutral-600">
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
                            : "bg-neutral-100 text-neutral-600 hover:bg-sky-100 hover:text-sky-600"
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
