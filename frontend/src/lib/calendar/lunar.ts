/**
 * Lunar calendar conversion using amlich package
 * Timezone: Vietnam (UTC+7)
 */

// @ts-expect-error - amlich package doesn't have TypeScript types
import { convertSolar2Lunar } from "amlich";

export interface LunarDate {
    day: number;
    month: number;
    year: number;
    leap: boolean; // Tháng nhuận
    jd: number; // Julian day
}

const TIMEZONE_VIETNAM = 7;

/**
 * Convert solar date to lunar date
 */
export function getLunarDate(
    solarDay: number,
    solarMonth: number,
    solarYear: number
): LunarDate {
    const result = convertSolar2Lunar(
        solarDay,
        solarMonth,
        solarYear,
        TIMEZONE_VIETNAM
    );

    return {
        day: result[0],
        month: result[1],
        year: result[2],
        leap: result[3] === 1,
        jd: result[4],
    };
}

/**
 * Format lunar date for display
 * Examples: "15/8", "1/1 nhuận"
 */
export function formatLunarDate(lunar: LunarDate): string {
    const leapSuffix = lunar.leap ? " nhuận" : "";
    return `${lunar.day}/${lunar.month}${leapSuffix}`;
}

/**
 * Format full lunar date
 * Example: "15 tháng 8 năm Giáp Thìn"
 */
export function formatLunarDateFull(lunar: LunarDate): string {
    const leapText = lunar.leap ? " (nhuận)" : "";
    return `${lunar.day} tháng ${lunar.month}${leapText} âm lịch`;
}

/**
 * Vietnamese lunar year names (Can Chi)
 */
const CAN = [
    "Giáp",
    "Ất",
    "Bính",
    "Đinh",
    "Mậu",
    "Kỷ",
    "Canh",
    "Tân",
    "Nhâm",
    "Quý",
];
const CHI = [
    "Tý",
    "Sửu",
    "Dần",
    "Mão",
    "Thìn",
    "Tỵ",
    "Ngọ",
    "Mùi",
    "Thân",
    "Dậu",
    "Tuất",
    "Hợi",
];

export function getLunarYearName(year: number): string {
    const canIndex = (year + 6) % 10;
    const chiIndex = (year + 8) % 12;
    return `${CAN[canIndex]} ${CHI[chiIndex]}`;
}
