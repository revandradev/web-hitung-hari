"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWeekend, getMonth, getYear } from "date-fns";
import { id } from "date-fns/locale";
import { getHolidayByDate, getHolidays } from "@/data/holidays";
import type { Holiday } from "@/data/holidays";

interface CalendarViewProps {
  year: number;
  selectedStartDate?: Date;
  selectedEndDate?: Date;
  onDateSelect: (date: Date) => void;
  mode: "single" | "range";
}

export default function CalendarView({ year, selectedStartDate, selectedEndDate, onDateSelect, mode }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(getMonth(selectedStartDate || new Date()));
  const [currentYear, setCurrentYear] = useState(getYear(selectedStartDate || new Date()));

  const holidays = getHolidays(currentYear);

  // Generate days for current month
  const monthDays = useMemo(() => {
    const firstDay = startOfMonth(new Date(currentYear, currentMonth));
    const lastDay = endOfMonth(new Date(currentYear, currentMonth));

    // Get all days in the month
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });

    // Add padding days from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay();
    const paddingDays = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      const paddingDate = new Date(firstDay);
      paddingDate.setDate(paddingDate.getDate() - (firstDayOfWeek - i));
      paddingDays.push({ date: paddingDate, isPadding: true });
    }

    return [...paddingDays, ...days.map(date => ({ date, isPadding: false }))];
  }, [currentMonth, currentYear]);

  // Check if a date is selected
  const isSelected = (date: Date) => {
    if (mode === "single") {
      return selectedStartDate ? isSameDay(date, selectedStartDate) : false;
    } else {
      if (!selectedStartDate) return false;
      if (isSameDay(date, selectedStartDate)) return true;
      if (selectedEndDate && isSameDay(date, selectedEndDate)) return true;
      if (selectedEndDate && date > selectedStartDate && date < selectedEndDate) return true;
      return false;
    }
  };

  // Check if a date is a holiday
  const isHoliday = (date: Date): Holiday | undefined => {
    return getHolidayByDate(format(date, "yyyy-MM-dd"), currentYear);
  };

  // Check if date is in range
  const isInRange = (date: Date) => {
    if (mode !== "range" || !selectedStartDate || !selectedEndDate) return false;
    return date > selectedStartDate && date < selectedEndDate;
  };

  // Check if date is start or end of range
  const isRangeStart = (date: Date) => {
    return selectedStartDate && isSameDay(date, selectedStartDate);
  };

  const isRangeEnd = (date: Date) => {
    return selectedEndDate && isSameDay(date, selectedEndDate);
  };

  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden relative z-0">
      {/* Month Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map(({ date, isPadding }) => {
            const holiday = isHoliday(date);
            const weekend = isWeekend(date);
            const selected = isSelected(date);
            const inRange = isInRange(date);
            const rangeStart = isRangeStart(date);
            const rangeEnd = isRangeEnd(date);

            return (
              <button
                key={date.toISOString()}
                onClick={() => !isPadding && onDateSelect(date)}
                disabled={isPadding}
                className={`
                  relative aspect-square p-1 rounded-lg text-sm font-medium transition-all duration-200
                  ${isPadding ? 'invisible' : 'visible'}
                  ${selected && !inRange ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                  ${inRange && !rangeStart && !rangeEnd ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                  ${rangeStart ? 'bg-blue-600 text-white rounded-l-lg' : ''}
                  ${rangeEnd ? 'bg-blue-600 text-white rounded-r-lg' : ''}
                  ${!selected && !inRange ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                  ${weekend && !selected && !inRange ? 'text-orange-600 dark:text-orange-400' : ''}
                  ${holiday && !selected && !inRange ? 'text-red-600 dark:text-red-400' : ''}
                  ${!selected && !inRange ? 'text-gray-900 dark:text-gray-100' : ''}
                `}
                title={holiday ? holiday.name : undefined}
              >
                <span className="relative z-10">{format(date, "d")}</span>
                {holiday && !selected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">Terpilih</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30" />
            <span className="text-gray-600 dark:text-gray-400">Rentang</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-200 dark:bg-orange-900/30" />
            <span className="text-gray-600 dark:text-gray-400">Weekend</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" />
            <span className="text-gray-600 dark:text-gray-400">Libur</span>
          </div>
        </div>
      </div>
    </div>
  );
}
