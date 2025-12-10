import { cn } from "@/lib/utils/cn";

export interface SkeletonProps {
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
}

export default function Skeleton({
    className,
    variant = "rectangular",
    width,
    height,
}: SkeletonProps) {
    const variants = {
        text: "h-4 rounded",
        circular: "rounded-full",
        rectangular: "rounded-md",
    };

    const style = {
        width: width
            ? typeof width === "number"
                ? `${width}px`
                : width
            : undefined,
        height: height
            ? typeof height === "number"
                ? `${height}px`
                : height
            : undefined,
    };

    return (
        <div
            className={cn(
                "animate-pulse bg-neutral-200",
                variants[variant],
                variant === "text" && "w-full",
                className
            )}
            style={style}
        />
    );
}

// Common skeleton patterns
export function SkeletonCard() {
    return (
        <div className="bg-white rounded-lg border border-neutral-200 p-4 space-y-3">
            <Skeleton variant="rectangular" height={120} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
            <div className="flex gap-2 pt-2">
                <Skeleton variant="rectangular" width={60} height={24} />
                <Skeleton variant="rectangular" width={60} height={24} />
            </div>
        </div>
    );
}

export function SkeletonList() {
    return (
        <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-lg border border-neutral-200 p-4 flex items-center gap-4"
                >
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="text" width="60%" />
                    </div>
                </div>
            ))}
        </div>
    );
}
