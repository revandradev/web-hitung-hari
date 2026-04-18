export interface Holiday {
  date: string;
  name: string;
  isCutiBersama?: boolean;
}

export const holidays2026: Holiday[] = [
  { date: "2026-01-01", name: "Tahun Baru Masehi" },
  { date: "2026-03-22", name: "Hari Raya Nyepi" },
  { date: "2026-03-27", name: "Hari Raya Idul Fitri" },
  { date: "2026-03-28", name: "Hari Raya Idul Fitri" },
  { date: "2026-03-30", name: "Cuti Bersama Idul Fitri", isCutiBersama: true },
  { date: "2026-03-31", name: "Cuti Bersama Idul Fitri", isCutiBersama: true },
  { date: "2026-04-01", name: "Cuti Bersama Idul Fitri", isCutiBersama: true },
  { date: "2026-05-01", name: "Hari Buruh Internasional" },
  { date: "2026-05-22", name: "Kenaikan Isa Almasih" },
  { date: "2026-06-01", name: "Hari Lahir Pancasila" },
  { date: "2026-06-06", name: "Hari Raya Waisak" },
  { date: "2026-08-17", name: "Hari Kemerdekaan Republik Indonesia" },
  { date: "2026-08-19", name: "Cuti Bersama Kemerdekaan", isCutiBersama: true },
  { date: "2026-12-25", name: "Hari Raya Natal" },
  { date: "2026-12-26", name: "Cuti Bersama Natal", isCutiBersama: true },
];

export const holidays2025: Holiday[] = [
  { date: "2025-01-01", name: "Tahun Baru Masehi" },
  { date: "2025-03-11", name: "Hari Raya Nyepi" },
  { date: "2025-03-31", name: "Hari Raya Idul Fitri" },
  { date: "2025-04-01", name: "Hari Raya Idul Fitri" },
  { date: "2025-04-02", name: "Cuti Bersama Idul Fitri", isCutiBersama: true },
  { date: "2025-04-03", name: "Cuti Bersama Idul Fitri", isCutiBersama: true },
  { date: "2025-05-01", name: "Hari Buruh Internasional" },
  { date: "2025-05-30", name: "Kenaikan Isa Almasih" },
  { date: "2025-06-01", name: "Hari Lahir Pancasila" },
  { date: "2025-06-07", name: "Hari Raya Waisak" },
  { date: "2025-08-17", name: "Hari Kemerdekaan Republik Indonesia" },
  { date: "2025-08-18", name: "Cuti Bersama Kemerdekaan", isCutiBersama: true },
  { date: "2025-12-25", name: "Hari Raya Natal" },
  { date: "2025-12-26", name: "Cuti Bersama Natal", isCutiBersama: true },
];

export const holidays2027: Holiday[] = [
  { date: "2027-01-01", name: "Tahun Baru Masehi" },
  { date: "2027-03-09", name: "Hari Raya Nyepi" },
  { date: "2027-03-20", name: "Hari Raya Idul Fitri" },
  { date: "2027-03-21", name: "Hari Raya Idul Fitri" },
  { date: "2027-03-22", name: "Cuti Bersama Idul Fitri", isCutiBersama: true },
  { date: "2027-03-23", name: "Cuti Bersama Idul Fitri", isCutiBersama: true },
  { date: "2027-05-01", name: "Hari Buruh Internasional" },
  { date: "2027-05-13", name: "Kenaikan Isa Almasih" },
  { date: "2027-06-01", name: "Hari Lahir Pancasila" },
  { date: "2027-05-26", name: "Hari Raya Waisak" },
  { date: "2027-08-17", name: "Hari Kemerdekaan Republik Indonesia" },
  { date: "2027-08-18", name: "Cuti Bersama Kemerdekaan", isCutiBersama: true },
  { date: "2027-12-25", name: "Hari Raya Natal" },
  { date: "2027-12-26", name: "Cuti Bersama Natal", isCutiBersama: true },
];

export const yearHolidays: Record<number, Holiday[]> = {
  2025: holidays2025,
  2026: holidays2026,
  2027: holidays2027,
};

export const availableYears = [2025, 2026, 2027] as const;

export function getHolidayByDate(dateStr: string, year: number): Holiday | undefined {
  return yearHolidays[year]?.find((h) => h.date === dateStr);
}

export function getHolidayDates(year: number): Set<string> {
  return new Set(yearHolidays[year]?.map((h) => h.date) || []);
}

export function getHolidays(year: number): Holiday[] {
  return yearHolidays[year] || holidays2026;
}
