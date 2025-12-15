/**
 * Color utilities for conversion and palette generation
 */

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface HSL {
    h: number;
    s: number;
    l: number;
}

export interface HSV {
    h: number;
    s: number;
    v: number;
}

export interface CMYK {
    c: number;
    m: number;
    y: number;
    k: number;
}

// ============ HEX Conversions ============

export function hexToRgb(hex: string): RGB {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

export function rgbToHex(rgb: RGB): string {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

// ============ HSL Conversions ============

export function rgbToHsl(rgb: RGB): HSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
        return { h: 0, s: 0, l: Math.round(l * 100) };
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h = 0;
    switch (max) {
        case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
        case g:
            h = ((b - r) / d + 2) / 6;
            break;
        case b:
            h = ((r - g) / d + 4) / 6;
            break;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

export function hslToRgb(hsl: HSL): RGB {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    if (s === 0) {
        const v = Math.round(l * 255);
        return { r: v, g: v, b: v };
    }

    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
        r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
}

// ============ HSV Conversions ============

export function rgbToHsv(rgb: RGB): HSV {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100),
    };
}

// ============ CMYK Conversions ============

export function rgbToCmyk(rgb: RGB): CMYK {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const k = 1 - Math.max(r, g, b);
    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 };
    }

    return {
        c: Math.round(((1 - r - k) / (1 - k)) * 100),
        m: Math.round(((1 - g - k) / (1 - k)) * 100),
        y: Math.round(((1 - b - k) / (1 - k)) * 100),
        k: Math.round(k * 100),
    };
}

// ============ RGBA / HSLA with Alpha ============

export interface RGBA extends RGB {
    a: number; // 0-1
}

export interface HSLA extends HSL {
    a: number; // 0-1
}

export function formatRgba(rgb: RGB, alpha: number = 1): string {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function formatHsla(hsl: HSL, alpha: number = 1): string {
    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`;
}

export function hexToRgba(hex: string, alpha: number = 1): RGBA {
    const rgb = hexToRgb(hex);
    return { ...rgb, a: alpha };
}

export function rgbaToHex(rgba: RGBA): string {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
    const alphaHex = Math.round(rgba.a * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}${alphaHex}`.toUpperCase();
}

// ============ HEX with Alpha (8 character) ============

export function hexToHexa(hex: string, alpha: number = 1): string {
    const clean = hex.replace("#", "").substring(0, 6);
    const alphaHex = Math.round(alpha * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${clean}${alphaHex}`.toUpperCase();
}

// ============ Format Strings ============

export function formatRgb(rgb: RGB): string {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function formatHsl(hsl: HSL): string {
    return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

export function formatCmyk(cmyk: CMYK): string {
    return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
}

// ============ Palette Generation ============

export type PaletteType =
    | "complementary"
    | "analogous"
    | "triadic"
    | "split-complementary"
    | "tetradic"
    | "monochromatic";

export function generatePalette(hex: string, type: PaletteType): string[] {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);

    const rotateHue = (h: number, degrees: number): number => {
        return (h + degrees + 360) % 360;
    };

    const hslToHex = (h: number, s: number, l: number): string => {
        return rgbToHex(hslToRgb({ h, s, l }));
    };

    switch (type) {
        case "complementary":
            return [hex, hslToHex(rotateHue(hsl.h, 180), hsl.s, hsl.l)];

        case "analogous":
            return [
                hslToHex(rotateHue(hsl.h, -30), hsl.s, hsl.l),
                hex,
                hslToHex(rotateHue(hsl.h, 30), hsl.s, hsl.l),
            ];

        case "triadic":
            return [
                hex,
                hslToHex(rotateHue(hsl.h, 120), hsl.s, hsl.l),
                hslToHex(rotateHue(hsl.h, 240), hsl.s, hsl.l),
            ];

        case "split-complementary":
            return [
                hex,
                hslToHex(rotateHue(hsl.h, 150), hsl.s, hsl.l),
                hslToHex(rotateHue(hsl.h, 210), hsl.s, hsl.l),
            ];

        case "tetradic":
            return [
                hex,
                hslToHex(rotateHue(hsl.h, 90), hsl.s, hsl.l),
                hslToHex(rotateHue(hsl.h, 180), hsl.s, hsl.l),
                hslToHex(rotateHue(hsl.h, 270), hsl.s, hsl.l),
            ];

        case "monochromatic":
            return [
                hslToHex(hsl.h, hsl.s, 20),
                hslToHex(hsl.h, hsl.s, 40),
                hex,
                hslToHex(hsl.h, hsl.s, 70),
                hslToHex(hsl.h, hsl.s, 90),
            ];

        default:
            return [hex];
    }
}

// ============ Contrast & Accessibility ============

export function getLuminance(rgb: RGB): number {
    const a = [rgb.r, rgb.g, rgb.b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(hex1: string, hex2: string): number {
    const lum1 = getLuminance(hexToRgb(hex1));
    const lum2 = getLuminance(hexToRgb(hex2));
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

export function getTextColor(bgHex: string): string {
    const rgb = hexToRgb(bgHex);
    const luminance = getLuminance(rgb);
    return luminance > 0.179 ? "#000000" : "#FFFFFF";
}

// ============ Random Color ============

export function randomHex(): string {
    return (
        "#" +
        Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")
            .toUpperCase()
    );
}
