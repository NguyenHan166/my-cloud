import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps {
    children: ReactNode;
    variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function Badge({
    children,
    variant = "default",
    size = "md",
    className,
}: BadgeProps) {
    const baseStyles = "inline-flex items-center font-medium rounded-full";

    const variants = {
        default: "bg-neutral-100 text-neutral-700",
        primary: "bg-primary-100 text-primary-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700",
        danger: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
    };

    const sizes = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-1",
        lg: "text-base px-3 py-1.5",
    };

    return (
        <span
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                className
            )}
        >
            {children}
        </span>
    );
}
