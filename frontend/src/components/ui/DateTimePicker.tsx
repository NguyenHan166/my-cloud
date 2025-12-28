import React, { useState, useRef, useEffect } from "react";
import { Bell, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DateTimePickerProps {
    value?: string | null;
    onChange: (value: string | null) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    minDate?: Date;
}

interface PresetOption {
    label: string;
    getValue: () => Date;
    icon?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
    value,
    onChange,
    label = "Nhắc nhở",
    placeholder = "Chọn thời gian nhắc nhở",
    disabled = false,
    minDate = new Date(),
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        value ? new Date(value) : null
    );
    const [viewDate, setViewDate] = useState(selectedDate || new Date());
    const [hours, setHours] = useState(
        selectedDate ? selectedDate.getHours() : 9
    );
    const [minutes, setMinutes] = useState(
        selectedDate ? selectedDate.getMinutes() : 0
    );
    const containerRef = useRef<HTMLDivElement>(null);

    // Preset options
    const presets: PresetOption[] = [
        {
            label: "1 giờ nữa",
            icon: "⏰",
            getValue: () => {
                const date = new Date();
                date.setHours(date.getHours() + 1);
                return date;
            },
        },
        {
            label: "3 giờ nữa",
            icon: "⏰",
            getValue: () => {
                const date = new Date();
                date.setHours(date.getHours() + 3);
                return date;
            },
        },
        {
            label: "Ngày mai 9h",
            icon: "🌅",
            getValue: () => {
                const date = new Date();
                date.setDate(date.getDate() + 1);
                date.setHours(9, 0, 0, 0);
                return date;
            },
        },
        {
            label: "Tuần sau",
            icon: "📅",
            getValue: () => {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                date.setHours(9, 0, 0, 0);
                return date;
            },
        },
    ];

    // Update hours and minutes when value prop changes
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            setSelectedDate(date);
            setViewDate(date);
            setHours(date.getHours());
            setMinutes(date.getMinutes());
        } else {
            setSelectedDate(null);
            // Chỉ reset về 9h:00 khi chưa có giá trị
            setHours(9);
            setMinutes(0);
        }
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    // Calendar utilities
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const isSameDay = (date1: Date, date2: Date) => {
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    };

    // Format datetime theo timezone Việt Nam (GMT+7)
    const formatToVietnamTimezone = (date: Date): string => {
        // Lấy giờ local của browser (giả định user đang ở VN)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hour = String(date.getHours()).padStart(2, "0");
        const minute = String(date.getMinutes()).padStart(2, "0");
        const second = String(date.getSeconds()).padStart(2, "0");
        // Trả về ISO string với timezone +07:00 (Việt Nam)
        return `${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`;
    };

    const isBeforeMinDate = (date: Date) => {
        return date < minDate;
    };

    // Check if a date (without time) is before today
    const isDateBeforeToday = (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return compareDate < today;
    };

    const handlePresetClick = (preset: PresetOption) => {
        const date = preset.getValue();
        setSelectedDate(date);
        setViewDate(date);
        setHours(date.getHours());
        setMinutes(date.getMinutes());
        onChange(formatToVietnamTimezone(date));
        setIsOpen(false);
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(
            viewDate.getFullYear(),
            viewDate.getMonth(),
            day,
            hours,
            minutes
        );

        // Chỉ check datetime đầy đủ (ngày + giờ)
        if (isBeforeMinDate(newDate)) return;

        setSelectedDate(newDate);
        onChange(formatToVietnamTimezone(newDate));
    };

    const handleTimeChange = () => {
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setHours(hours, minutes);
            setSelectedDate(newDate);
            onChange(formatToVietnamTimezone(newDate));
        }
    };

    const handleClear = () => {
        setSelectedDate(null);
        onChange(null);
        setIsOpen(false);
    };

    const handleApply = () => {
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            newDate.setHours(hours, minutes);
            onChange(formatToVietnamTimezone(newDate));
        }
        setIsOpen(false);
    };

    const previousMonth = () => {
        setViewDate(
            new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
        );
    };

    const nextMonth = () => {
        setViewDate(
            new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
        );
    };

    const formatDisplayValue = () => {
        if (!value) return placeholder;
        const date = new Date(value);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Generate calendar days
    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(viewDate);
        const firstDay = getFirstDayOfMonth(viewDate);
        const days = [];

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10" />);
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(
                viewDate.getFullYear(),
                viewDate.getMonth(),
                day
            );
            const isSelected =
                selectedDate && isSameDay(currentDate, selectedDate);
            const isToday = isSameDay(currentDate, new Date());
            // Chỉ disable các ngày hoàn toàn trong quá khứ (không tính giờ)
            const isDisabled = isDateBeforeToday(currentDate);

            days.push(
                <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={`h-10 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                            ? "bg-blue-500 text-white shadow-lg scale-105"
                            : isToday
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold"
                              : isDisabled
                                ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    const monthNames = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
    ];

    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Bell className="w-4 h-4" />
                {label}
            </label>

            {/* Display Input */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-left transition-all ${
                        value
                            ? "border-blue-300 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    } ${
                        disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer"
                    } text-gray-900 dark:text-gray-100`}
                >
                    <span className={value ? "font-medium" : "text-gray-500"}>
                        {formatDisplayValue()}
                    </span>
                </button>

                {value && !disabled && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClear();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 
                                 text-gray-400 hover:text-red-500 dark:hover:text-red-400
                                 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg
                                 transition-colors"
                        title="Xóa nhắc nhở"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Dropdown Calendar */}
            {isOpen && (
                <div className="absolute z-50 mt-2 left-0 md:left-1/2 md:-translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm">
                    {/* Presets */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                            NHANH
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {presets.map((preset, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handlePresetClick(preset)}
                                    className="px-3 py-2 text-sm font-medium rounded-lg
                                             bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30
                                             text-blue-700 dark:text-blue-300
                                             hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50
                                             transition-all duration-200 hover:scale-105 hover:shadow-md"
                                >
                                    <span className="mr-1">{preset.icon}</span>
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Calendar Header */}
                    <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={previousMonth}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {monthNames[viewDate.getMonth()]}{" "}
                            {viewDate.getFullYear()}
                        </div>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-3">
                        {/* Day names */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map((day) => (
                                <div
                                    key={day}
                                    className="h-8 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {renderCalendar()}
                        </div>
                    </div>

                    {/* Time Picker */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-900/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Chọn giờ
                            </span>
                        </div>
                        <div className="flex items-center justify-center gap-4">
                            {/* Hours */}
                            <div className="flex flex-col items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setHours((h) => (h + 1) % 24);
                                        handleTimeChange();
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 
                                             text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
                                             transition-all hover:scale-110"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
                                </button>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={String(hours).padStart(2, "0")}
                                        onChange={(e) => {
                                            const val =
                                                parseInt(e.target.value) || 0;
                                            setHours(
                                                Math.max(0, Math.min(23, val))
                                            );
                                            handleTimeChange();
                                        }}
                                        className="w-20 px-3 py-3 text-center text-2xl font-bold
                                                 border-2 border-blue-200 dark:border-blue-800
                                                 rounded-xl bg-white dark:bg-gray-800
                                                 text-blue-600 dark:text-blue-400
                                                 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500
                                                 transition-all shadow-sm hover:shadow-md"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setHours((h) => (h - 1 + 24) % 24);
                                        handleTimeChange();
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 
                                             text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
                                             transition-all hover:scale-110"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                </button>
                            </div>

                            {/* Separator */}
                            <span className="text-3xl font-bold text-blue-500 dark:text-blue-400 animate-pulse">
                                :
                            </span>

                            {/* Minutes */}
                            <div className="flex flex-col items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMinutes((m) => (m + 1) % 60);
                                        handleTimeChange();
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 
                                             text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
                                             transition-all hover:scale-110"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
                                </button>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={String(minutes).padStart(2, "0")}
                                        onChange={(e) => {
                                            const val =
                                                parseInt(e.target.value) || 0;
                                            setMinutes(
                                                Math.max(0, Math.min(59, val))
                                            );
                                            handleTimeChange();
                                        }}
                                        className="w-20 px-3 py-3 text-center text-2xl font-bold
                                                 border-2 border-blue-200 dark:border-blue-800
                                                 rounded-xl bg-white dark:bg-gray-800
                                                 text-blue-600 dark:text-blue-400
                                                 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500
                                                 transition-all shadow-sm hover:shadow-md"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMinutes((m) => (m - 1 + 60) % 60);
                                        handleTimeChange();
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 
                                             text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
                                             transition-all hover:scale-110"
                                >
                                    <ChevronRight className="w-4 h-4 rotate-90" />
                                </button>
                            </div>
                        </div>

                        {/* Quick time presets */}
                        <div className="flex gap-1 mt-6 justify-center">
                            {[9, 12, 14, 18, 21].map((hour) => (
                                <button
                                    key={hour}
                                    type="button"
                                    onClick={() => {
                                        setHours(hour);
                                        setMinutes(0);
                                        handleTimeChange();
                                    }}
                                    className="px-2.5 py-1 text-xs font-medium rounded-md
                                             bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                                             hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400 dark:hover:border-blue-600
                                             text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
                                             transition-all"
                                >
                                    {String(hour).padStart(2, "0")}:00
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg
                                     border border-gray-300 dark:border-gray-600
                                     hover:bg-gray-50 dark:hover:bg-gray-700
                                     transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={!selectedDate}
                            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg
                                     bg-gradient-to-r from-blue-500 to-indigo-600
                                     text-white hover:from-blue-600 hover:to-indigo-700
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     transition-all shadow-md hover:shadow-lg"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            )}

            {value && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Bell className="w-3 h-3" />
                    Bạn sẽ nhận email nhắc nhở vào thời điểm đã chọn
                </p>
            )}
        </div>
    );
};
