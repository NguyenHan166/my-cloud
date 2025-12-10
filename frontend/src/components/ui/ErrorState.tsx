import { AlertCircle } from "lucide-react";
import Button from "./Button";

export interface ErrorStateProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export default function ErrorState({
    title = "Something went wrong",
    message,
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 mb-4 text-red-500 flex items-center justify-center">
                <AlertCircle className="w-16 h-16" />
            </div>

            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {title}
            </h3>

            <p className="text-neutral-600 max-w-md mb-6">{message}</p>

            {onRetry && (
                <Button onClick={onRetry} variant="primary">
                    Try Again
                </Button>
            )}
        </div>
    );
}
