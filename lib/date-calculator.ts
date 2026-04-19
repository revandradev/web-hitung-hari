import { differenceInDays, addDays, format, parseISO, isValid } from "date-fns";
import { getHolidayDates, getHolidayByDate, getHolidays, type Holiday } from "@/data/holidays";

// Default excluded days: Sunday (0) and Saturday (6)
export const DEFAULT_EXCLUDED_DAYS = new Set([0, 6]);

export function isExcludedDay(date: Date, excludedDays?: Set<number>): boolean {
  const day = date.getDay();
  return (excludedDays || DEFAULT_EXCLUDED_DAYS).has(day);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isHoliday(date: Date, year: number = 2026, excludedHolidayIds?: Set<string>): boolean {
  const dateStr = format(date, "yyyy-MM-dd");
  const holidaySet = getHolidayDates(year);
  const isHoliday = holidaySet.has(dateStr);
  if (!isHoliday || !excludedHolidayIds) return isHoliday;
  return !excludedHolidayIds.has(dateStr);
}

export function getHolidayInfo(date: Date, year: number = 2026): Holiday | undefined {
  const dateStr = format(date, "yyyy-MM-dd");
  return getHolidayByDate(dateStr, year);
}

export function isWorkingDay(date: Date, year: number = 2026, excludedHolidayIds?: Set<string>, excludedDays?: Set<number>): boolean {
  return !isExcludedDay(date, excludedDays) && !isHoliday(date, year, excludedHolidayIds);
}

export interface CalculationBreakdown {
  totalDays: number;
  workingDays: number;
  weekendDays: number;
  holidays: number;
  holidayDetails: Array<{ date: string; name: string; id: string }>;
  excludedHolidays: number;
  excludedDaysCount: number;
}

export function calculateWorkingDays(
  startDate: Date,
  endDate: Date,
  year: number = 2026,
  excludedHolidayIds?: Set<string>,
  excludedDays?: Set<number>
): number {
  let count = 0;
  let current = new Date(startDate);

  while (current <= endDate) {
    if (isWorkingDay(current, year, excludedHolidayIds, excludedDays)) {
      count++;
    }
    current = addDays(current, 1);
  }

  return count;
}

export function getBreakdown(
  startDate: Date,
  endDate: Date,
  year: number = 2026,
  excludedHolidayIds?: Set<string>,
  excludedDays?: Set<number>
): CalculationBreakdown {
  let workingDays = 0;
  let weekendDays = 0;
  let holidays = 0;
  let excludedHolidays = 0;
  let excludedDaysCount = 0;
  const holidayDetails: Array<{ date: string; name: string; id: string }> = [];

  let current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = format(current, "yyyy-MM-dd");

    if (isExcludedDay(current, excludedDays)) {
      // Check if it's a default weekend or custom excluded day
      if (isWeekend(current)) {
        weekendDays++;
      } else {
        excludedDaysCount++;
      }
    } else {
      const holiday = getHolidayByDate(dateStr, year);
      if (holiday) {
        if (excludedHolidayIds?.has(dateStr)) {
          excludedHolidays++;
          workingDays++;
        } else {
          holidays++;
          holidayDetails.push({ date: dateStr, name: holiday.name, id: dateStr });
        }
      } else {
        workingDays++;
      }
    }

    current = addDays(current, 1);
  }

  const totalDays = differenceInDays(endDate, startDate) + 1;

  return {
    totalDays,
    workingDays,
    weekendDays,
    holidays,
    holidayDetails,
    excludedHolidays,
    excludedDaysCount,
  };
}

export function calculateEndDate(
  startDate: Date,
  targetWorkingDays: number,
  year: number = 2026,
  excludedHolidayIds?: Set<string>,
  excludedDays?: Set<number>
): {
  endDate: Date;
  breakdown: CalculationBreakdown;
} {
  let workingDaysCount = 0;
  let current = new Date(startDate);

  while (workingDaysCount < targetWorkingDays) {
    if (isWorkingDay(current, year, excludedHolidayIds, excludedDays)) {
      workingDaysCount++;
    }
    if (workingDaysCount < targetWorkingDays) {
      current = addDays(current, 1);
    }
  }

  const breakdown = getBreakdown(startDate, current, year, excludedHolidayIds, excludedDays);

  return {
    endDate: current,
    breakdown,
  };
}

export function parseDate(dateStr: string): Date | null {
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

export function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDateDisplay(date: Date, locale: string = "id-ID"): string {
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getAvailableHolidays(year: number): Array<{ id: string; date: string; name: string; isCutiBersama?: boolean }> {
  return getHolidays(year).map((h) => ({
    id: h.date,
    date: h.date,
    name: h.name,
    isCutiBersama: h.isCutiBersama,
  }));
}
