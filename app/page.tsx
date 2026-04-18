import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6 sm:mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span>Tahun 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight px-2">
            Kalkulator Hari Kerja Indonesia
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-xl mx-auto px-4">
            Hitung hari kerja dengan libur nasional dan cuti bersama
          </p>
        </header>

        <Calculator />

        <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4 space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 py-2 px-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg max-w-md mx-auto">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
              <span>Weekend tidak dihitung</span>
            </span>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <span>Libur nasional tidak dihitung</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Keyboard shortcuts: <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">R</kbd> Reset · <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">M</kbd> Bulan Ini · <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">C</kbd> Copy · <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">H</kbd> Libur · <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">D</kbd> Dark Mode
          </p>
        </footer>
      </div>
    </div>
  );
}
