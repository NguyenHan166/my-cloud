import type { ReactNode } from "react";
import Button from "./Button";

export interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {icon && (
                <div className="w-16 h-16 mb-4 text-neutral-400 flex items-center justify-center">
                    {icon}
                </div>
            )}

            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-neutral-600 max-w-md mb-6">{description}</p>
            )}

            {action && (
                <Button onClick={action.onClick} variant="primary">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
