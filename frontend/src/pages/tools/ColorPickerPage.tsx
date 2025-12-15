import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Palette,
    Copy,
    Check,
    RefreshCw,
    Pipette,
} from "lucide-react";
import toast from "react-hot-toast";

import {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    rgbToHsv,
    rgbToCmyk,
    formatRgb,
    formatRgba,
    formatHsl,
    formatHsla,
    formatCmyk,
    hexToHexa,
    generatePalette,
    getTextColor,
    randomHex,
    type PaletteType,
    type RGB,
} from "@/lib/color";

const PALETTE_TYPES: { value: PaletteType; label: string }[] = [
    { value: "complementary", label: "Complementary" },
    { value: "analogous", label: "Analogous" },
    { value: "triadic", label: "Triadic" },
    { value: "split-complementary", label: "Split Complementary" },
    { value: "tetradic", label: "Tetradic (Square)" },
    { value: "monochromatic", label: "Monochromatic" },
];

export default function ColorPickerPage() {
    const [hex, setHex] = useState("#6366F1");
    const [alpha, setAlpha] = useState(1);
    const [paletteType, setPaletteType] = useState<PaletteType>("analogous");
    const [palette, setPalette] = useState<string[]>([]);

    // Derived color values
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const hsv = rgbToHsv(rgb);
    const cmyk = rgbToCmyk(rgb);
    const textColor = getTextColor(hex);

    // Update palette when color or type changes
    useEffect(() => {
        setPalette(generatePalette(hex, paletteType));
    }, [hex, paletteType]);

    const handleHexChange = (value: string) => {
        const clean = value.replace(/[^0-9A-Fa-f#]/g, "");
        if (clean.length <= 7) {
            setHex(clean.startsWith("#") ? clean : `#${clean}`);
        }
    };

    const handleRgbChange = (channel: keyof RGB, value: number) => {
        const newRgb = { ...rgb, [channel]: Math.min(255, Math.max(0, value)) };
        setHex(rgbToHex(newRgb));
    };

    const handleRandomize = () => {
        setHex(randomHex());
    };

    const handleEyeDropper = async () => {
        if ("EyeDropper" in window) {
            try {
                // @ts-expect-error - EyeDropper API not in TypeScript yet
                const eyeDropper = new window.EyeDropper();
                const result = await eyeDropper.open();
                setHex(result.sRGBHex.toUpperCase());
            } catch {
                // User cancelled
            }
        } else {
            toast.error("EyeDropper không được hỗ trợ trên trình duyệt này");
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
                    <Link
                        to="/tools"
                        className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-500" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
                            <Palette className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Color Picker
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Color Preview & Picker */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Color Preview */}
                    <div
                        className="h-48 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300"
                        style={{ backgroundColor: hex }}
                    >
                        <span
                            className="text-4xl font-bold"
                            style={{ color: textColor }}
                        >
                            {hex}
                        </span>
                    </div>

                    {/* Color Controls */}
                    <div className="bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700/50 p-4 space-y-4">
                        {/* HEX Input */}
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1">
                                HEX
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={hex}
                                    onChange={(e) =>
                                        setHex(e.target.value.toUpperCase())
                                    }
                                    className="w-12 h-10 rounded-lg cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={hex}
                                    onChange={(e) =>
                                        handleHexChange(e.target.value)
                                    }
                                    className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg font-mono uppercase"
                                    maxLength={7}
                                />
                                <button
                                    onClick={handleEyeDropper}
                                    className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                                    title="Pick from screen"
                                >
                                    <Pipette className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                                </button>
                                <button
                                    onClick={handleRandomize}
                                    className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                                    title="Random color"
                                >
                                    <RefreshCw className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                                </button>
                            </div>
                        </div>

                        {/* RGB Sliders */}
                        <div className="space-y-2">
                            <RgbSlider
                                label="R"
                                value={rgb.r}
                                color="#EF4444"
                                onChange={(v) => handleRgbChange("r", v)}
                            />
                            <RgbSlider
                                label="G"
                                value={rgb.g}
                                color="#22C55E"
                                onChange={(v) => handleRgbChange("g", v)}
                            />
                            <RgbSlider
                                label="B"
                                value={rgb.b}
                                color="#3B82F6"
                                onChange={(v) => handleRgbChange("b", v)}
                            />
                            {/* Alpha Slider */}
                            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-600">
                                <span className="w-4 text-xs font-medium text-neutral-500">
                                    A
                                </span>
                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={Math.round(alpha * 100)}
                                    onChange={(e) =>
                                        setAlpha(Number(e.target.value) / 100)
                                    }
                                    className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, transparent, ${hex})`,
                                    }}
                                />
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={Math.round(alpha * 100)}
                                    onChange={(e) =>
                                        setAlpha(
                                            Math.min(
                                                100,
                                                Math.max(
                                                    0,
                                                    Number(e.target.value)
                                                )
                                            ) / 100
                                        )
                                    }
                                    className="w-14 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-xs text-center"
                                />
                                <span className="text-xs text-neutral-400">
                                    %
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Color Formats */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                    <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                        Định dạng màu
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <ColorFormat label="HEX" value={hex} />
                        <ColorFormat
                            label="HEXA"
                            value={hexToHexa(hex, alpha)}
                        />
                        <ColorFormat label="RGB" value={formatRgb(rgb)} />
                        <ColorFormat
                            label="RGBA"
                            value={formatRgba(rgb, alpha)}
                        />
                        <ColorFormat label="HSL" value={formatHsl(hsl)} />
                        <ColorFormat
                            label="HSLA"
                            value={formatHsla(hsl, alpha)}
                        />
                        <ColorFormat
                            label="HSV"
                            value={`hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`}
                        />
                        <ColorFormat label="CMYK" value={formatCmyk(cmyk)} />
                        <ColorFormat
                            label="CSS Variable"
                            value={`--color: ${hex};`}
                        />
                        <ColorFormat label="Tailwind" value={`bg-[${hex}]`} />
                        <ColorFormat
                            label="RGB Values"
                            value={`${rgb.r}, ${rgb.g}, ${rgb.b}`}
                        />
                        <ColorFormat
                            label="RGBA Values"
                            value={`${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha}`}
                        />
                    </div>
                </div>

                {/* Palette Generator */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Palette Generator
                        </h3>
                        <select
                            value={paletteType}
                            onChange={(e) =>
                                setPaletteType(e.target.value as PaletteType)
                            }
                            className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
                        >
                            {PALETTE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex rounded-xl overflow-hidden">
                        {palette.map((color, idx) => (
                            <PaletteColor key={idx} hex={color} />
                        ))}
                    </div>
                </div>

                {/* Shades & Tints */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                    <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                        Shades & Tints
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <div className="text-xs text-neutral-500 mb-1">
                                Tints (lighter)
                            </div>
                            <div className="flex rounded-xl overflow-hidden">
                                {[90, 80, 70, 60, 50].map((l) => {
                                    const tintHex = rgbToHex({
                                        r:
                                            rgb.r +
                                            (255 - rgb.r) * ((l - 50) / 50),
                                        g:
                                            rgb.g +
                                            (255 - rgb.g) * ((l - 50) / 50),
                                        b:
                                            rgb.b +
                                            (255 - rgb.b) * ((l - 50) / 50),
                                    });
                                    return (
                                        <PaletteColor key={l} hex={tintHex} />
                                    );
                                })}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-neutral-500 mb-1">
                                Shades (darker)
                            </div>
                            <div className="flex rounded-xl overflow-hidden">
                                {[50, 40, 30, 20, 10].map((l) => {
                                    const shadeHex = rgbToHex({
                                        r: rgb.r * (l / 50),
                                        g: rgb.g * (l / 50),
                                        b: rgb.b * (l / 50),
                                    });
                                    return (
                                        <PaletteColor key={l} hex={shadeHex} />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ Helper Components ============

function RgbSlider({
    label,
    value,
    color,
    onChange,
}: {
    label: string;
    value: number;
    color: string;
    onChange: (value: number) => void;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="w-4 text-xs font-medium" style={{ color }}>
                {label}
            </span>
            <input
                type="range"
                min={0}
                max={255}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                style={{
                    background: `linear-gradient(to right, ${color}00, ${color})`,
                }}
            />
            <input
                type="number"
                min={0}
                max={255}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-14 px-2 py-1 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded text-xs text-center"
            />
        </div>
    );
}

function ColorFormat({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success("Đã sao chép!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            onClick={handleCopy}
            className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
            <div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-wide">
                    {label}
                </div>
                <div className="text-sm font-mono text-neutral-900 dark:text-white truncate">
                    {value}
                </div>
            </div>
            {copied ? (
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
                <Copy className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            )}
        </div>
    );
}

function PaletteColor({ hex }: { hex: string }) {
    const [copied, setCopied] = useState(false);
    const textColor = getTextColor(hex);

    const handleCopy = () => {
        navigator.clipboard.writeText(hex);
        setCopied(true);
        toast.success(`Đã sao chép ${hex}`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="flex-1 h-16 flex items-center justify-center transition-transform hover:scale-105 hover:z-10"
            style={{ backgroundColor: hex }}
            title={hex}
        >
            {copied ? (
                <Check className="w-4 h-4" style={{ color: textColor }} />
            ) : (
                <span
                    className="text-xs font-mono opacity-0 hover:opacity-100 transition-opacity"
                    style={{ color: textColor }}
                >
                    {hex}
                </span>
            )}
        </button>
    );
}
