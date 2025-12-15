import { Link } from "react-router-dom";
import {
    QrCode,
    Palette,
    Calculator,
    FileCode,
    CreditCard,
    Key,
    Calendar,
} from "lucide-react";

interface Tool {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    href: string;
    gradient: string;
    available: boolean;
}

const tools: Tool[] = [
    {
        id: "code-formatter",
        name: "Code Formatter",
        description: "Format code & Markdown preview với hỗ trợ 11 ngôn ngữ",
        icon: FileCode,
        href: "/tools/formatter",
        gradient: "from-cyan-500 to-blue-600",
        available: true,
    },
    {
        id: "lunar-calendar",
        name: "Lịch Việt Nam",
        description: "Lịch dương - âm lịch với ngày lễ Việt Nam",
        icon: Calendar,
        href: "/tools/calendar",
        gradient: "from-red-500 to-orange-600",
        available: true,
    },
    {
        id: "crypto-toolbox",
        name: "Generate Key Tool",
        description:
            "Key generation, JWT, encoding/decoding, và các công cụ mã hóa",
        icon: Key,
        href: "/tools/crypto",
        gradient: "from-violet-500 to-purple-600",
        available: true,
    },
    {
        id: "vietqr",
        name: "VietQR",
        description: "Tạo mã QR chuyển khoản ngân hàng theo chuẩn VietQR",
        icon: CreditCard,
        href: "/tools/vietqr",
        gradient: "from-emerald-500 to-teal-600",
        available: true,
    },
    {
        id: "qr-generator",
        name: "QR Generator",
        description:
            "Create custom QR codes with advanced styling, frames, and multiple payload types",
        icon: QrCode,
        href: "/tools/qr-generator",
        gradient: "from-blue-500 to-purple-600",
        available: true,
    },
    {
        id: "color-picker",
        name: "Color Picker",
        description:
            "Pick colors, generate palettes, and convert between formats",
        icon: Palette,
        href: "/tools/color-picker",
        gradient: "from-pink-500 to-orange-500",
        available: true,
    },
];

export default function ToolsPage() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Tools
                    </h1>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ToolCard({ tool }: { tool: Tool }) {
    const Icon = tool.icon;

    if (!tool.available) {
        return (
            <div className="relative bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4 opacity-40 cursor-not-allowed text-center">
                <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-500 rounded">
                    Soon
                </span>
                <div
                    className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-2`}
                >
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {tool.name}
                </span>
            </div>
        );
    }

    return (
        <Link
            to={tool.href}
            className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4 
                       hover:border-primary-300 dark:hover:border-primary-500/50 hover:shadow-sm transition-all duration-200 text-center"
        >
            <div
                className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-2`}
            >
                <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {tool.name}
            </span>
        </Link>
    );
}
