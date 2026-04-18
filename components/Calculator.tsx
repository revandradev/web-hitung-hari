"use client";

import { useState, useEffect } from "react";
import {
  calculateWorkingDays,
  calculateEndDate,
  getBreakdown,
  parseDate,
  formatDateDisplay,
  formatDate,
  type CalculationBreakdown,
} from "@/lib/date-calculator";
import { holidays2026 } from "@/data/holidays";

type CalcMode = "forward" | "reverse";

export default function Calculator() {
  const [mode, setMode] = useState<CalcMode>("forward");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetDays, setTargetDays] = useState("");
  const [showHolidays, setShowHolidays] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    workingDays?: number;
    endDate?: Date;
    breakdown?: CalculationBreakdown;
    error?: string;
  }>({});

  useEffect(() => {
    if (!startDate) {
      setResult({});
      return;
    }

    const start = parseDate(startDate);
    if (!start) {
      setResult({ error: "Format tanggal tidak valid" });
      return;
    }

    if (mode === "forward") {
      if (!endDate) {
        setResult({});
        return;
      }

      const end = parseDate(endDate);
      if (!end) {
        setResult({ error: "Format tanggal tidak valid" });
        return;
      }

      const [finalStart, finalEnd] = start <= end ? [start, end] : [end, start];

      const workingDays = calculateWorkingDays(finalStart, finalEnd);
      const breakdown = getBreakdown(finalStart, finalEnd);

      setResult({ workingDays, breakdown });
    } else {
      const days = parseInt(targetDays);
      if (!targetDays || isNaN(days) || days < 0) {
        setResult({});
        return;
      }

      const { endDate: calcEndDate, breakdown } = calculateEndDate(start, days);

      setResult({ endDate: calcEndDate, breakdown });
    }
  }, [mode, startDate, endDate, targetDays]);

  const hasResult = result.breakdown !== undefined;
  const hasError = result.error !== undefined;

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setTargetDays("");
    setResult({});
  };

  const handleThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
  };

  const handleCopyResult = () => {
    if (!hasResult) return;

    let text = "";
    if (mode === "forward" && result.workingDays !== undefined) {
      text = `Total Hari Kerja: ${result.workingDays} hari\n`;
      text += `Total Hari Kalender: ${result.breakdown?.totalDays} hari\n`;
      text += `Weekend: ${result.breakdown?.weekendDays} hari\n`;
      text += `Hari Libur: ${result.breakdown?.holidays} hari`;
    } else if (result.endDate) {
      text = `Tanggal Selesai: ${formatDateDisplay(result.endDate)}\n`;
      text += `Setelah ${result.breakdown?.workingDays} hari kerja\n`;
      text += `Weekend: ${result.breakdown?.weekendDays} hari\n`;
      text += `Hari Libur: ${result.breakdown?.holidays} hari`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 border border-gray-100 dark:border-gray-700 transition-shadow hover:shadow-2xl">
        <ModeToggle mode={mode} onModeChange={setMode} />

        <div className="grid gap-4 sm:gap-6">
          <DateInput
            label="Tanggal Mulai"
            value={startDate}
            onChange={setStartDate}
            placeholder="YYYY-MM-DD"
          />

          {mode === "forward" ? (
            <DateInput
              label="Tanggal Selesai"
              value={endDate}
              onChange={setEndDate}
              placeholder="YYYY-MM-DD"
            />
          ) : (
            <div className="space-y-2">
              <label htmlFor="target-days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Jumlah Hari Kerja
              </label>
              <input
                id="target-days"
                type="number"
                min="0"
                value={targetDays}
                onChange={(e) => setTargetDays(e.target.value)}
                placeholder="Masukkan jumlah hari kerja"
                className="w-full px-4 py-3 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              />
            </div>
          )}
        </div>

        <QuickActions onReset={handleReset} onThisMonth={handleThisMonth} />

        {hasError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {result.error}
            </div>
          </div>
        )}

        {hasResult ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
            <ResultDisplay
              mode={mode}
              workingDays={result.workingDays}
              endDate={result.endDate}
              breakdown={result.breakdown}
              onCopy={handleCopyResult}
              copied={copied}
            />
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      <HolidayListToggle isOpen={showHolidays} onToggle={() => setShowHolidays(!showHolidays)} holidays={holidays2026} />

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Data Libur Nasional Indonesia Tahun 2026
      </div>
    </div>
  );
}

function QuickActions({ onReset, onThisMonth }: { onReset: () => void; onThisMonth: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 min-h-[40px]"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset
      </button>
      <button
        onClick={onThisMonth}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 min-h-[40px]"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Bulan Ini
      </button>
    </div>
  );
}

