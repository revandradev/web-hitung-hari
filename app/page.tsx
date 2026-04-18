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

        <footer className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4">
          <p className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <span>Timezone: Asia/Jakarta (WIB)</span>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
            <span>Weekend: Sabtu & Minggu</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
