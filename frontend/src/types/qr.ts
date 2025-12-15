// QR Code Generator Types

// ============ Payload Types ============

export type PayloadType =
    | "url"
    | "text"
    | "email"
    | "phone"
    | "sms"
    | "whatsapp"
    | "wifi"
    | "vcard"
    | "geo"
    | "calendar";

export interface UrlPayload {
    type: "url";
    url: string;
}

export interface TextPayload {
    type: "text";
    text: string;
}

export interface EmailPayload {
    type: "email";
    to: string;
    subject?: string;
    body?: string;
}

export interface PhonePayload {
    type: "phone";
    number: string;
}

export interface SmsPayload {
    type: "sms";
    number: string;
    message?: string;
}

export interface WhatsAppPayload {
    type: "whatsapp";
    number: string;
    message?: string;
}

export type WifiEncryption = "WPA" | "WEP" | "nopass";

export interface WifiPayload {
    type: "wifi";
    ssid: string;
    password?: string;
    encryption: WifiEncryption;
    hidden?: boolean;
}

export interface VCardPayload {
    type: "vcard";
    firstName: string;
    lastName: string;
    phone?: string;
    mobile?: string;
    email?: string;
    organization?: string;
    title?: string;
    website?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
    };
}

export interface GeoPayload {
    type: "geo";
    latitude: number;
    longitude: number;
    name?: string;
}

export interface CalendarPayload {
    type: "calendar";
    title: string;
    location?: string;
    description?: string;
    startDate: string; // ISO format
    endDate: string; // ISO format
    allDay?: boolean;
}

export type QRPayload =
    | UrlPayload
    | TextPayload
    | EmailPayload
    | PhonePayload
    | SmsPayload
    | WhatsAppPayload
    | WifiPayload
    | VCardPayload
    | GeoPayload
    | CalendarPayload;

// ============ QR Style Options ============

export type DotStyle =
    | "square"
    | "rounded"
    | "dots"
    | "classy"
    | "classy-rounded"
    | "extra-rounded";
export type CornerSquareStyle = "square" | "dot" | "extra-rounded";
export type CornerDotStyle = "square" | "dot";
export type GradientType = "linear" | "radial";
export type LogoShape = "square" | "rounded" | "circle";

export interface GradientOptions {
    type: GradientType;
    rotation?: number;
    colorStops: Array<{ offset: number; color: string }>;
}

export interface QRStyleOptions {
    // Dots
    dotStyle: DotStyle;
    dotColor: string;
    dotGradient?: GradientOptions;

    // Corner squares
    cornerSquareStyle: CornerSquareStyle;
    cornerSquareColor: string;
    cornerSquareGradient?: GradientOptions;

    // Corner dots
    cornerDotStyle: CornerDotStyle;
    cornerDotColor: string;
    cornerDotGradient?: GradientOptions;

    // Background
    backgroundColor: string;
    backgroundGradient?: GradientOptions;

    // Logo
    logo?: string; // Base64 or URL
    logoSize?: number; // 0.1 to 0.4 (percentage of QR size)
    logoMargin?: number;
    logoShape?: LogoShape; // square, rounded, circle

    // Error correction
    errorCorrectionLevel: "L" | "M" | "Q" | "H";

    // Size
    size: number;
    margin: number;
}

// ============ Frame Options ============

export type FrameStyle = "none" | "simple" | "badge" | "sticker" | "rounded";

export interface FrameOptions {
    style: FrameStyle;
    caption?: string;
    captionPosition?: "top" | "bottom";
    captionColor?: string;
    captionFontSize?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: number;
    padding?: number;
}

// ============ Template ============

export interface QRTemplate {
    id: string;
    name: string;
    isDefault?: boolean;
    createdAt: string;
    styleOptions: QRStyleOptions;
    frameOptions: FrameOptions;
}

// ============ Full QR Config ============

export interface QRConfig {
    payload: QRPayload;
    styleOptions: QRStyleOptions;
    frameOptions: FrameOptions;
}

// ============ Default Values ============

export const DEFAULT_STYLE_OPTIONS: QRStyleOptions = {
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
    logoShape: "square",
};

export const DEFAULT_FRAME_OPTIONS: FrameOptions = {
    style: "none",
    caption: "",
    captionPosition: "bottom",
    captionColor: "#000000",
    captionFontSize: 16,
    backgroundColor: "#ffffff",
    borderColor: "#000000",
    borderRadius: 12,
    padding: 20,
};
