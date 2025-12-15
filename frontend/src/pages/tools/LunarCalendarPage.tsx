import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Calendar,
    X,
} from "lucide-react";
import {
    generateMonthGrid,
    WEEKDAY_NAMES,
    WEEKDAY_NAMES_FULL,
    formatLunarDate,
    formatLunarDateFull,
    getLunarYearName,
    type CalendarDay,
    type Holiday,
} from "@/lib/calendar";

export default function LunarCalendarPage() {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    // Generate calendar grid
    const weeks = useMemo(() => generateMonthGrid(year, month), [year, month]);

    // Navigation handlers
    const goToPrevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const goToNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    const goToToday = () => {
        const now = new Date();
        setYear(now.getFullYear());
        setMonth(now.getMonth() + 1);
    };

    const isCurrentMonth =
        year === today.getFullYear() && month === today.getMonth() + 1;

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
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Lịch Việt Nam
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Calendar Card */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700/50 overflow-hidden shadow-sm">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700/50">
                        <button
                            onClick={goToPrevMonth}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        </button>

                        <div className="text-center">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                Tháng {month}/{year}
                            </h2>
                            <p className="text-sm text-neutral-500">
                                Năm {getLunarYearName(year)}
                            </p>
                        </div>

                        <button
                            onClick={goToNextMonth}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        </button>
                    </div>

                    {/* Today Button */}
                    {!isCurrentMonth && (
                        <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700/50">
                            <button
                                onClick={goToToday}
                                className="text-sm text-red-500 hover:text-red-600 font-medium"
                            >
                                ← Quay về hôm nay
                            </button>
                        </div>
                    )}

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 border-b border-neutral-200 dark:border-neutral-700/50">
                        {WEEKDAY_NAMES.map((name, idx) => (
                            <div
                                key={name}
                                className={`py-3 text-center text-sm font-medium ${
                                    idx === 0
                                        ? "text-red-500"
                                        : "text-neutral-600 dark:text-neutral-400"
                                }`}
                            >
                                {name}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-700/30">
                        {weeks.map((week, weekIdx) => (
                            <div key={weekIdx} className="grid grid-cols-7">
                                {week.days.map((day, dayIdx) => (
                                    <DayCell
                                        key={`${day.solarYear}-${day.solarMonth}-${day.solarDay}`}
                                        day={day}
                                        isSunday={dayIdx === 0}
                                        onClick={() => setSelectedDay(day)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-orange-500" />
                        Hôm nay
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs">🎉</span>
                        Lễ dương lịch
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs">🧧</span>
                        Lễ âm lịch
                    </div>
                </div>
            </div>

            {/* Day Detail Modal */}
            {selectedDay && (
                <DayDetailModal
                    day={selectedDay}
                    onClose={() => setSelectedDay(null)}
                />
            )}
        </div>
    );
}

// ============ Day Cell Component ============

function DayCell({
    day,
    isSunday,
    onClick,
}: {
    day: CalendarDay;
    isSunday: boolean;
    onClick: () => void;
}) {
    const hasHolidays = day.holidays.length > 0;
    const isLunarFirstDay = day.lunar.day === 1;

    return (
        <button
            onClick={onClick}
            className={`relative p-2 min-h-[80px] sm:min-h-[90px] border-r border-neutral-100 dark:border-neutral-700/30 last:border-r-0 
                       hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors text-left
                       ${!day.isCurrentMonth ? "opacity-40" : ""}`}
        >
            {/* Today Indicator */}
            {day.isToday && (
                <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500 pointer-events-none" />
            )}

            {/* Solar Day */}
            <div
                className={`text-lg sm:text-xl font-bold relative z-10 ${
                    day.isToday
                        ? "text-red-500"
                        : isSunday
                        ? "text-red-400"
                        : hasHolidays
                        ? "text-orange-500"
                        : "text-neutral-900 dark:text-white"
                }`}
            >
                {day.solarDay}
            </div>

            {/* Lunar Day */}
            <div
                className={`text-[10px] sm:text-xs relative z-10 ${
                    isLunarFirstDay
                        ? "text-red-400 font-medium"
                        : "text-neutral-400"
                }`}
            >
                {isLunarFirstDay
                    ? `${day.lunar.day}/${day.lunar.month}${
                          day.lunar.leap ? "*" : ""
                      }`
                    : formatLunarDate(day.lunar).split("/")[0]}
            </div>

            {/* Holiday Badges */}
            {hasHolidays && (
                <div className="mt-1 space-y-0.5 relative z-10">
                    {day.holidays.slice(0, 2).map((h, idx) => (
                        <div
                            key={idx}
                            className="text-[9px] leading-tight truncate"
                            title={h.name}
                        >
                            <span className="mr-0.5">{h.emoji}</span>
                            <span className="hidden sm:inline text-neutral-500 dark:text-neutral-400">
                                {h.name.length > 8
                                    ? h.name.slice(0, 8) + "…"
                                    : h.name}
                            </span>
                        </div>
                    ))}
                    {day.holidays.length > 2 && (
                        <div className="text-[9px] text-neutral-400">
                            +{day.holidays.length - 2}
                        </div>
                    )}
                </div>
            )}
        </button>
    );
}

// ============ Day Detail Modal ============

function DayDetailModal({
    day,
    onClose,
}: {
    day: CalendarDay;
    onClose: () => void;
}) {
    const dayOfWeek = day.date.getDay();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-neutral-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-4xl font-bold">
                                {day.solarDay}
                            </div>
                            <div className="text-white/80">
                                {WEEKDAY_NAMES_FULL[dayOfWeek]},{" "}
                                {day.solarMonth}/{day.solarYear}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Lunar Info */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <span className="text-2xl">🌙</span>
                        </div>
                        <div>
                            <div className="font-medium text-neutral-900 dark:text-white">
                                {formatLunarDateFull(day.lunar)}
                            </div>
                            <div className="text-sm text-neutral-500">
                                Năm {getLunarYearName(day.lunar.year)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Holidays */}
                {day.holidays.length > 0 ? (
                    <div className="p-4">
                        <h4 className="text-sm font-medium text-neutral-500 mb-3">
                            Ngày lễ / Sự kiện
                        </h4>
                        <div className="space-y-2">
                            {day.holidays.map((holiday, idx) => (
                                <HolidayItem key={idx} holiday={holiday} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center text-neutral-400">
                        Không có ngày lễ
                    </div>
                )}
            </div>
        </div>
    );
}

function HolidayItem({ holiday }: { holiday: Holiday }) {
    const bgColor =
        holiday.type === "solar"
            ? "bg-blue-100 dark:bg-blue-900/30"
            : "bg-red-100 dark:bg-red-900/30";
    const textColor =
        holiday.type === "solar"
            ? "text-blue-600 dark:text-blue-400"
            : "text-red-600 dark:text-red-400";
    const labelColor = holiday.type === "solar" ? "bg-blue-500" : "bg-red-500";

    return (
        <div className={`flex items-center gap-3 p-3 rounded-xl ${bgColor}`}>
            <span className="text-2xl">{holiday.emoji}</span>
            <div className="flex-1">
                <div className={`font-medium ${textColor}`}>{holiday.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span
                        className={`text-[10px] px-1.5 py-0.5 rounded text-white ${labelColor}`}
                    >
                        {holiday.type === "solar" ? "Dương lịch" : "Âm lịch"}
                    </span>
                </div>
            </div>
        </div>
    );
}
