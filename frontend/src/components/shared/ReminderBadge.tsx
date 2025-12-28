import React from "react";
import { Bell, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ReminderBadgeProps {
    reminderAt: string;
    className?: string;
    showTime?: boolean;
}

export const ReminderBadge: React.FC<ReminderBadgeProps> = ({
    reminderAt,
    className = "",
    showTime = true,
}) => {
    const reminderDate = new Date(reminderAt);
    const now = new Date();
    const isPast = reminderDate < now;
    const isUpcoming =
        !isPast && reminderDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000; // within 24h

    // Format time relative to now
    const relativeTime = formatDistanceToNow(reminderDate, {
        addSuffix: true,
        locale: vi,
    });

    // Format absolute time
    const absoluteTime = reminderDate.toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    });

    // Determine badge color
    const getBadgeColor = () => {
        if (isPast) {
            return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
        }
        if (isUpcoming) {
            return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
        }
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
    };

    return (
        <div
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${getBadgeColor()} ${className}`}
            title={`Nhắc nhở: ${absoluteTime}`}
        >
            {isPast ? (
                <Clock className="w-3 h-3" />
            ) : (
                <Bell className="w-3 h-3" />
            )}
            {showTime && (
                <span>
                    {isPast && "Đã qua "}
                    {relativeTime}
                </span>
            )}
        </div>
    );
};
