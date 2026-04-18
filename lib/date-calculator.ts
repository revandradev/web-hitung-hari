import { differenceInDays, addDays, format, parseISO, isValid } from "date-fns";
import { holidayDates, getHolidayByDate, type Holiday } from "@/data/holidays";

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isHoliday(date: Date): boolean {
  const dateStr = format(date, "yyyy-MM-dd");
  return holidayDates.has(dateStr);
}

export function getHolidayInfo(date: Date): Holiday | undefined {
  const dateStr = format(date, "yyyy-MM-dd");
  return getHolidayByDate(dateStr);
}

export function isWorkingDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}

export interface CalculationBreakdown {
  totalDays: number;
  workingDays: number;
  weekendDays: number;
  holidays: number;
  holidayDetails: Array<{ date: string; name: string }>;
}

export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  let current = new Date(startDate);

  while (current <= endDate) {
    if (isWorkingDay(current)) {
      count++;
    }
    current = addDays(current, 1);
  }

  return count;
}

export function getBreakdown(startDate: Date, endDate: Date): CalculationBreakdown {
  let workingDays = 0;
  let weekendDays = 0;
  let holidays = 0;
  const holidayDetails: Array<{ date: string; name: string }> = [];

  let current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = format(current, "yyyy-MM-dd");

    if (isWeekend(current)) {
      weekendDays++;
    } else if (isHoliday(current)) {
      holidays++;
      const holiday = getHolidayByDate(dateStr);
      if (holiday) {
        holidayDetails.push({ date: dateStr, name: holiday.name });
      }
    } else {
      workingDays++;
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
  };
}

export function calculateEndDate(startDate: Date, targetWorkingDays: number): {
  endDate: Date;
  breakdown: CalculationBreakdown;
} {
  let workingDaysCount = 0;
  let current = new Date(startDate);

  while (workingDaysCount < targetWorkingDays) {
    if (isWorkingDay(current)) {
      workingDaysCount++;
    }
    if (workingDaysCount < targetWorkingDays) {
      current = addDays(current, 1);
    }
  }

  const breakdown = getBreakdown(startDate, current);

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
