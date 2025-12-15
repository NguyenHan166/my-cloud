/**
 * QR Code Payload Builders
 * Convert form data into QR-compatible strings according to standards
 */

import type {
    QRPayload,
    UrlPayload,
    TextPayload,
    EmailPayload,
    PhonePayload,
    SmsPayload,
    WhatsAppPayload,
    WifiPayload,
    VCardPayload,
    GeoPayload,
    CalendarPayload,
} from "@/types/qr";

// Escape special characters for QR data
function escapeSpecialChars(str: string): string {
    return str
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/:/g, "\\:")
        .replace(/,/g, "\\,");
}

// Format date to iCal format (YYYYMMDDTHHMMSS)
function formatICalDate(dateStr: string, allDay?: boolean): string {
    const date = new Date(dateStr);
    if (allDay) {
        return date.toISOString().slice(0, 10).replace(/-/g, "");
    }
    return date.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
}

// Build URL payload
export function buildUrl(payload: UrlPayload): string {
    let url = payload.url.trim();
    if (!url.match(/^https?:\/\//i)) {
        url = "https://" + url;
    }
    return url;
}

// Build plain text payload
export function buildText(payload: TextPayload): string {
    return payload.text;
}

// Build email payload (MATMSG format - widely supported)
export function buildEmail(payload: EmailPayload): string {
    let result = `MATMSG:TO:${payload.to};`;
    if (payload.subject) {
        result += `SUB:${payload.subject};`;
    }
    if (payload.body) {
        result += `BODY:${payload.body};`;
    }
    result += ";";
    return result;
}

// Build phone payload
export function buildPhone(payload: PhonePayload): string {
    const number = payload.number.replace(/\s+/g, "");
    return `tel:${number}`;
}

// Build SMS payload
export function buildSms(payload: SmsPayload): string {
    const number = payload.number.replace(/\s+/g, "");
    if (payload.message) {
        return `SMSTO:${number}:${payload.message}`;
    }
    return `SMSTO:${number}`;
}

// Build WhatsApp payload
export function buildWhatsApp(payload: WhatsAppPayload): string {
    // Remove non-digits from number
    const number = payload.number.replace(/\D/g, "");
    let url = `https://wa.me/${number}`;
    if (payload.message) {
        url += `?text=${encodeURIComponent(payload.message)}`;
    }
    return url;
}

// Build WiFi payload
export function buildWifi(payload: WifiPayload): string {
    const ssid = escapeSpecialChars(payload.ssid);
    let result = `WIFI:T:${payload.encryption};S:${ssid};`;

    if (payload.password && payload.encryption !== "nopass") {
        const password = escapeSpecialChars(payload.password);
        result += `P:${password};`;
    }

    if (payload.hidden) {
        result += "H:true;";
    }

    result += ";";
    return result;
}

// Build vCard payload (vCard 3.0)
export function buildVCard(payload: VCardPayload): string {
    const lines: string[] = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${payload.lastName};${payload.firstName};;;`,
        `FN:${payload.firstName} ${payload.lastName}`,
    ];

    if (payload.phone) {
        lines.push(`TEL;TYPE=WORK:${payload.phone}`);
    }
    if (payload.mobile) {
        lines.push(`TEL;TYPE=CELL:${payload.mobile}`);
    }
    if (payload.email) {
        lines.push(`EMAIL:${payload.email}`);
    }
    if (payload.organization) {
        lines.push(`ORG:${payload.organization}`);
    }
    if (payload.title) {
        lines.push(`TITLE:${payload.title}`);
    }
    if (payload.website) {
        lines.push(`URL:${payload.website}`);
    }
    if (payload.address) {
        const addr = payload.address;
        lines.push(
            `ADR:;;${addr.street || ""};${addr.city || ""};${
                addr.state || ""
            };${addr.zip || ""};${addr.country || ""}`
        );
    }

    lines.push("END:VCARD");
    return lines.join("\n");
}

// Build geo payload
export function buildGeo(payload: GeoPayload): string {
    let result = `geo:${payload.latitude},${payload.longitude}`;
    if (payload.name) {
        result += `?q=${encodeURIComponent(payload.name)}`;
    }
    return result;
}

// Build calendar event payload (iCal format)
export function buildCalendar(payload: CalendarPayload): string {
    const uid = `${Date.now()}@qrgenerator`;
    const dtstamp = formatICalDate(new Date().toISOString());
    const dtstart = formatICalDate(payload.startDate, payload.allDay);
    const dtend = formatICalDate(payload.endDate, payload.allDay);

    const lines: string[] = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${payload.title}`,
    ];

    if (payload.location) {
        lines.push(`LOCATION:${payload.location}`);
    }
    if (payload.description) {
        lines.push(`DESCRIPTION:${payload.description}`);
    }

    lines.push("END:VEVENT", "END:VCALENDAR");
    return lines.join("\n");
}

// Main builder function - routes to specific builders
export function buildPayloadString(payload: QRPayload): string {
    switch (payload.type) {
        case "url":
            return buildUrl(payload);
        case "text":
            return buildText(payload);
        case "email":
            return buildEmail(payload);
        case "phone":
            return buildPhone(payload);
        case "sms":
            return buildSms(payload);
        case "whatsapp":
            return buildWhatsApp(payload);
        case "wifi":
            return buildWifi(payload);
        case "vcard":
            return buildVCard(payload);
        case "geo":
            return buildGeo(payload);
        case "calendar":
            return buildCalendar(payload);
        default:
            return "";
    }
}

// Get initial payload data for a type
export function getInitialPayload(type: QRPayload["type"]): QRPayload {
    switch (type) {
        case "url":
            return { type: "url", url: "" };
        case "text":
            return { type: "text", text: "" };
        case "email":
            return { type: "email", to: "", subject: "", body: "" };
        case "phone":
            return { type: "phone", number: "" };
        case "sms":
            return { type: "sms", number: "", message: "" };
        case "whatsapp":
            return { type: "whatsapp", number: "", message: "" };
        case "wifi":
            return {
                type: "wifi",
                ssid: "",
                password: "",
                encryption: "WPA",
                hidden: false,
            };
        case "vcard":
            return {
                type: "vcard",
                firstName: "",
                lastName: "",
                phone: "",
                mobile: "",
                email: "",
                organization: "",
                title: "",
                website: "",
                address: {},
            };
        case "geo":
            return { type: "geo", latitude: 0, longitude: 0, name: "" };
        case "calendar":
            return {
                type: "calendar",
                title: "",
                location: "",
                description: "",
                startDate: new Date().toISOString().slice(0, 16),
                endDate: new Date(Date.now() + 3600000)
                    .toISOString()
                    .slice(0, 16),
                allDay: false,
            };
    }
}
