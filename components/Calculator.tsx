"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

// Local storage key
const STORAGE_KEY = "working-days-calculator-state";

export default function Calculator() {
  const [mode, setMode] = useState<CalcMode>("forward");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetDays, setTargetDays] = useState("");
  const [showHolidays, setShowHolidays] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [wasSwapped, setWasSwapped] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [result, setResult] = useState<{
    workingDays?: number;
    endDate?: Date;
    breakdown?: CalculationBreakdown;
    error?: string;
  }>({});

  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);
  const targetDaysInputRef = useRef<HTMLInputElement>(null);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMode(parsed.mode || "forward");
        setStartDate(parsed.startDate || "");
        setEndDate(parsed.endDate || "");
        setTargetDays(parsed.targetDays || "");
      }
    } catch (error) {
      console.error("Failed to load saved state:", error);
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, startDate, endDate, targetDays })
      );
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }, [mode, startDate, endDate, targetDays]);

  // Calculate with loading state
  useEffect(() => {
    if (!startDate) {
      setResult({});
      setWasSwapped(false);
      return;
    }

    const start = parseDate(startDate);
    if (!start) {
      setResult({ error: "Format tanggal tidak valid" });
      return;
    }

    setIsCalculating(true);

    // Small delay for loading state visibility
    const timer = setTimeout(() => {
      if (mode === "forward") {
        if (!endDate) {
          setResult({});
          setWasSwapped(false);
          setIsCalculating(false);
          return;
        }

        const end = parseDate(endDate);
        if (!end) {
          setResult({ error: "Format tanggal tidak valid" });
          setIsCalculating(false);
          return;
        }

        const swapped = start > end;
        setWasSwapped(swapped);
        const [finalStart, finalEnd] = swapped ? [end, start] : [start, end];

        const workingDays = calculateWorkingDays(finalStart, finalEnd);
        const breakdown = getBreakdown(finalStart, finalEnd);

        setResult({ workingDays, breakdown });
      } else {
        const days = parseInt(targetDays);
        if (!targetDays || isNaN(days) || days < 0) {
          setResult({});
          setWasSwapped(false);
          setIsCalculating(false);
          return;
        }

        const { endDate: calcEndDate, breakdown } = calculateEndDate(start, days);

        setResult({ endDate: calcEndDate, breakdown });
      }
      setIsCalculating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [mode, startDate, endDate, targetDays]);

  const hasResult = result.breakdown !== undefined;
  const hasError = result.error !== undefined;
  const hasInput = startDate || endDate || targetDays;

  const handleReset = useCallback(() => {
    if (hasInput) {
      setShowResetConfirm(true);
    } else {
      performReset();
    }
  }, [hasInput]);

  const performReset = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setTargetDays("");
    setResult({});
    setWasSwapped(false);
    setShowResetConfirm(false);
    startDateInputRef.current?.focus();
  }, []);

  const handleThisMonth = useCallback(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
    startDateInputRef.current?.focus();
  }, []);

  const handleToday = useCallback(() => {
    const today = new Date();
    setStartDate(formatDate(today));
    setEndDate(formatDate(today));
    startDateInputRef.current?.focus();
  }, []);

  const handleThisWeek = useCallback(() => {
    const now = new Date();
    const firstDay = new Date(now);
    const day = firstDay.getDay();
    const diff = firstDay.getDate() - day + (day === 0 ? -6 : 1);
    firstDay.setDate(diff);
    const lastDay = new Date(firstDay);
    lastDay.setDate(lastDay.getDate() + 4);

    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
    startDateInputRef.current?.focus();
  }, []);

  const handleThisQuarter = useCallback(() => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const firstDay = new Date(now.getFullYear(), quarter * 3, 1);
    const lastDay = new Date(now.getFullYear(), quarter * 3 + 3, 0);

    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
    startDateInputRef.current?.focus();
  }, []);

  const handleThisYear = useCallback(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);

    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
    startDateInputRef.current?.focus();
  }, []);

  const handleCopyResult = useCallback(() => {
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
  }, [hasResult, mode, result]);

  const resultText = hasResult
    ? mode === "forward"
      ? `${result.workingDays} hari kerja dari ${result.breakdown?.totalDays} hari kalender`
      : `Tanggal selesai: ${result.endDate && formatDateDisplay(result.endDate)}`
    : "";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      <div id="main-content" className="w-full max-w-2xl mx-auto space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 border border-gray-100 dark:border-gray-700 transition-shadow hover:shadow-2xl">
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-2">
            <ModeToggle mode={mode} onModeChange={setMode} />
          </div>

          <div className="grid gap-4 sm:gap-6">
            <DateInput
              ref={startDateInputRef}
              label="Tanggal Mulai"
              value={startDate}
              onChange={setStartDate}
              placeholder="YYYY-MM-DD"
              invalid={!startDate ? false : !parseDate(startDate)}
            />

            {mode === "forward" ? (
              <DateInput
                ref={endDateInputRef}
                label="Tanggal Selesai"
                value={endDate}
                onChange={setEndDate}
                placeholder="YYYY-MM-DD"
                invalid={!endDate ? false : !parseDate(endDate)}
              />
            ) : (
              <div className="space-y-2">
                <label htmlFor="target-days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Jumlah Hari Kerja
                </label>
                <input
                  ref={targetDaysInputRef}
                  id="target-days"
                  type="number"
                  min="0"
                  value={targetDays}
                  onChange={(e) => setTargetDays(e.target.value)}
                  placeholder="Masukkan jumlah hari kerja"
                  className={`w-full px-4 py-3 min-h-[48px] border rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 ${
                    targetDays && (isNaN(parseInt(targetDays)) || parseInt(targetDays) < 0)
                      ? "border-red-300 dark:border-red-600 focus:ring-red-500/20 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                />
                {targetDays && (isNaN(parseInt(targetDays)) || parseInt(targetDays) < 0) && (
                  <p className="text-sm text-red-600 dark:text-red-400">Masukkan angka positif yang valid</p>
                )}
              </div>
            )}
          </div>

          <QuickActions
            onReset={handleReset}
            onThisMonth={handleThisMonth}
            onToday={handleToday}
            onThisWeek={handleThisWeek}
            onThisQuarter={handleThisQuarter}
            onThisYear={handleThisYear}
          />

          {wasSwapped && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Tanggal mulai & selesai ditukar agar sesuai urutan</span>
            </div>
          )}

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

          {isCalculating ? (
            <LoadingSkeleton />
          ) : hasResult ? (
            <>
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
                <ResultDisplay
                  mode={mode}
                  workingDays={result.workingDays}
                  endDate={result.endDate}
                  breakdown={result.breakdown!}
                  onCopy={handleCopyResult}
                  copied={copied}
                />
              </div>
              {/* Mobile bottom sheet trigger */}
              <div className="sm:hidden fixed bottom-4 right-4 z-40">
                <button
                  onClick={() => setShowMobileSheet(!showMobileSheet)}
                  className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                  aria-label="Toggle result"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        <HolidayListToggle isOpen={showHolidays} onToggle={() => setShowHolidays(!showHolidays)} holidays={holidays2026} />

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Data Libur Nasional Indonesia Tahun 2026
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      {hasResult && (
        <div
          className={`fixed inset-0 z-50 sm:hidden transition-opacity duration-300 ${
            showMobileSheet ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSheet(false)} />
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl transition-transform duration-300 ${
              showMobileSheet ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Hasil Perhitungan</h3>
              <button
                onClick={() => setShowMobileSheet(false)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <ResultDisplay
                mode={mode}
                workingDays={result.workingDays}
                endDate={result.endDate}
                breakdown={result.breakdown!}
                onCopy={handleCopyResult}
                copied={copied}
              />
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Konfirmasi Reset</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Semua input akan dihapus. Lanjutkan?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={performReset}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Ya, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen reader live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {resultText}
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl" />
          <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl" />
          <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl col-span-1 sm:col-span-2" />
        </div>
      </div>
    </div>
  );
}

function QuickActions({
  onReset,
  onThisMonth,
  onToday,
  onThisWeek,
  onThisQuarter,
  onThisYear,
}: {
  onReset: () => void;
  onThisMonth: () => void;
  onToday: () => void;
  onThisWeek: () => void;
  onThisQuarter: () => void;
  onThisYear: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onToday}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 min-h-[40px]"
        >
          Hari Ini
        </button>
        <button
          onClick={onThisWeek}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 min-h-[40px]"
        >
          Minggu Ini
        </button>
        <button
          onClick={onThisMonth}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 min-h-[40px]"
        >
          Bulan Ini
        </button>
        <button
          onClick={onThisQuarter}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 min-h-[40px]"
        >
          Kuartal Ini
        </button>
        <button
          onClick={onThisYear}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 min-h-[40px]"
        >
          Tahun Ini
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors duration-200 min-h-[40px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Form
        </button>
      </div>
    </div>
  );
}

function ModeToggle({ mode, onModeChange }: { mode: CalcMode; onModeChange: (mode: CalcMode) => void }) {
  return (
    <div className="relative flex gap-1.5 p-1.5 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-xl shadow-inner ring-1 ring-gray-200 dark:ring-gray-700">
      <div
        className="absolute inset-y-1.5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-600 rounded-lg shadow-lg transition-all duration-300 ease-out z-0"
        style={{
          left: mode === "forward" ? "6px" : "calc(50% + 3px)",
          width: "calc(50% - 9px)"
        }}
      />
      <div className="relative flex flex-1 gap-1.5">
        <button
          onClick={() => onModeChange("forward")}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-lg font-medium transition-all duration-200 ${
            mode === "forward"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-600 dark:text-gray-400 hover:text-indigo-900 dark:hover:text-indigo-300"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="hidden sm:inline">Hitung Hari Kerja</span>
          <span className="sm:hidden">Hari Kerja</span>
        </button>
        <button
          onClick={() => onModeChange("reverse")}
          className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-3 min-h-[48px] rounded-lg font-medium transition-all duration-200 ${
            mode === "reverse"
              ? "text-pink-600 dark:text-pink-400"
              : "text-gray-600 dark:text-gray-400 hover:text-pink-900 dark:hover:text-pink-300"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="hidden sm:inline">Hitung Tanggal</span>
          <span className="sm:hidden">Hitung Tanggal</span>
        </button>
      </div>
    </div>
  );
}

interface DateInputProps {
  ref?: React.Ref<HTMLInputElement>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  invalid?: boolean;
}

function DateInput({ ref, label, value, onChange, placeholder, invalid }: DateInputProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 min-h-[48px] border rounded-lg focus:ring-4 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 cursor-pointer ${
          invalid
            ? "border-red-300 dark:border-red-600 focus:ring-red-500/20 focus:border-red-500"
            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500/20 hover:border-gray-400 dark:hover:border-gray-500"
        }`}
        aria-invalid={invalid ? "true" : "false"}
      />
      {invalid && <p className="text-sm text-red-600 dark:text-red-400">Format tanggal tidak valid</p>}
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
