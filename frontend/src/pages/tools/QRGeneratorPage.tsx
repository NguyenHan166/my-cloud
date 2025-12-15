import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Download,
    Save,
    Link as LinkIcon,
    Type,
    Mail,
    Phone,
    MessageSquare,
    MessageCircle,
    Wifi,
    User,
    MapPin,
    Calendar,
    Image as ImageIcon,
    Trash2,
} from "lucide-react";
import QRCodeStyling, {
    type Options as QROptions,
    type DotType,
    type CornerSquareType,
    type CornerDotType,
} from "qr-code-styling";
import { PDFDocument } from "pdf-lib";
import type {
    QRPayload,
    PayloadType,
    QRStyleOptions,
    FrameOptions,
    QRTemplate,
    DotStyle,
    CornerSquareStyle,
    CornerDotStyle,
    LogoShape,
} from "@/types/qr";
import { DEFAULT_STYLE_OPTIONS, DEFAULT_FRAME_OPTIONS } from "@/types/qr";
import {
    buildPayloadString,
    getInitialPayload,
} from "@/lib/qr/payloadBuilders";
import {
    getTemplates,
    saveTemplate,
    deleteTemplate,
} from "@/lib/qr/templateStorage";

// ============ Logo Shape Processing ============

const processLogoWithShape = (
    logoSrc: string,
    shape: LogoShape
): Promise<string> => {
    return new Promise((resolve) => {
        if (shape === "square") {
            resolve(logoSrc);
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const size = Math.min(img.width, img.height);
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(logoSrc);
                return;
            }

            ctx.beginPath();
            if (shape === "circle") {
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            } else if (shape === "rounded") {
                const radius = size * 0.15;
                ctx.roundRect(0, 0, size, size, radius);
            }
            ctx.closePath();
            ctx.clip();

            // Center the image if not square
            const offsetX = (img.width - size) / 2;
            const offsetY = (img.height - size) / 2;
            ctx.drawImage(img, -offsetX, -offsetY, img.width, img.height);

            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve(logoSrc);
        img.src = logoSrc;
    });
};

// ============ Payload Type Config ============

