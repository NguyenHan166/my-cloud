/**
 * Calendar grid generation and holiday lookup
 */

import { getLunarDate, type LunarDate } from "./lunar";
import { getSolarHolidays, getLunarHolidays, type Holiday } from "./holidays";

export interface CalendarDay {
    date: Date;
    solarDay: number;
    solarMonth: number;
    solarYear: number;
    lunar: LunarDate;
    holidays: Holiday[];
    isToday: boolean;
    isCurrentMonth: boolean;
}

export interface CalendarWeek {
    days: CalendarDay[];
}

/**
 * Generate calendar grid for a month
 * Returns array of weeks, each containing 7 days
 */
export function generateMonthGrid(year: number, month: number): CalendarWeek[] {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${
        today.getMonth() + 1
    }-${today.getDate()}`;

    // First day of month
    const firstDay = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Last day of month
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();

    // Previous month's days to show
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();

    const weeks: CalendarWeek[] = [];
    let currentWeek: CalendarDay[] = [];

    // Add days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(prevYear, prevMonth - 1, day);
        currentWeek.push(
            createCalendarDay(date, prevYear, prevMonth, day, todayStr, false)
        );
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        currentWeek.push(
            createCalendarDay(date, year, month, day, todayStr, true)
        );

        if (currentWeek.length === 7) {
            weeks.push({ days: currentWeek });
            currentWeek = [];
        }
    }

    // Add days from next month
    if (currentWeek.length > 0) {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        let nextDay = 1;

        while (currentWeek.length < 7) {
            const date = new Date(nextYear, nextMonth - 1, nextDay);
            currentWeek.push(
                createCalendarDay(
                    date,
                    nextYear,
                    nextMonth,
                    nextDay,
                    todayStr,
                    false
                )
            );
            nextDay++;
        }
        weeks.push({ days: currentWeek });
    }

    return weeks;
}

function createCalendarDay(
    date: Date,
    year: number,
    month: number,
    day: number,
    todayStr: string,
    isCurrentMonth: boolean
): CalendarDay {
    const lunar = getLunarDate(day, month, year);
    const solarHolidays = getSolarHolidays(month, day);
    const lunarHolidays = getLunarHolidays(lunar.month, lunar.day);

    return {
        date,
        solarDay: day,
        solarMonth: month,
        solarYear: year,
        lunar,
        holidays: [...solarHolidays, ...lunarHolidays],
        isToday: `${year}-${month}-${day}` === todayStr,
        isCurrentMonth,
    };
}

/**
 * Get Vietnamese month name
 */
export function getMonthName(month: number): string {
    return `Tháng ${month}`;
}

/**
 * Day of week names (Vietnamese)
 */
export const WEEKDAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
export const WEEKDAY_NAMES_FULL = [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
];
