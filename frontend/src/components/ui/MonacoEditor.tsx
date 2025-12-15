import { useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { ChevronDown, Search, Sun, Moon } from "lucide-react";
import {
    LANGUAGE_OPTIONS,
    getLanguageLabel,
    POPULAR_LANGUAGES,
} from "@/lib/constants/languageOptions";

interface MonacoEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
    onLanguageChange: (language: string) => void;
    height?: string;
    readOnly?: boolean;
    showLanguageSelector?: boolean;
}

export default function MonacoEditor({
    value,
    onChange,
    language,
    onLanguageChange,
    height = "300px",
    readOnly = false,
    showLanguageSelector = true,
}: MonacoEditorProps) {
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [theme, setTheme] = useState<"vs-dark" | "vs" | "hc-black">(
        "vs-dark"
    );

    // Filter languages based on search
    const filteredLanguages = useMemo(() => {
        if (!searchQuery) return LANGUAGE_OPTIONS;
        const query = searchQuery.toLowerCase();
        return LANGUAGE_OPTIONS.filter(
            (lang) =>
                lang.label.toLowerCase().includes(query) ||
                lang.value.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    // Popular languages for quick access
    const popularOptions = useMemo(() => {
        return LANGUAGE_OPTIONS.filter((lang) =>
            POPULAR_LANGUAGES.includes(lang.value)
        );
    }, []);

    const handleEditorChange = (value: string | undefined) => {
        onChange(value || "");
    };

    const handleLanguageSelect = (langValue: string) => {
        onLanguageChange(langValue);
        setIsLanguageDropdownOpen(false);
        setSearchQuery("");
    };

    return (
        <div className="border border-neutral-300 dark:border-neutral-600 rounded-lg overflow-hidden">
            {/* Language selector header */}
            {showLanguageSelector && (
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() =>
                                setIsLanguageDropdownOpen(
                                    !isLanguageDropdownOpen
                                )
                            }
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
                        >
                            <span>{getLanguageLabel(language)}</span>
                            <ChevronDown className="w-4 h-4" />
                        </button>

                        {/* Dropdown */}
                        {isLanguageDropdownOpen && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => {
                                        setIsLanguageDropdownOpen(false);
                                        setSearchQuery("");
                                    }}
                                />

                                {/* Dropdown content */}
                                <div className="absolute left-0 top-full mt-1 w-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
                                    {/* Search */}
                                    <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <input
                                                type="text"
                                                placeholder="Search languages..."
                                                value={searchQuery}
                                                onChange={(e) =>
                                                    setSearchQuery(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-neutral-200 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    {/* Popular languages (when no search) */}
                                    {!searchQuery && (
                                        <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
                                            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 px-1">
                                                Popular
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {popularOptions.map((lang) => (
                                                    <button
                                                        key={lang.value}
                                                        type="button"
                                                        onClick={() =>
                                                            handleLanguageSelect(
                                                                lang.value
                                                            )
                                                        }
                                                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                                            language ===
                                                            lang.value
                                                                ? "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300"
                                                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
                                                        }`}
                                                    >
                                                        {lang.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* All languages */}
                                    <div className="overflow-y-auto max-h-48">
                                        {filteredLanguages.length > 0 ? (
                                            filteredLanguages.map((lang) => (
                                                <button
                                                    key={lang.value}
                                                    type="button"
                                                    onClick={() =>
                                                        handleLanguageSelect(
                                                            lang.value
                                                        )
                                                    }
                                                    className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                                                        language === lang.value
                                                            ? "bg-sky-50 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
                                                            : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                    }`}
                                                >
                                                    <span>{lang.label}</span>
                                                    {language ===
                                                        lang.value && (
                                                        <span className="text-sky-600">
                                                            ✓
                                                        </span>
                                                    )}
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-3 py-4 text-sm text-neutral-400 text-center">
                                                No languages found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Theme toggle */}
                        <div className="flex items-center bg-neutral-200 dark:bg-neutral-700 rounded-lg p-0.5">
                            <button
                                type="button"
                                onClick={() => setTheme("vs")}
                                className={`p-1.5 rounded-md transition-colors ${
                                    theme === "vs"
                                        ? "bg-white dark:bg-neutral-600 shadow-sm"
                                        : "text-neutral-500 hover:text-neutral-700"
                                }`}
                                title="Light theme"
                            >
                                <Sun className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setTheme("vs-dark")}
                                className={`p-1.5 rounded-md transition-colors ${
                                    theme === "vs-dark"
                                        ? "bg-white dark:bg-neutral-600 shadow-sm"
                                        : "text-neutral-500 hover:text-neutral-700"
                                }`}
                                title="Dark theme"
                            >
                                <Moon className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {readOnly && (
                            <span className="text-xs text-neutral-400 bg-neutral-200 dark:bg-neutral-700 px-2 py-0.5 rounded">
                                Read Only
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Monaco Editor */}
            <Editor
                height={height}
                language={language}
                value={value}
                onChange={handleEditorChange}
                theme={theme}
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 12, bottom: 12 },
                    folding: true,
                    lineDecorationsWidth: 10,
                    renderLineHighlight: "line",
                }}
            />
        </div>
    );
}
