import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
}

export default function Card({
    children,
    className,
    onClick,
    hoverable = false,
}: CardProps) {
    const isClickable = !!onClick || hoverable;

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white rounded-lg border border-neutral-200 shadow-soft",
                isClickable &&
                    "cursor-pointer transition-all duration-200 hover:shadow-card hover:border-neutral-300",
                className
            )}
        >
            {children}
        </div>
    );
}
