/**
 * Holiday definitions for Solar and Lunar calendars
 */

export interface Holiday {
    name: string;
    emoji: string;
    type: "solar" | "lunar";
    month: number;
    day: number;
}

/**
 * Solar holidays (Gregorian calendar)
 */
export const SOLAR_HOLIDAYS: Holiday[] = [
    // International holidays
    { name: "Năm mới", emoji: "🎉", type: "solar", month: 1, day: 1 },
    { name: "Valentine", emoji: "💕", type: "solar", month: 2, day: 14 },
    { name: "Quốc tế Phụ nữ", emoji: "🌷", type: "solar", month: 3, day: 8 },
    { name: "Cá tháng Tư", emoji: "🃏", type: "solar", month: 4, day: 1 },
    { name: "Quốc tế Lao động", emoji: "💪", type: "solar", month: 5, day: 1 },
    { name: "Quốc tế Thiếu nhi", emoji: "👶", type: "solar", month: 6, day: 1 },
    { name: "Halloween", emoji: "🎃", type: "solar", month: 10, day: 31 },
    { name: "Giáng sinh", emoji: "🎄", type: "solar", month: 12, day: 25 },
    { name: "Đêm Noel", emoji: "🎅", type: "solar", month: 12, day: 24 },

    // Vietnamese solar holidays
    {
        name: "Giải phóng miền Nam",
        emoji: "🇻🇳",
        type: "solar",
        month: 4,
        day: 30,
    },
    { name: "Quốc khánh", emoji: "🇻🇳", type: "solar", month: 9, day: 2 },
    {
        name: "Ngày Nhà giáo VN",
        emoji: "📚",
        type: "solar",
        month: 11,
        day: 20,
    },
    { name: "Ngày Phụ nữ VN", emoji: "💐", type: "solar", month: 10, day: 20 },
    {
        name: "Ngày Thương binh Liệt sĩ",
        emoji: "🎖️",
        type: "solar",
        month: 7,
        day: 27,
    },
];

/**
 * Lunar holidays (Vietnamese lunar calendar)
 */
export const LUNAR_HOLIDAYS: Holiday[] = [
    // Tết Nguyên Đán
    { name: "Giao thừa", emoji: "🧨", type: "lunar", month: 12, day: 30 },
    { name: "Mùng 1 Tết", emoji: "🧧", type: "lunar", month: 1, day: 1 },
    { name: "Mùng 2 Tết", emoji: "🧧", type: "lunar", month: 1, day: 2 },
    { name: "Mùng 3 Tết", emoji: "🧧", type: "lunar", month: 1, day: 3 },

    // Other lunar holidays
    { name: "Rằm tháng Giêng", emoji: "🏮", type: "lunar", month: 1, day: 15 },
    { name: "Tết Hàn thực", emoji: "🍡", type: "lunar", month: 3, day: 3 },
    {
        name: "Giỗ Tổ Hùng Vương",
        emoji: "🏛️",
        type: "lunar",
        month: 3,
        day: 10,
    },
    { name: "Lễ Phật Đản", emoji: "🪷", type: "lunar", month: 4, day: 15 },
    { name: "Tết Đoan Ngọ", emoji: "🍃", type: "lunar", month: 5, day: 5 },
    { name: "Vu Lan", emoji: "🌸", type: "lunar", month: 7, day: 15 },
    { name: "Tết Trung Thu", emoji: "🥮", type: "lunar", month: 8, day: 15 },
    { name: "Tết Hạ Nguyên", emoji: "🍂", type: "lunar", month: 10, day: 15 },
    {
        name: "Ông Công Ông Táo",
        emoji: "🐟",
        type: "lunar",
        month: 12,
        day: 23,
    },
];

/**
 * Get solar holidays for a specific date
 */
export function getSolarHolidays(month: number, day: number): Holiday[] {
    return SOLAR_HOLIDAYS.filter((h) => h.month === month && h.day === day);
}

/**
 * Get lunar holidays for a specific lunar date
 */
export function getLunarHolidays(
    lunarMonth: number,
    lunarDay: number
): Holiday[] {
    return LUNAR_HOLIDAYS.filter(
        (h) => h.month === lunarMonth && h.day === lunarDay
    );
}
