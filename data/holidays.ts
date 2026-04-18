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

export const holidayDates = new Set(holidays2026.map((h) => h.date));

export function getHolidayByDate(dateStr: string): Holiday | undefined {
  return holidays2026.find((h) => h.date === dateStr);
}
