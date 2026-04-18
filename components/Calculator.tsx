"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  calculateWorkingDays,
  calculateEndDate,
  getBreakdown,
  parseDate,
  formatDateDisplay,
  formatDate,
  getAvailableHolidays,
  type CalculationBreakdown,
} from "@/lib/date-calculator";
import { availableYears, holidays2026 } from "@/data/holidays";

type CalcMode = "forward" | "reverse";

// Local storage keys
const STORAGE_KEY = "working-days-calculator-state";
const HISTORY_KEY = "working-days-calculator-history";

// History item type
type HistoryItem = {
  id: string;
  mode: CalcMode;
  year: number;
  startDate: string;
  endDate?: string;
  targetDays?: string;
  result: {
    workingDays?: number;
    endDate?: string;
    breakdown?: CalculationBreakdown;
  };
  timestamp: number;
};

export default function Calculator() {
  const [mode, setMode] = useState<CalcMode>("forward");
  const [year, setYear] = useState(2026);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetDays, setTargetDays] = useState("");
  const [showHolidays, setShowHolidays] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showExcludeHolidays, setShowExcludeHolidays] = useState(false);
  const [excludedHolidayIds, setExcludedHolidayIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [wasSwapped, setWasSwapped] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [result, setResult] = useState<{
    workingDays?: number;
    endDate?: Date;
    breakdown?: CalculationBreakdown;
    error?: string;
  }>({});

  const startDateInputRef = useRef<HTMLInputElement>(null);
  const endDateInputRef = useRef<HTMLInputElement>(null);
  const targetDaysInputRef = useRef<HTMLInputElement>(null);

  // Available holidays for exclusion
  const availableHolidays = getAvailableHolidays(year);

  // Dark mode detection
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    const isDark = savedDarkMode === "true" ||
      (!savedDarkMode && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem("darkMode", String(newValue));
      if (newValue) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
      return newValue;
    });
  }, []);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMode(parsed.mode || "forward");
        setYear(parsed.year || 2026);
        setStartDate(parsed.startDate || "");
        setEndDate(parsed.endDate || "");
        setTargetDays(parsed.targetDays || "");
        if (parsed.excludedHolidayIds) {
          setExcludedHolidayIds(new Set(parsed.excludedHolidayIds));
        }
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
        JSON.stringify({
          mode,
          year,
          startDate,
          endDate,
          targetDays,
          excludedHolidayIds: Array.from(excludedHolidayIds),
        })
      );
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }, [mode, year, startDate, endDate, targetDays, excludedHolidayIds]);

  // Show toast notification
  const showToastNotification = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  // Load history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }, []);

  // Save to history
  const saveToHistory = useCallback((calcResult: HistoryItem["result"]) => {
    setHistory((prev) => {
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        mode,
        year,
        startDate,
        endDate: mode === "forward" ? endDate : undefined,
        targetDays: mode === "reverse" ? targetDays : undefined,
        result: calcResult,
        timestamp: Date.now(),
      };

      const newHistory = [newItem, ...prev].slice(0, 5); // Keep only last 5
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, [mode, year, startDate, endDate, targetDays]);

  // Restore from history
  const restoreFromHistory = useCallback((item: HistoryItem) => {
    setMode(item.mode);
    setYear(item.year);
    setStartDate(item.startDate);
    setEndDate(item.endDate || "");
    setTargetDays(item.targetDays || "");
    setShowHistory(false);
    showToastNotification("Riwayat dipulihkan");
  }, [showToastNotification]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    showToastNotification("Riwayat dihapus");
  }, [showToastNotification]);

  // Calculate with loading state
  useEffect(() => {
    if (!startDate) {
      setResult({});
      setWasSwapped(false);
      return;
    }

    const start = parseDate(startDate);
    if (!start) {
      setResult({ error: `Format tanggal "${startDate}" tidak valid. Gunakan format YYYY-MM-DD (contoh: 2026-01-15)` });
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
          setResult({ error: `Format tanggal "${endDate}" tidak valid. Gunakan format YYYY-MM-DD (contoh: 2026-01-31)` });
          setIsCalculating(false);
          return;
        }

        const swapped = start > end;
        setWasSwapped(swapped);
        const [finalStart, finalEnd] = swapped ? [end, start] : [start, end];

        const workingDays = calculateWorkingDays(finalStart, finalEnd, year, excludedHolidayIds);
        const breakdown = getBreakdown(finalStart, finalEnd, year, excludedHolidayIds);

        setResult({ workingDays, breakdown });
        saveToHistory({ workingDays, breakdown });
      } else {
        const days = parseInt(targetDays);
        if (!targetDays || isNaN(days) || days < 0) {
          setResult({});
          setWasSwapped(false);
          setIsCalculating(false);
          return;
        }

        const { endDate: calcEndDate, breakdown } = calculateEndDate(start, days, year, excludedHolidayIds);

        setResult({ endDate: calcEndDate, breakdown });
        saveToHistory({ endDate: calcEndDate.toISOString(), breakdown });
      }
      setIsCalculating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [mode, startDate, endDate, targetDays, year, excludedHolidayIds, saveToHistory]);

  const hasResult = result.breakdown !== undefined;
  const hasError = result.error !== undefined;
  const hasInput = startDate || endDate || targetDays;
  const hasInvalidDates = Boolean(
    (startDate && !parseDate(startDate)) || (endDate && !parseDate(endDate))
  );

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

  const handleClearInvalid = useCallback(() => {
    if (startDate && !parseDate(startDate)) setStartDate("");
    if (endDate && !parseDate(endDate)) setEndDate("");
    if (targetDays && (isNaN(parseInt(targetDays)) || parseInt(targetDays) < 0)) setTargetDays("");
    setResult({});
    setWasSwapped(false);
    showToastNotification("Input yang tidak valid telah dihapus");
    startDateInputRef.current?.focus();
  }, [startDate, endDate, targetDays, showToastNotification]);

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
      if (result.breakdown?.excludedHolidays) {
        text += `\nDikecualikan: ${result.breakdown.excludedHolidays} hari`;
      }
    } else if (result.endDate) {
      text = `Tanggal Selesai: ${formatDateDisplay(result.endDate)}\n`;
      text += `Setelah ${result.breakdown?.workingDays} hari kerja\n`;
      text += `Weekend: ${result.breakdown?.weekendDays} hari\n`;
      text += `Hari Libur: ${result.breakdown?.holidays} hari`;
      if (result.breakdown?.excludedHolidays) {
        text += `\nDikecualikan: ${result.breakdown.excludedHolidays} hari`;
      }
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToastNotification("Hasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [hasResult, mode, result, showToastNotification]);

  const handleToggleHoliday = useCallback((holidayId: string) => {
    setExcludedHolidayIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(holidayId)) {
        newSet.delete(holidayId);
      } else {
        newSet.add(holidayId);
      }
      return newSet;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ignore if modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "r":
          e.preventDefault();
          handleReset();
          break;
        case "m":
          e.preventDefault();
          handleThisMonth();
          break;
        case "c":
          e.preventDefault();
          handleCopyResult();
          break;
        case "h":
          e.preventDefault();
          setShowHolidays((prev) => !prev);
          break;
        case "d":
          e.preventDefault();
          toggleDarkMode();
          break;
        case "escape":
          e.preventDefault();
          if (showResetConfirm) {
            setShowResetConfirm(false);
          } else if (showMobileSheet) {
            setShowMobileSheet(false);
          } else if (showYearSelector) {
            setShowYearSelector(false);
          } else if (showExcludeHolidays) {
            setShowExcludeHolidays(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasResult, handleReset, handleThisMonth, handleCopyResult, showResetConfirm, showMobileSheet, showYearSelector, showExcludeHolidays]);

  // Deadline countdown (for reverse mode)
  const deadlineCountdown = useCallback(() => {
    if (mode !== "reverse" || !result.endDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(result.endDate);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate.getTime() === today.getTime()) {
      return { text: "Deadline hari ini!", isPast: false, days: 0 };
    }

    const isPast = targetDate < today;
    const workingDaysLeft = calculateWorkingDays(
      isPast ? targetDate : today,
      isPast ? today : targetDate,
      year,
      excludedHolidayIds
    );

    return {
      text: isPast
        ? `Deadline terlewati ${workingDaysLeft} hari kerja`
        : `${workingDaysLeft} hari kerja lagi sampai deadline`,
      isPast,
      days: workingDaysLeft
    };
  }, [mode, result.endDate, year, excludedHolidayIds]);

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

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-4 py-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      <div id="main-content" className="w-full max-w-2xl mx-auto space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 border border-gray-100 dark:border-gray-700 transition-shadow hover:shadow-2xl">
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 py-2 space-y-4">
            {/* Year Selector, Dark Mode & Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowYearSelector(!showYearSelector)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 transition-all duration-200 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Tahun {year}</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showYearSelector ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                  title="Toggle dark mode (D)"
                >
                  {darkMode ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>

                {/* History Toggle */}
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="relative flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                  title="Riwayat perhitungan"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Riwayat</span>
                  {history.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {history.length}
                    </span>
                  )}
                </button>
              </div>

              <ModeToggle mode={mode} onModeChange={setMode} />
            </div>

            {/* Year Dropdown */}
            {showYearSelector && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-wrap gap-2">
                  {availableYears.map((y) => (
                    <button
                      key={y}
                      onClick={() => {
                        setYear(y);
                        setShowYearSelector(false);
                        setResult({});
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        year === y
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* History Dropdown */}
            {showHistory && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Riwayat Perhitungan</h3>
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                      >
                        Hapus Semua
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Belum ada riwayat perhitungan
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => restoreFromHistory(item)}
                          className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                  {item.mode === "forward" ? "Hitung Hari" : "Hitung Tanggal"}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(item.timestamp).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                                {item.mode === "forward"
                                  ? `${item.result.workingDays} hari kerja`
                                  : formatDateDisplay(new Date(item.result.endDate!))}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {item.startDate} {item.mode === "forward" ? `→ ${item.endDate}` : `+ ${item.targetDays} hari`}
                              </p>
                            </div>
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Exclude Holidays Toggle */}
            <button
              onClick={() => setShowExcludeHolidays(!showExcludeHolidays)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>
                {excludedHolidayIds.size > 0
                  ? `${excludedHolidayIds.size} libur dikecualikan`
                  : "Pilih libur yang dikecualikan"}
              </span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${showExcludeHolidays ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Exclude Holidays Panel */}
            {showExcludeHolidays && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto space-y-2">
                  {availableHolidays.map((holiday) => (
                    <label
                      key={holiday.id}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={excludedHolidayIds.has(holiday.id)}
                        onChange={() => handleToggleHoliday(holiday.id)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{holiday.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{holiday.date}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:gap-6">
            <DateInput
              ref={startDateInputRef}
              label="Tanggal Mulai"
              value={startDate}
              onChange={setStartDate}
              placeholder="YYYY-MM-DD"
              invalid={!startDate ? false : !parseDate(startDate)}
              onClear={() => setStartDate("")}
            />

            {mode === "forward" ? (
              <DateInput
                ref={endDateInputRef}
                label="Tanggal Selesai"
                value={endDate}
                onChange={setEndDate}
                placeholder="YYYY-MM-DD"
                invalid={!endDate ? false : !parseDate(endDate)}
                onClear={() => setEndDate("")}
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
            onClearInvalid={handleClearInvalid}
            hasInvalidDates={hasInvalidDates}
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

                {/* Deadline Countdown */}
                {mode === "reverse" && deadlineCountdown() && (
                  <div className={`p-4 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                    deadlineCountdown()!.isPast
                      ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      : deadlineCountdown()!.days === 0
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  }`}>
                    <svg className={`w-5 h-5 flex-shrink-0 ${
                      deadlineCountdown()!.isPast
                        ? "text-red-600 dark:text-red-400"
                        : deadlineCountdown()!.days === 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-blue-600 dark:text-blue-400"
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className={`font-semibold ${
                        deadlineCountdown()!.isPast
                          ? "text-red-700 dark:text-red-400"
                          : deadlineCountdown()!.days === 0
                            ? "text-green-700 dark:text-green-400"
                            : "text-blue-700 dark:text-blue-400"
                      }`}>
                        {deadlineCountdown()!.text}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {deadlineCountdown()!.isPast
                          ? "Segera update timeline proyek Anda"
                          : deadlineCountdown()!.days === 0
                            ? "Kerjakan tugas hari ini dengan baik!"
                            : `Sisa waktu: ${Math.ceil(deadlineCountdown()!.days / 5)} minggu kerja`}
                      </p>
                    </div>
                  </div>
                )}
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

        <HolidayListToggle isOpen={showHolidays} onToggle={() => setShowHolidays(!showHolidays)} holidays={availableHolidays} year={year} />

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Data Libur Nasional Indonesia Tahun {year}
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

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed top-20 right-4 z-40 hidden print:hidden group">
        <button className="p-2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg opacity-50 hover:opacity-100 transition-opacity duration-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7m0 0 0 1.707 0h5.293m-5.293 0H21M7 10a2 2 0 11-4 0 2 2 0 014 0zm0 0a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
        <div className="absolute right-0 top-full mt-2 w-48 p-3 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
          <p className="text-xs font-semibold mb-2 text-gray-400">Keyboard Shortcuts</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">R</span>
              <span>Reset</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">M</span>
              <span>Bulan Ini</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">C</span>
              <span>Copy</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">H</span>
              <span>Holidays</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">D</span>
              <span>Dark Mode</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-400">Esc</span>
              <span>Close</span>
            </div>
          </div>
        </div>
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
  onClearInvalid,
  hasInvalidDates,
}: {
  onReset: () => void;
  onThisMonth: () => void;
  onToday: () => void;
  onThisWeek: () => void;
  onThisQuarter: () => void;
  onThisYear: () => void;
  onClearInvalid: () => void;
  hasInvalidDates: boolean;
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
        {hasInvalidDates && (
          <button
            onClick={onClearInvalid}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors duration-200 min-h-[40px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a2 2 0 012-2h2a2 2 0 012 2v2m0 0V2a2 2 0 012-2h2a2 2 0 012 2v2" />
            </svg>
            Clear Invalid
          </button>
        )}
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
  onClear?: () => void;
}

function DateInput({ ref, label, value, onChange, placeholder, invalid, onClear }: DateInputProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {value && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="relative group">
        <input
          ref={ref}
          id={inputId}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 py-3 min-h-[48px] border rounded-lg focus:ring-4 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200 cursor-pointer ${
            invalid
              ? "border-red-300 dark:border-red-600 focus:ring-red-500/20 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500/20 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
          aria-invalid={invalid ? "true" : "false"}
        />
        {/* Tooltip */}
        <div
          className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
            isFocused ? "opacity-0" : ""
          }`}
        >
          {value ? `Pilih tanggal untuk ${label}` : "Klik untuk memilih tanggal"}
        </div>
      </div>
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
                {breakdown.excludedHolidays > 0 && ` (${breakdown.excludedHolidays} libur dikecualikan)`}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-blue-100 text-sm mb-1 font-medium">Tanggal Selesai</p>
              <p className="text-2xl sm:text-3xl font-bold">{endDate && formatDateDisplay(endDate)}</p>
              <p className="text-blue-100 text-sm mt-2">
                Setelah {breakdown.workingDays} hari kerja
                {breakdown.excludedHolidays > 0 && ` (${breakdown.excludedHolidays} libur dikecualikan)`}
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

        {/* Tooltip enhancement */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            {mode === "forward"
              ? `Weekend: ${breakdown.weekendDays} • Libur: ${breakdown.holidays}`
              : `Total: ${breakdown.totalDays} hari • Kerja: ${breakdown.workingDays}`}
          </div>
        </div>
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
        <div className="group relative p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-green-500 group-hover:scale-125 transition-transform duration-200" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Hari Kerja</p>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400 tabular-nums">{breakdown.workingDays}</p>

          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            Hari kerja efektif (Senin-Jumat, dikurangi libur nasional)
          </div>
        </div>

        <div className="group relative p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-orange-500 group-hover:scale-125 transition-transform duration-200" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Weekend</p>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-semibold text-orange-600 dark:text-orange-400 tabular-nums">{breakdown.weekendDays}</p>

          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            Sabtu & Minggu dikecualikan dari perhitungan
          </div>
        </div>

        {breakdown.excludedHolidays > 0 && (
          <div className="group relative p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-md col-span-1 sm:col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-cyan-500 group-hover:scale-125 transition-transform duration-200" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Dikecualikan</p>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl font-semibold text-cyan-600 dark:text-cyan-400 tabular-nums">{breakdown.excludedHolidays}</p>

            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Hari libur yang Anda pilih untuk tidak dikecualikan
            </div>
          </div>
        )}

        <div className="group relative p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:border-red-300 dark:hover:border-red-600 hover:shadow-md col-span-1 sm:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 group-hover:scale-125 transition-transform duration-200" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Hari Libur Nasional</p>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-3 tabular-nums">{breakdown.holidays}</p>

          {breakdown.holidayDetails.length > 0 && (
            <div className="space-y-2">
              {breakdown.holidayDetails.map((holiday) => (
                <div
                  key={holiday.id}
                  className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <span className="font-mono font-medium text-gray-900 dark:text-gray-200">{holiday.date}</span>
                  <span className="text-gray-400">—</span>
                  <span className="flex-1">{holiday.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white dark:text-gray-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            Hari libur nasional Indonesia termasuk cuti bersama
          </div>
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

function HolidayListToggle({
  isOpen,
  onToggle,
  holidays,
  year,
}: {
  isOpen: boolean;
  onToggle: () => void;
  holidays: Array<{ id: string; date: string; name: string; isCutiBersama?: boolean }>;
  year: number;
}) {
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
          <span className="font-medium text-gray-900 dark:text-white">Daftar Hari Libur {year}</span>
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
                key={holiday.id}
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
