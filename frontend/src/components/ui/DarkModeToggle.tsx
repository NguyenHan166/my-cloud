import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils/cn";

export default function DarkModeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative p-2.5 rounded-xl transition-all duration-300",
                "hover:scale-105 active:scale-95",
                isDark
                    ? "bg-neutral-800 hover:bg-neutral-700"
                    : "bg-neutral-100 hover:bg-neutral-200"
            )}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <div className="relative w-5 h-5">
                {/* Sun icon for light mode */}
                <Sun
                    className={cn(
                        "absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-300",
                        isDark
                            ? "rotate-90 scale-0 opacity-0"
                            : "rotate-0 scale-100 opacity-100"
                    )}
                />

                {/* Moon icon for dark mode */}
                <Moon
                    className={cn(
                        "absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300",
                        isDark
                            ? "rotate-0 scale-100 opacity-100"
                            : "-rotate-90 scale-0 opacity-0"
                    )}
                />
            </div>
        </button>
    );
}
