import { useQuery } from "@tanstack/react-query";
import { Folder, Loader2, AlertCircle, Lock, Edit3, User } from "lucide-react";
import { sharedCollectionsApi } from "@/lib/api/endpoints/shared-collections";
import type { SharedCollection } from "@/types/shared-collection.types";
import { cn } from "@/lib/utils/cn";

interface SharedWithMeTabProps {
    onNavigateToCollection: (collectionId: string) => void;
}

export default function SharedWithMeTab({
    onNavigateToCollection,
}: SharedWithMeTabProps) {
    const {
        data: sharedCollections,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["shared-collections", "shared-with-me"],
        queryFn: () => sharedCollectionsApi.getSharedWithMe(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
                <p>Failed to load shared collections</p>
                <button
                    onClick={() => refetch()}
                    className="mt-2 text-sm text-sky-600 hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!sharedCollections || sharedCollections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 dark:text-neutral-400">
                <Folder className="w-16 h-16 mb-4 text-neutral-300 dark:text-neutral-600" />
                <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
                    No shared collections yet
                </p>
                <p className="text-sm mt-1">
                    Collections shared with you will appear here
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                <p>
                    {sharedCollections.length} collection
                    {sharedCollections.length !== 1 ? "s" : ""} shared with you
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sharedCollections.map((sharedCol) => (
                    <SharedCollectionCard
                        key={sharedCol.id}
                        sharedCollection={sharedCol}
                        onNavigate={() =>
                            onNavigateToCollection(sharedCol.collection.id)
                        }
                    />
                ))}
            </div>
        </div>
    );
}

interface SharedCollectionCardProps {
    sharedCollection: SharedCollection;
    onNavigate: () => void;
}

function SharedCollectionCard({
    sharedCollection,
    onNavigate,
}: SharedCollectionCardProps) {
    const { collection, permission, sharedBy } = sharedCollection;

    const permissionIcon =
        permission === "EDIT" ? (
            <Edit3 className="w-3.5 h-3.5" />
        ) : (
            <Lock className="w-3.5 h-3.5" />
        );

    const permissionColor =
        permission === "EDIT"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400";

    return (
        <div
            onClick={onNavigate}
            className={cn(
                "group relative p-4 rounded-xl border transition-all cursor-pointer",
                "border-neutral-200 dark:border-neutral-700",
                "bg-white dark:bg-neutral-800",
                "hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-600",
                "hover:-translate-y-0.5"
            )}
        >
            {/* Content */}
            <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                        <Folder className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
                            {collection.name}
                        </h3>
                        {collection.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
                                {collection.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Permission Badge */}
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                            permissionColor
                        )}
                    >
                        {permissionIcon}
                        {permission === "EDIT" ? "Can Edit" : "View Only"}
                    </span>
                </div>

                {/* Owner Info */}
                {sharedBy && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate">
                            Shared by {sharedBy.name || sharedBy.email}
                        </span>
                    </div>
                )}
            </div>

            {/* Hover Indicator */}
            <div className="absolute inset-0 rounded-xl border-2 border-sky-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
}