const PAYLOAD_TYPES: {
    type: PayloadType;
    label: string;
    icon: React.ElementType;
}[] = [
    { type: "url", label: "URL", icon: LinkIcon },
    { type: "text", label: "Text", icon: Type },
    { type: "email", label: "Email", icon: Mail },
    { type: "phone", label: "Phone", icon: Phone },
    { type: "sms", label: "SMS", icon: MessageSquare },
    { type: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { type: "wifi", label: "WiFi", icon: Wifi },
    { type: "vcard", label: "vCard", icon: User },
    { type: "geo", label: "Location", icon: MapPin },
    { type: "calendar", label: "Event", icon: Calendar },
];

// ============ Main Component ============

export default function QRGeneratorPage() {
    // State
    const [payload, setPayload] = useState<QRPayload>(getInitialPayload("url"));
    const [styleOptions, setStyleOptions] = useState<QRStyleOptions>(
        DEFAULT_STYLE_OPTIONS
    );
    const [frameOptions, setFrameOptions] = useState<FrameOptions>(
        DEFAULT_FRAME_OPTIONS
    );
    const [templates, setTemplates] = useState<QRTemplate[]>([]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [processedLogo, setProcessedLogo] = useState<string | undefined>();

    // QR Code ref
    const qrRef = useRef<HTMLDivElement>(null);
    const qrCodeRef = useRef<QRCodeStyling | null>(null);

    // Load templates
    useEffect(() => {
        setTemplates(getTemplates());
    }, []);

    // Process logo with shape
    useEffect(() => {
        if (!styleOptions.logo) {
            setProcessedLogo(undefined);
            return;
        }

        const shape = styleOptions.logoShape || "square";
        processLogoWithShape(styleOptions.logo, shape).then(setProcessedLogo);
    }, [styleOptions.logo, styleOptions.logoShape]);

    // Build QR data string
    const qrData = buildPayloadString(payload);

    // Convert style options to qr-code-styling options
    const getQROptions = useCallback((): QROptions => {
        const options: QROptions = {
            width: styleOptions.size,
            height: styleOptions.size,
            margin: styleOptions.margin,
            data: qrData || "https://example.com",
            dotsOptions: {
                type: styleOptions.dotStyle as DotType,
                color: styleOptions.dotColor,
            },
            cornersSquareOptions: {
                type: styleOptions.cornerSquareStyle as CornerSquareType,
                color: styleOptions.cornerSquareColor,
            },
            cornersDotOptions: {
                type: styleOptions.cornerDotStyle as CornerDotType,
                color: styleOptions.cornerDotColor,
            },
            backgroundOptions: {
                color: styleOptions.backgroundColor,
            },
            qrOptions: {
                errorCorrectionLevel: styleOptions.errorCorrectionLevel,
            },
        };

        // Add gradients if defined
        if (styleOptions.dotGradient) {
            options.dotsOptions!.gradient = {
                type: styleOptions.dotGradient.type,
                rotation: styleOptions.dotGradient.rotation || 0,
                colorStops: styleOptions.dotGradient.colorStops,
            };
        }

        if (styleOptions.cornerSquareGradient) {
            options.cornersSquareOptions!.gradient = {
                type: styleOptions.cornerSquareGradient.type,
                rotation: styleOptions.cornerSquareGradient.rotation || 0,
                colorStops: styleOptions.cornerSquareGradient.colorStops,
            };
        }

        // Add logo if defined (use processed logo with shape applied)
        if (processedLogo) {
            options.image = processedLogo;
            options.imageOptions = {
                crossOrigin: "anonymous",
                margin: styleOptions.logoMargin || 5,
                imageSize: styleOptions.logoSize || 0.2,
            };
        }

        return options;
    }, [qrData, styleOptions, processedLogo]);

    // Initialize and update QR code
    useEffect(() => {
        if (!qrRef.current) return;

        const options = getQROptions();

        if (!qrCodeRef.current) {
            qrCodeRef.current = new QRCodeStyling(options);
            qrCodeRef.current.append(qrRef.current);
        } else {
            qrCodeRef.current.update(options);
        }
    }, [getQROptions]);

    // Handle payload type change
    const handlePayloadTypeChange = (type: PayloadType) => {
        setPayload(getInitialPayload(type));
    };

    // Handle template apply
    const handleApplyTemplate = (template: QRTemplate) => {
        setStyleOptions(template.styleOptions);
        setFrameOptions(template.frameOptions);
    };

    // Handle template save
    const handleSaveTemplate = () => {
        if (!templateName.trim()) return;
        saveTemplate(templateName, styleOptions, frameOptions);
        setTemplates(getTemplates());
        setShowSaveModal(false);
        setTemplateName("");
    };

    // Handle template delete
    const handleDeleteTemplate = (id: string) => {
        deleteTemplate(id);
        setTemplates(getTemplates());
    };

    // Handle logo upload
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setStyleOptions((prev) => ({
                ...prev,
                logo: reader.result as string,
                errorCorrectionLevel: "H", // Increase error correction when using logo
            }));
        };
        reader.readAsDataURL(file);
    };

    // Export functions
    const handleExportPNG = async () => {
        if (!qrCodeRef.current) return;
        const blob = await qrCodeRef.current.getRawData("png");
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "qr-code.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportSVG = async () => {
        if (!qrCodeRef.current) return;
        const blob = await qrCodeRef.current.getRawData("svg");
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "qr-code.svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = async () => {
        if (!qrCodeRef.current) return;

        // Get PNG blob
        const blob = await qrCodeRef.current.getRawData("png");
        if (!blob) return;

        // Create PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points

        // Embed image
        const imageBytes = await blob.arrayBuffer();
        const image = await pdfDoc.embedPng(imageBytes);

        // Calculate centered position
        const { width, height } = page.getSize();
        const imgSize = 300;
        const x = (width - imgSize) / 2;
        const y = (height - imgSize) / 2;

        page.drawImage(image, {
            x,
            y,
            width: imgSize,
            height: imgSize,
        });

        // Download PDF
        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
            type: "application/pdf",
        });
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "qr-code.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/tools"
                            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-neutral-500" />
                        </Link>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            QR Generator
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Save</span>
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel */}
                    <div className="space-y-4">
                        {/* Payload Type Selector */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                                Type
                            </h2>
                            <div className="flex flex-wrap gap-1.5">
                                {PAYLOAD_TYPES.map(
                                    ({ type, label, icon: Icon }) => (
                                        <button
                                            key={type}
                                            onClick={() =>
                                                handlePayloadTypeChange(type)
                                            }
                                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all
                                        ${
                                            payload.type === type
                                                ? "bg-primary-500 text-white"
                                                : "bg-neutral-100 dark:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                        }`}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            {label}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Payload Form */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                                Content
                            </h2>
                            <PayloadForm
                                payload={payload}
                                onChange={setPayload}
                            />
                        </div>

                        {/* Style Options */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                                Style
                            </h2>
                            <StyleEditor
                                options={styleOptions}
                                onChange={setStyleOptions}
                                onLogoUpload={handleLogoUpload}
                            />
                        </div>

                        {/* Frame Options */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                                Frame
                            </h2>
                            <FrameEditor
                                options={frameOptions}
                                onChange={setFrameOptions}
                            />
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="space-y-4">
                        {/* QR Preview */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                                Preview
                            </h2>
                            <div className="flex justify-center overflow-hidden">
                                <div
                                    className="relative p-3 rounded-lg max-w-full"
                                    style={{
                                        backgroundColor:
                                            frameOptions.style !== "none"
                                                ? frameOptions.backgroundColor
                                                : "transparent",
                                        border:
                                            frameOptions.style !== "none"
                                                ? `2px solid ${frameOptions.borderColor}`
                                                : "none",
                                        borderRadius: frameOptions.borderRadius,
                                        padding:
                                            frameOptions.style !== "none"
                                                ? frameOptions.padding
                                                : 16,
                                    }}
                                >
                                    {/* Caption Top */}
                                    {frameOptions.style !== "none" &&
                                        frameOptions.caption &&
                                        frameOptions.captionPosition ===
                                            "top" && (
                                            <div
                                                className="text-center font-bold mb-3"
                                                style={{
                                                    color: frameOptions.captionColor,
                                                    fontSize:
                                                        frameOptions.captionFontSize,
                                                }}
                                            >
                                                {frameOptions.caption}
                                            </div>
                                        )}

                                    {/* QR Code */}
                                    <div
                                        ref={qrRef}
                                        className="flex justify-center [&>canvas]:max-w-full [&>canvas]:h-auto [&>svg]:max-w-full [&>svg]:h-auto"
                                    />

                                    {/* Caption Bottom */}
                                    {frameOptions.style !== "none" &&
                                        frameOptions.caption &&
                                        frameOptions.captionPosition ===
                                            "bottom" && (
                                            <div
                                                className="text-center font-bold mt-3"
                                                style={{
                                                    color: frameOptions.captionColor,
                                                    fontSize:
                                                        frameOptions.captionFontSize,
                                                }}
                                            >
                                                {frameOptions.caption}
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>

                        {/* Export Buttons */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                                Export
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExportPNG}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                >
                                    <Download className="w-4 h-4" /> PNG
                                </button>
                                <button
                                    onClick={handleExportSVG}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                                >
                                    <Download className="w-4 h-4" /> SVG
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                >
                                    <Download className="w-4 h-4" /> PDF
                                </button>
                            </div>
                        </div>

                        {/* Templates */}
                        <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50 p-4">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                                Templates
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="relative group"
                                    >
                                        <button
                                            onClick={() =>
                                                handleApplyTemplate(template)
                                            }
                                            className="w-full p-3 bg-neutral-100 dark:bg-neutral-700/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
                                        >
                                            <div
                                                className="w-8 h-8 rounded mb-2"
                                                style={{
                                                    background: template
                                                        .styleOptions
                                                        .dotGradient
                                                        ? `linear-gradient(135deg, ${template.styleOptions.dotGradient.colorStops
                                                              .map(
                                                                  (s) => s.color
                                                              )
                                                              .join(", ")})`
                                                        : template.styleOptions
                                                              .dotColor,
                                                }}
                                            />
                                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                {template.name}
                                            </span>
                                        </button>
                                        {!template.isDefault && (
                                            <button
                                                onClick={() =>
                                                    handleDeleteTemplate(
                                                        template.id
                                                    )
                                                }
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Template Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                            Save Template
                        </h3>
                        <input
                            type="text"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            placeholder="Template name"
                            className="w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="flex-1 px-4 py-3 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTemplate}
                                disabled={!templateName.trim()}
                                className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ============ Payload Form Component ============

interface PayloadFormProps {
    payload: QRPayload;
    onChange: (payload: QRPayload) => void;
}

function PayloadForm({ payload, onChange }: PayloadFormProps) {
    const inputClass =
        "w-full px-4 py-3 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500";
    const labelClass =
        "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2";

    switch (payload.type) {
        case "url":
            return (
                <div>
                    <label className={labelClass}>URL</label>
                    <input
                        type="url"
                        value={payload.url}
                        onChange={(e) =>
                            onChange({ ...payload, url: e.target.value })
                        }
                        placeholder="https://example.com"
                        className={inputClass}
                    />
                </div>
            );

        case "text":
            return (
                <div>
                    <label className={labelClass}>Text</label>
                    <textarea
                        value={payload.text}
                        onChange={(e) =>
                            onChange({ ...payload, text: e.target.value })
                        }
                        placeholder="Enter your text..."
                        rows={4}
                        className={inputClass}
                    />
                </div>
            );

        case "email":
            return (
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>To</label>
                        <input
                            type="email"
                            value={payload.to}
                            onChange={(e) =>
                                onChange({ ...payload, to: e.target.value })
                            }
                            placeholder="email@example.com"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Subject (optional)</label>
                        <input
                            type="text"
                            value={payload.subject || ""}
                            onChange={(e) =>
                                onChange({
                                    ...payload,
                                    subject: e.target.value,
                                })
                            }
                            placeholder="Email subject"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Body (optional)</label>
                        <textarea
                            value={payload.body || ""}
                            onChange={(e) =>
                                onChange({ ...payload, body: e.target.value })
                            }
                            placeholder="Email body"
                            rows={3}
                            className={inputClass}
                        />
                    </div>
                </div>
            );

        case "phone":
            return (
                <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                        type="tel"
                        value={payload.number}
                        onChange={(e) =>
                            onChange({ ...payload, number: e.target.value })
                        }
                        placeholder="+1234567890"
                        className={inputClass}
                    />
                </div>
            );

        case "sms":
            return (
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Phone Number</label>
                        <input
                            type="tel"
                            value={payload.number}
                            onChange={(e) =>
                                onChange({ ...payload, number: e.target.value })
                            }
                            placeholder="+1234567890"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Message (optional)</label>
                        <textarea
                            value={payload.message || ""}
                            onChange={(e) =>
                                onChange({
                                    ...payload,
                                    message: e.target.value,
                                })
                            }
                            placeholder="Your message"
                            rows={3}
                            className={inputClass}
                        />
                    </div>
                </div>
            );

        case "whatsapp":
            return (
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>
                            Phone Number (with country code)
                        </label>
                        <input
                            type="tel"
                            value={payload.number}
                            onChange={(e) =>
                                onChange({ ...payload, number: e.target.value })
                            }
                            placeholder="1234567890"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Message (optional)</label>
                        <textarea
                            value={payload.message || ""}
                            onChange={(e) =>
                                onChange({
                                    ...payload,
                                    message: e.target.value,
                                })
                            }
                            placeholder="Your message"
                            rows={3}
                            className={inputClass}
                        />
                    </div>
                </div>
            );

        case "wifi":
            return (
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>
                            Network Name (SSID)
                        </label>
                        <input
                            type="text"
                            value={payload.ssid}
                            onChange={(e) =>
                                onChange({ ...payload, ssid: e.target.value })
                            }
                            placeholder="WiFi network name"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Password</label>
                        <input
                            type="text"
                            value={payload.password || ""}
                            onChange={(e) =>
                                onChange({
                                    ...payload,
                                    password: e.target.value,
                                })
                            }
                            placeholder="WiFi password"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Encryption</label>
                        <select
                            value={payload.encryption}
                            onChange={(e) =>
                                onChange({
                                    ...payload,
                                    encryption: e.target.value as
                                        | "WPA"
                                        | "WEP"
                                        | "nopass",
                                })
                            }
                            className={inputClass}
                        >
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">No Password</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="hidden"
                            checked={payload.hidden || false}
                            onChange={(e) =>
                                onChange({
                                    ...payload,
                                    hidden: e.target.checked,
                                })
                            }
                            className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        />
                        <label
                            htmlFor="hidden"
                            className="text-sm text-neutral-700 dark:text-neutral-300"
                        >
                            Hidden network
                        </label>
                    </div>
                </div>
            );

        case "vcard":
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>First Name</label>
                            <input
                                type="text"
                                value={payload.firstName}
                                onChange={(e) =>
                                    onChange({
                                        ...payload,
                                        firstName: e.target.value,
                                    })
                                }
                                placeholder="John"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Last Name</label>
                            <input
                                type="text"
                                value={payload.lastName}
                                onChange={(e) =>
                                    onChange({
                                        ...payload,
                                        lastName: e.target.value,
                                    })
                                }
                                placeholder="Doe"
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Phone</label>
                            <input
                                type="tel"
                                value={payload.phone || ""}
                                onChange={(e) =>
                                    onChange({
                                        ...payload,
                                        phone: e.target.value,
                                    })
                                }
                                placeholder="Work phone"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Mobile</label>
                            <input
                                type="tel"
                                value={payload.mobile || ""}
                                onChange={(e) =>
                                    onChange({
                                        ...payload,
                                        mobile: e.target.value,
                                    })
                                }
                                placeholder="Mobile phone"
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input
                            type="email"
                            value={payload.email || ""}
                            onChange={(e) =>
                                onChange({ ...payload, email: e.target.value })
                            }
                            placeholder="email@example.com"
                            className={inputClass}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Organization</label>
                            <input
                                type="text"
                                value={payload.organization || ""}
                                onChange={(e) =>
                                    onChange({
                                        ...payload,
                                        organization: e.target.value,
                                    })
                                }
                                placeholder="Company name"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Title</label>
                            <input
                                type="text"
                                value={payload.title || ""}
                                onChange={(e) =>
                                    onChange({
                                        ...payload,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Job title"
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Website</label>
                        <input
                            type="url"
                            value={payload.website || ""}
                            onChange={(e) =>
                                onChange({
                                    ...payload,
                                    website: e.target.value,
                                })
                            }
                            placeholder="https://example.com"
                            className={inputClass}
                        />
                    </div>
                </div>
            );

        case "geo":
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Latitude</label>
                            <input
                                type="number"
                                step="any"
                                value={payload.latitude || ""}
                                onChange={(e) =>
                                    onChange({
                                        ...payload,
                                        latitude:
                                            parseFloat(e.target.value) || 0,
                                    })
                                }
                                placeholder="40.7128"
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Longitude</label>
                            <input
                                type="number"
                                step="any"
                                value={payload.longitude || ""}
                                onChange={(e) =>
                                    onChange({
                                        ...payload,
                                        longitude:
                                            parseFloat(e.target.value) || 0,
                                    })
                                }
                                placeholder="-74.0060"
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>
                            Location Name (optional)
                        </label>
                        <input
                            type="text"
                            value={payload.name || ""}
                            onChange={(e) =>
                                onChange({ ...payload, name: e.target.value })
                            }
                            placeholder="New York City"
                            className={inputClass}
                        />
                    </div>
                </div>
            );

        case "calendar":
            return (
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Event Title</label>
                        <input
                            type="text"
                            value={payload.title}
                            onChange={(e) =>
                                onChange({ ...payload, title: e.target.value })
                            }
                            placeholder="Meeting with Team"
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>
                            Location (optional)
                        </label>
                        <input
                            type="text"
                            value={payload.location || ""}
                            onChange={(e) =>
                                onChange({
                                    ...payload,
                                    location: e.target.value,
                                })
                            }
                            placeholder="Conference Room A"
                            className={inputClass}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>
                                Start Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={payload.startDate}
                                onChange={(e) =>
                                    onChange({
                                        ...payload,
                                        startDate: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>
                                End Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={payload.endDate}
                                onChange={(e) =>
                                    onChange({
                                        ...payload,
                                        endDate: e.target.value,
                                    })
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>
                            Description (optional)
                        </label>
                        <textarea
                            value={payload.description || ""}
                            onChange={(e) =>
                                onChange({
                                    ...payload,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Event description"
                            rows={3}
                            className={inputClass}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="allDay"
                            checked={payload.allDay || false}
                            onChange={(e) =>
                                onChange({
                                    ...payload,
                                    allDay: e.target.checked,
                                })
                            }
                            className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                        />
                        <label
                            htmlFor="allDay"
                            className="text-sm text-neutral-700 dark:text-neutral-300"
                        >
                            All day event
                        </label>
                    </div>
                </div>
            );

        default:
            return null;
    }
}

// ============ Style Editor Component ============

interface StyleEditorProps {
    options: QRStyleOptions;
    onChange: (options: QRStyleOptions) => void;
    onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DOT_STYLES: { value: DotStyle; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "rounded", label: "Rounded" },
    { value: "dots", label: "Dots" },
    { value: "classy", label: "Classy" },
    { value: "classy-rounded", label: "Classy Rounded" },
    { value: "extra-rounded", label: "Extra Rounded" },
];

const CORNER_SQUARE_STYLES: { value: CornerSquareStyle; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "dot", label: "Dot" },
    { value: "extra-rounded", label: "Extra Rounded" },
];

const CORNER_DOT_STYLES: { value: CornerDotStyle; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "dot", label: "Dot" },
];

const LOGO_SHAPES: { value: LogoShape; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "rounded", label: "Rounded" },
    { value: "circle", label: "Circle" },
];

function StyleEditor({ options, onChange, onLogoUpload }: StyleEditorProps) {
    const labelClass =
        "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2";
    const selectClass =
        "w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500";

    return (
        <div className="space-y-6">
            {/* Dot Style */}
            <div>
                <label className={labelClass}>Dot Style</label>
                <select
                    value={options.dotStyle}
                    onChange={(e) =>
                        onChange({
                            ...options,
                            dotStyle: e.target.value as DotStyle,
                        })
                    }
                    className={selectClass}
                >
                    {DOT_STYLES.map((style) => (
                        <option key={style.value} value={style.value}>
                            {style.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Dot Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={options.dotColor}
                            onChange={(e) =>
                                onChange({
                                    ...options,
                                    dotColor: e.target.value,
                                })
                            }
                            className="w-12 h-12 rounded-lg cursor-pointer border-0"
                        />
                        <input
                            type="text"
                            value={options.dotColor}
                            onChange={(e) =>
                                onChange({
                                    ...options,
                                    dotColor: e.target.value,
                                })
                            }
                            className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white text-sm"
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Background</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={options.backgroundColor}
                            onChange={(e) =>
                                onChange({
                                    ...options,
                                    backgroundColor: e.target.value,
                                })
                            }
                            className="w-12 h-12 rounded-lg cursor-pointer border-0"
                        />
                        <input
                            type="text"
                            value={options.backgroundColor}
                            onChange={(e) =>
                                onChange({
                                    ...options,
                                    backgroundColor: e.target.value,
                                })
                            }
                            className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Corner Styles */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Corner Square</label>
                    <select
                        value={options.cornerSquareStyle}
                        onChange={(e) =>
                            onChange({
                                ...options,
                                cornerSquareStyle: e.target
                                    .value as CornerSquareStyle,
                            })
                        }
                        className={selectClass}
                    >
                        {CORNER_SQUARE_STYLES.map((style) => (
                            <option key={style.value} value={style.value}>
                                {style.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Corner Dot</label>
                    <select
                        value={options.cornerDotStyle}
                        onChange={(e) =>
                            onChange({
                                ...options,
                                cornerDotStyle: e.target
                                    .value as CornerDotStyle,
                            })
                        }
                        className={selectClass}
                    >
                        {CORNER_DOT_STYLES.map((style) => (
                            <option key={style.value} value={style.value}>
                                {style.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Corner Colors */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Corner Square Color</label>
                    <input
                        type="color"
                        value={options.cornerSquareColor}
                        onChange={(e) =>
                            onChange({
                                ...options,
                                cornerSquareColor: e.target.value,
                            })
                        }
                        className="w-full h-10 rounded-lg cursor-pointer border-0"
                    />
                </div>
                <div>
                    <label className={labelClass}>Corner Dot Color</label>
                    <input
                        type="color"
                        value={options.cornerDotColor}
                        onChange={(e) =>
                            onChange({
                                ...options,
                                cornerDotColor: e.target.value,
                            })
                        }
                        className="w-full h-10 rounded-lg cursor-pointer border-0"
                    />
                </div>
            </div>

            {/* Logo Upload */}
            <div>
                <label className={labelClass}>Logo</label>
                <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg cursor-pointer transition-colors">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm">Upload Logo</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onLogoUpload}
                            className="hidden"
                        />
                    </label>
                    {options.logo && (
                        <button
                            onClick={() =>
                                onChange({
                                    ...options,
                                    logo: undefined,
                                    errorCorrectionLevel: "M",
                                })
                            }
                            className="text-red-500 text-sm hover:underline"
                        >
                            Remove
                        </button>
                    )}
                </div>
                {options.logo && (
                    <div className="mt-3">
                        <label className={labelClass}>
                            Logo Size:{" "}
                            {Math.round((options.logoSize || 0.2) * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0.1"
                            max="0.4"
                            step="0.05"
                            value={options.logoSize || 0.2}
                            onChange={(e) =>
                                onChange({
                                    ...options,
                                    logoSize: parseFloat(e.target.value),
                                })
                            }
                            className="w-full"
                        />
                        {/* Logo Shape */}
                        <div className="mt-3">
                            <label className={labelClass}>Logo Shape</label>
                            <div className="flex gap-2">
                                {LOGO_SHAPES.map((shape) => (
                                    <button
                                        key={shape.value}
                                        onClick={() =>
                                            onChange({
                                                ...options,
                                                logoShape: shape.value,
                                            })
                                        }
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                                            ${
                                                (options.logoShape ||
                                                    "square") === shape.value
                                                    ? "bg-primary-500 text-white"
                                                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                            }`}
                                    >
                                        {shape.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Size */}
            <div>
                <label className={labelClass}>QR Size: {options.size}px</label>
                <input
                    type="range"
                    min="200"
                    max="500"
                    step="50"
                    value={options.size}
                    onChange={(e) =>
                        onChange({ ...options, size: parseInt(e.target.value) })
                    }
                    className="w-full"
                />
            </div>
        </div>
    );
}

// ============ Frame Editor Component ============

interface FrameEditorProps {
    options: FrameOptions;
    onChange: (options: FrameOptions) => void;
}

const FRAME_STYLES = [
    { value: "none", label: "No Frame" },
    { value: "simple", label: "Simple" },
    { value: "badge", label: "Badge" },
    { value: "sticker", label: "Sticker" },
    { value: "rounded", label: "Rounded" },
];

function FrameEditor({ options, onChange }: FrameEditorProps) {
    const labelClass =
        "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2";
    const inputClass =
        "w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500";

    return (
        <div className="space-y-4">
            {/* Frame Style */}
            <div>
                <label className={labelClass}>Frame Style</label>
                <div className="flex flex-wrap gap-2">
                    {FRAME_STYLES.map((style) => (
                        <button
                            key={style.value}
                            onClick={() =>
                                onChange({
                                    ...options,
                                    style: style.value as FrameOptions["style"],
                                })
                            }
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                                ${
                                    options.style === style.value
                                        ? "bg-primary-500 text-white"
                                        : "bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                }`}
                        >
                            {style.label}
                        </button>
                    ))}
                </div>
            </div>

            {options.style !== "none" && (
                <>
                    {/* Caption */}
                    <div>
                        <label className={labelClass}>Caption</label>
                        <input
                            type="text"
                            value={options.caption || ""}
                            onChange={(e) =>
                                onChange({
                                    ...options,
                                    caption: e.target.value,
                                })
                            }
                            placeholder="SCAN ME"
                            className={inputClass}
                        />
                    </div>

                    {/* Caption Position */}
                    <div>
                        <label className={labelClass}>Caption Position</label>
                        <div className="flex gap-2">
                            {["top", "bottom"].map((pos) => (
                                <button
                                    key={pos}
                                    onClick={() =>
                                        onChange({
                                            ...options,
                                            captionPosition: pos as
                                                | "top"
                                                | "bottom",
                                        })
                                    }
                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all
                                        ${
                                            options.captionPosition === pos
                                                ? "bg-primary-500 text-white"
                                                : "bg-neutral-100 dark:bg-neutral-700/50 text-neutral-700 dark:text-neutral-300"
                                        }`}
                                >
                                    {pos}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Caption Color</label>
                            <input
                                type="color"
                                value={options.captionColor || "#000000"}
                                onChange={(e) =>
                                    onChange({
                                        ...options,
                                        captionColor: e.target.value,
                                    })
                                }
                                className="w-full h-10 rounded-lg cursor-pointer border-0"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>
                                Frame Background
                            </label>
                            <input
                                type="color"
                                value={options.backgroundColor || "#ffffff"}
                                onChange={(e) =>
                                    onChange({
                                        ...options,
                                        backgroundColor: e.target.value,
                                    })
                                }
                                className="w-full h-10 rounded-lg cursor-pointer border-0"
                            />
                        </div>
                    </div>

                    {/* Padding */}
                    <div>
                        <label className={labelClass}>
                            Padding: {options.padding}px
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="50"
                            step="2"
                            value={options.padding || 20}
                            onChange={(e) =>
                                onChange({
                                    ...options,
                                    padding: parseInt(e.target.value),
                                })
                            }
                            className="w-full"
                        />
                    </div>

                    {/* Border Radius */}
                    <div>
                        <label className={labelClass}>
                            Border Radius: {options.borderRadius}px
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="40"
                            step="4"
                            value={options.borderRadius || 12}
                            onChange={(e) =>
                                onChange({
                                    ...options,
                                    borderRadius: parseInt(e.target.value),
                                })
                            }
                            className="w-full"
                        />
                    </div>
                </>
            )}
        </div>
    );
}