function ModeToggle({ mode, onModeChange }: { mode: CalcMode; onModeChange: (mode: CalcMode) => void }) {
  return (
    <div className="relative flex items-center justify-center p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <div
        className="absolute inset-y-1 w-1/2 bg-white dark:bg-gray-600 rounded-md shadow-sm transition-all duration-300 ease-out"
        style={{ left: mode === "forward" ? "4px" : "calc(50% - 4px)" }}
      />
      <button
        onClick={() => onModeChange("forward")}
        className={`relative z-10 px-4 sm:px-6 py-2.5 min-h-[44px] rounded-md font-medium transition-all duration-200 ${
          mode === "forward"
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 active:scale-95"
        }`}
      >
        Hitung Hari Kerja
      </button>
      <button
        onClick={() => onModeChange("reverse")}
        className={`relative z-10 px-4 sm:px-6 py-2.5 min-h-[44px] rounded-md font-medium transition-all duration-200 ${
          mode === "reverse"
            ? "text-blue-600 dark:text-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 active:scale-95"
        }`}
      >
        Hitung Tanggal Selesai
      </button>
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        id={inputId}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 min-h-[48px] border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
      />
    </div>
  );
}

function ResultDisplay({
  mode,
  workingDays,
  endDate,
  breakdown,
  onCopy,
  copied,
}: {
  mode: CalcMode;
  workingDays?: number;
  endDate?: Date;
  breakdown: CalculationBreakdown;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="p-6 bg-linear-to-r from-blue-500 to-blue-600 rounded-xl text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          {mode === "forward" ? (
            <div className="text-center">
              <p className="text-blue-100 text-sm mb-1 font-medium">Total Hari Kerja</p>
              <p className="text-4xl sm:text-5xl font-bold tabular-nums">{workingDays}</p>
              <p className="text-blue-100 text-sm mt-2">
                dari {breakdown.totalDays} hari kalender
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-blue-100 text-sm mb-1 font-medium">Tanggal Selesai</p>
              <p className="text-2xl sm:text-3xl font-bold">{endDate && formatDateDisplay(endDate)}</p>
              <p className="text-blue-100 text-sm mt-2">
                Setelah {breakdown.workingDays} hari kerja
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onCopy}
          className="absolute top-2 right-2 p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 opacity-0"
          title="Salin hasil"
        >
          {copied ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      <DayBreakdown breakdown={breakdown} />
    </div>
  );
}

function DayBreakdown({ breakdown }: { breakdown: CalculationBreakdown }) {
  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-4 border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white">Rincian Perhitungan</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="group p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-green-500 group-hover:scale-125 transition-transform duration-200" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Hari Kerja</p>
          </div>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400 tabular-nums">{breakdown.workingDays}</p>
        </div>

        <div className="group p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-orange-500 group-hover:scale-125 transition-transform duration-200" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Weekend</p>
          </div>
          <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400 tabular-nums">{breakdown.weekendDays}</p>
        </div>

        <div className="group p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 col-span-1 sm:col-span-2 transition-all duration-200 hover:border-red-300 dark:hover:border-red-600 hover:shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 group-hover:scale-125 transition-transform duration-200" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Hari Libur Nasional</p>
          </div>
          <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-3 tabular-nums">{breakdown.holidays}</p>

          {breakdown.holidayDetails.length > 0 && (
            <div className="space-y-2">
              {breakdown.holidayDetails.map((holiday) => (
                <div
                  key={holiday.date}
                  className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <span className="font-mono font-medium text-gray-900 dark:text-gray-200">{holiday.date}</span>
                  <span className="text-gray-400">—</span>
                  <span className="flex-1">{holiday.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {breakdown.holidayDetails.length === 0 && breakdown.holidays === 0 && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
          Tidak ada hari libur dalam periode ini
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4 animate-pulse">
        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Mulai Perhitungan
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs mx-auto">
        Pilih tanggal mulai dan tanggal selesai (atau jumlah hari kerja) untuk melihat hasil perhitungan.
      </p>
    </div>
  );
}

function HolidayListToggle({ isOpen, onToggle, holidays }: { isOpen: boolean; onToggle: () => void; holidays: typeof holidays2026 }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-gray-900 dark:text-white">Daftar Hari Libur 2026</span>
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
            {holidays.length}
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-64 overflow-y-auto space-y-1">
            {holidays.map((holiday) => (
              <div
                key={holiday.date}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
              >
                <span className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300 w-24 flex-shrink-0">
                  {holiday.date}
                </span>
                <span className="text-sm text-gray-900 dark:text-gray-100 flex-1">{holiday.name}</span>
                {holiday.isCutiBersama && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full flex-shrink-0">
                    Cuti Bersama
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
