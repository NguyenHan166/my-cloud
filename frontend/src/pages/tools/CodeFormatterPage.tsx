import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    FileCode,
    Eye,
    Copy,
    Check,
    Wand2,
    Minimize2,
    AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
    formatCode,
    minifyCode,
    FORMAT_TYPES,
    type FormatType,
    type FormatOptions,
} from "@/lib/formatter";

type TabId = "formatter" | "markdown";

const TABS = [
    { id: "formatter" as TabId, label: "Code Formatter", icon: FileCode },
    { id: "markdown" as TabId, label: "Markdown Preview", icon: Eye },
];

export default function CodeFormatterPage() {
    const [activeTab, setActiveTab] = useState<TabId>("formatter");

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link
                        to="/tools"
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-500" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                            <FileCode className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Code Formatter
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex gap-1 border-b border-neutral-200 dark:border-neutral-700">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.id
                                            ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
                                            : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                {activeTab === "formatter" && <FormatterTab />}
                {activeTab === "markdown" && <MarkdownTab />}
            </div>
        </div>
    );
}

// ============ Formatter Tab ============

function FormatterTab() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [formatType, setFormatType] = useState<FormatType>("json");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    // Options
    const [tabWidth, setTabWidth] = useState(2);
    const [useTabs, setUseTabs] = useState(false);
    const [singleQuote, setSingleQuote] = useState(true);
    const [semi, setSemi] = useState(true);

    const options: FormatOptions = {
        tabWidth,
        useTabs,
        singleQuote,
        semi,
    };

    const handleFormat = async () => {
        if (!input.trim()) {
            toast.error("Vui lòng nhập code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await formatCode(input, formatType, options);
            setOutput(result);
            toast.success("Đã format thành công!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Format failed");
            setOutput("");
        } finally {
            setLoading(false);
        }
    };

    const handleMinify = () => {
        if (!input.trim()) {
            toast.error("Vui lòng nhập code");
            return;
        }

        try {
            const result = minifyCode(input, formatType);
            setOutput(result);
            toast.success("Đã minify thành công!");
            setError("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Minify failed");
        }
    };

    const handleCopy = () => {
        if (output) {
            navigator.clipboard.writeText(output);
            setCopied(true);
            toast.success("Đã sao chép!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-4">
            {/* Format Type & Options */}
            <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                <div className="flex flex-wrap gap-4">
                    {/* Format Type */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-neutral-500 mb-1">
                            Định dạng
                        </label>
                        <select
                            value={formatType}
                            onChange={(e) =>
                                setFormatType(e.target.value as FormatType)
                            }
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                        >
                            {FORMAT_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label} ({type.ext})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tab Width */}
                    <div className="w-24">
                        <label className="block text-xs text-neutral-500 mb-1">
                            Indent
                        </label>
                        <select
                            value={tabWidth}
                            onChange={(e) =>
                                setTabWidth(Number(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                        >
                            <option value={2}>2 spaces</option>
                            <option value={4}>4 spaces</option>
                        </select>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-end gap-4">
                        <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <input
                                type="checkbox"
                                checked={useTabs}
                                onChange={(e) => setUseTabs(e.target.checked)}
                                className="rounded"
                            />
                            Tabs
                        </label>
                        {(formatType === "javascript" ||
                            formatType === "typescript") && (
                            <>
                                <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    <input
                                        type="checkbox"
                                        checked={singleQuote}
                                        onChange={(e) =>
                                            setSingleQuote(e.target.checked)
                                        }
                                        className="rounded"
                                    />
                                    Single quotes
                                </label>
                                <label className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                    <input
                                        type="checkbox"
                                        checked={semi}
                                        onChange={(e) =>
                                            setSemi(e.target.checked)
                                        }
                                        className="rounded"
                                    />
                                    Semicolons
                                </label>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Editor Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-700/50 bg-neutral-50 dark:bg-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Input
                        </span>
                        <button
                            onClick={() => setInput("")}
                            className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        >
                            Clear
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your code here..."
                        className="w-full h-80 px-4 py-3 bg-transparent text-sm font-mono text-neutral-900 dark:text-white placeholder-neutral-400 resize-none focus:outline-none"
                        spellCheck={false}
                    />
                </div>

                {/* Output */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-700/50 bg-neutral-50 dark:bg-neutral-800">
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            Output
                        </span>
                        {output && (
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                            >
                                {copied ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                ) : (
                                    <Copy className="w-3 h-3" />
                                )}
                                Copy
                            </button>
                        )}
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        placeholder="Formatted output will appear here..."
                        className="w-full h-80 px-4 py-3 bg-transparent text-sm font-mono text-neutral-900 dark:text-white placeholder-neutral-400 resize-none focus:outline-none"
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleFormat}
                    disabled={loading || !input.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all font-medium shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Wand2
                        className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                    />
                    Format
                </button>
                <button
                    onClick={handleMinify}
                    disabled={!input.trim()}
                    className="px-6 py-3 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Minimize2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

// ============ Markdown Tab ============

function MarkdownTab() {
    const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Editor */}
            <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 overflow-hidden">
                <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700/50 bg-neutral-50 dark:bg-neutral-800">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        ✍️ Editor
                    </span>
                </div>
                <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    placeholder="Write your markdown here..."
                    className="w-full h-[500px] px-4 py-3 bg-transparent text-sm font-mono text-neutral-900 dark:text-white placeholder-neutral-400 resize-none focus:outline-none"
                    spellCheck={false}
                />
            </div>

            {/* Preview */}
            <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 overflow-hidden">
                <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700/50 bg-neutral-50 dark:bg-neutral-800">
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        👁️ Preview
                    </span>
                </div>
                <div className="h-[500px] overflow-auto px-4 py-3">
                    <article className="prose prose-neutral dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                code({ className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(
                                        className || ""
                                    );
                                    const inline = !match;
                                    return !inline ? (
                                        <SyntaxHighlighter
                                            style={oneDark}
                                            language={match[1]}
                                            PreTag="div"
                                            className="rounded-lg !my-3"
                                        >
                                            {String(children).replace(
                                                /\n$/,
                                                ""
                                            )}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code
                                            className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-sm"
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {markdown}
                        </ReactMarkdown>
                    </article>
                </div>
            </div>
        </div>
    );
}

const SAMPLE_MARKDOWN = `# Welcome to Markdown Preview 🎉

This is a **live preview** of your markdown content.

## Features

- ✅ GitHub Flavored Markdown (GFM)
- ✅ Syntax highlighting for code blocks
- ✅ Tables support
- ✅ Task lists

## Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

## Table Example

| Feature | Status |
|---------|--------|
| Headers | ✅ |
| Lists   | ✅ |
| Code    | ✅ |
| Tables  | ✅ |

## Task List

- [x] Create markdown preview
- [x] Add syntax highlighting
- [ ] Add more features

---

> **Tip:** Edit the markdown on the left to see live changes!
`;
