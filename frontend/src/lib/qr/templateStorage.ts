/**
 * QR Template Storage Utilities
 * Manages templates in localStorage with default presets
 */

import type { QRTemplate, QRStyleOptions, FrameOptions } from "@/types/qr";

const STORAGE_KEY = "qr-generator-templates";

// ============ Default Templates ============

export const DEFAULT_TEMPLATES: QRTemplate[] = [
    {
        id: "template-classic",
        name: "Classic",
        isDefault: true,
        createdAt: new Date().toISOString(),
        styleOptions: {
            dotStyle: "square",
            dotColor: "#000000",
            cornerSquareStyle: "square",
            cornerSquareColor: "#000000",
            cornerDotStyle: "square",
            cornerDotColor: "#000000",
            backgroundColor: "#ffffff",
            errorCorrectionLevel: "M",
            size: 300,
            margin: 10,
            logoSize: 0.2,
            logoMargin: 5,
        },
        frameOptions: {
            style: "none",
            caption: "",
            captionPosition: "bottom",
            captionColor: "#000000",
            captionFontSize: 16,
            backgroundColor: "#ffffff",
            borderColor: "#000000",
            borderRadius: 12,
            padding: 20,
        },
    },
    {
        id: "template-modern-blue",
        name: "Modern Blue",
        isDefault: true,
        createdAt: new Date().toISOString(),
        styleOptions: {
            dotStyle: "rounded",
            dotColor: "#3b82f6",
            dotGradient: {
                type: "linear",
                rotation: 45,
                colorStops: [
                    { offset: 0, color: "#3b82f6" },
                    { offset: 1, color: "#8b5cf6" },
                ],
            },
            cornerSquareStyle: "extra-rounded",
            cornerSquareColor: "#3b82f6",
            cornerDotStyle: "dot",
            cornerDotColor: "#8b5cf6",
            backgroundColor: "#ffffff",
            errorCorrectionLevel: "M",
            size: 300,
            margin: 10,
            logoSize: 0.2,
            logoMargin: 5,
        },
        frameOptions: {
            style: "simple",
            caption: "SCAN ME",
            captionPosition: "bottom",
            captionColor: "#3b82f6",
            captionFontSize: 16,
            backgroundColor: "#ffffff",
            borderColor: "#3b82f6",
            borderRadius: 16,
            padding: 24,
        },
    },
    {
        id: "template-business",
        name: "Business",
        isDefault: true,
        createdAt: new Date().toISOString(),
        styleOptions: {
            dotStyle: "classy",
            dotColor: "#374151",
            cornerSquareStyle: "square",
            cornerSquareColor: "#1f2937",
            cornerDotStyle: "square",
            cornerDotColor: "#1f2937",
            backgroundColor: "#ffffff",
            errorCorrectionLevel: "H",
            size: 300,
            margin: 15,
            logoSize: 0.25,
            logoMargin: 8,
        },
        frameOptions: {
            style: "badge",
            caption: "",
            captionPosition: "bottom",
            captionColor: "#374151",
            captionFontSize: 14,
            backgroundColor: "#f9fafb",
            borderColor: "#e5e7eb",
            borderRadius: 8,
            padding: 16,
        },
    },
    {
        id: "template-playful",
        name: "Playful",
        isDefault: true,
        createdAt: new Date().toISOString(),
        styleOptions: {
            dotStyle: "dots",
            dotColor: "#ec4899",
            dotGradient: {
                type: "radial",
                colorStops: [
                    { offset: 0, color: "#f472b6" },
                    { offset: 1, color: "#8b5cf6" },
                ],
            },
            cornerSquareStyle: "dot",
            cornerSquareColor: "#8b5cf6",
            cornerDotStyle: "dot",
            cornerDotColor: "#ec4899",
            backgroundColor: "#fdf4ff",
            errorCorrectionLevel: "M",
            size: 300,
            margin: 10,
            logoSize: 0.2,
            logoMargin: 5,
        },
        frameOptions: {
            style: "sticker",
            caption: "✨ SCAN ME ✨",
            captionPosition: "bottom",
            captionColor: "#ec4899",
            captionFontSize: 18,
            backgroundColor: "#fdf4ff",
            borderColor: "#f0abfc",
            borderRadius: 24,
            padding: 28,
        },
    },
    {
        id: "template-elegant",
        name: "Elegant",
        isDefault: true,
        createdAt: new Date().toISOString(),
        styleOptions: {
            dotStyle: "extra-rounded",
            dotColor: "#92400e",
            dotGradient: {
                type: "linear",
                rotation: 135,
                colorStops: [
                    { offset: 0, color: "#fbbf24" },
                    { offset: 0.5, color: "#d97706" },
                    { offset: 1, color: "#92400e" },
                ],
            },
            cornerSquareStyle: "extra-rounded",
            cornerSquareColor: "#92400e",
            cornerDotStyle: "dot",
            cornerDotColor: "#fbbf24",
            backgroundColor: "#1c1917",
            errorCorrectionLevel: "Q",
            size: 300,
            margin: 12,
            logoSize: 0.2,
            logoMargin: 5,
        },
        frameOptions: {
            style: "rounded",
            caption: "SCAN",
            captionPosition: "bottom",
            captionColor: "#fbbf24",
            captionFontSize: 16,
            backgroundColor: "#1c1917",
            borderColor: "#92400e",
            borderRadius: 20,
            padding: 24,
        },
    },
];

// ============ Storage Functions ============

export function getTemplates(): QRTemplate[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const userTemplates = JSON.parse(stored) as QRTemplate[];
            return [...DEFAULT_TEMPLATES, ...userTemplates];
        }
    } catch (error) {
        console.error("Failed to load templates:", error);
    }
    return DEFAULT_TEMPLATES;
}

export function getUserTemplates(): QRTemplate[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as QRTemplate[];
        }
    } catch (error) {
        console.error("Failed to load user templates:", error);
    }
    return [];
}

export function saveTemplate(
    name: string,
    styleOptions: QRStyleOptions,
    frameOptions: FrameOptions
): QRTemplate {
    const newTemplate: QRTemplate = {
        id: `template-${Date.now()}`,
        name,
        isDefault: false,
        createdAt: new Date().toISOString(),
        styleOptions,
        frameOptions,
    };

    const userTemplates = getUserTemplates();
    userTemplates.push(newTemplate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates));

    return newTemplate;
}

export function deleteTemplate(id: string): boolean {
    const userTemplates = getUserTemplates();
    const filtered = userTemplates.filter((t) => t.id !== id);

    if (filtered.length < userTemplates.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    }
    return false;
}

export function updateTemplate(
    id: string,
    updates: Partial<Omit<QRTemplate, "id" | "isDefault" | "createdAt">>
): QRTemplate | null {
    const userTemplates = getUserTemplates();
    const index = userTemplates.findIndex((t) => t.id === id);

    if (index !== -1) {
        userTemplates[index] = { ...userTemplates[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userTemplates));
        return userTemplates[index];
    }
    return null;
}
