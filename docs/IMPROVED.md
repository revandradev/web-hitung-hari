# Design Improvement Suggestions

## Current Status

**Progress:** 42/35 improvements completed (120%)

**Latest Update:** 2026-04-19

**Status:** Production Ready ✅

---

## Current State Analysis

Aplikasi Kalkulator Hari Kerja Indonesia telah melalui beberapa iterasi improvement. Berikut adalah status terkini dan potential improvements yang masih bisa dilakukan.

---

## ✅ Completed Improvements

### 1. Visual Hierarchy & Card Container ✅
- White card dengan shadow-xl dan border
- Rounded corners (rounded-2xl) untuk modern look
- Proper padding dan spacing
- Hover shadow effect (hover:shadow-2xl)

### 2. Empty State ✅
- Placeholder dengan icon kalender yang berdenyut (animate-pulse)
- Instruction text yang jelas
- Muncul saat belum ada input

### 3. Micro-interactions ✅
- Fade-in animation untuk hasil (animate-in fade-in slide-in-from-bottom-4)
- Animated mode toggle dengan sliding indicator
- Smooth transition pada semua interactive elements (duration-200/300)
- Scale animations pada hover (hover:scale-[1.02], hover:scale-125)
- Active scale press effect (active:scale-95)

### 4. Accessibility ✅
- Label htmlFor sekarang match dengan input id
- Focus ring yang visible (ring-4, ring-blue-500/20)
- Touch-friendly min-height (48px untuk input, 44px untuk button)
- Proper ARIA labels

### 5. Informasi Tambahan ✅
- Year badge di header menunjukkan "Tahun 2026"
- Footer dengan info timezone (WIB) dan weekend rule
- Data Libur Nasional Indonesia Tahun 2026

### 6. Mobile Responsive ✅
- Responsive spacing (p-4 sm:p-6 md:p-8)
- Responsive grid (grid-cols-1 sm:grid-cols-2)
- Responsive typography (text-2xl sm:text-3xl)
- Touch-friendly button sizes
- Flexible footer (stack vertical di mobile)

### 7. Color & Typography ✅
- Color meaning yang intentional:
  - 🟢 Green = Working Days (positif)
  - 🟠 Orange = Weekend (warning)
  - 🔴 Red = Holidays (blocked)
- Gradient pada result card (from-blue-500 to-blue-600)
- Font weights untuk hierarchy (bold untuk angka utama)
- Tabular nums untuk better number alignment

### 8. Additional Features ✅
- **Holiday List Toggle** - Collapsible section dengan semua daftar libur
- **Quick Actions** - Reset & Bulan Ini buttons
- **Copy Result** - Copy to clipboard dengan visual feedback
- Icons untuk semua tombol

### 9. High Priority Improvements (10 items) ✅
- **Focus Management** - Setelah quick action, focus kembali ke input pertama
- **Input Validation Real-time** - Show feedback saat user mengetik
- **Quick Date Presets** - "Hari Ini", "Minggu Ini", "Kuartal Ini", "Tahun Ini"
- **Loading States** - Skeleton/shimmer saat kalkulasi
- **Form Auto-save** - localStorage untuk restore setelah refresh
- **Date Swap Indicator** - Notice saat tanggal otomatis di-swap
- **ARIA Live Regions** - Screen reader announcements
- **Skip to Content Link** - Keyboard navigation
- **Mobile Bottom Sheet** - Ergonomic mobile UX
- **Sticky Mode Toggle** - Mode toggle tetap visible saat scroll

### 10. Enhanced Mode Toggle Design ✅
- **Colorful gradient background** - Indigo → Purple → Pink
- **Icons** - Calendar icon untuk setiap mode
- **Responsive text** - Different labels untuk desktop/mobile
- **Precise sliding indicator** - Flex-based positioning

### 11. Low Priority Improvements (10 items) ✅
- **Toast Notification** - Visual feedback saat copy result dengan auto-dismiss
- **Year Selector** - Dropdown untuk pilih tahun 2025, 2026, 2027
- **Exclude Specific Holidays Toggle** - Checkbox untuk exclude/include cuti bersama
- **Result Tooltip Enhancement** - Breakdown singkat saat hover result card
- **Clear Invalid Dates** - Button untuk clear invalid input
- **Confirm Before Reset** - Dialog confirmation sebelum reset
- **Keyboard Shortcuts** - R, M, C, H, D, Esc keys untuk akses cepat
- **Custom Scrollbar** - Modern scrollbar styling dengan dark mode support
- **Better Error Messages** - Specific error dengan format examples
- **Dark Mode Toggle Button** - Explicit toggle dengan localStorage persistence
- **Print-Optimized Styles** - CSS print media query untuk rapi saat print

### 12. Additional Low Priority Improvements (3 items) ✅
- **History / Recent Calculations** - Riwayat perhitungan tersimpan di localStorage, bisa restore
- **Deadline Countdown** - Countdown hari kerja tersisa ke target date (reverse mode)
- **Tooltip Helper (General)** - Info tooltips saat hover breakdown cards

### 13. Calendar View / Date Range Picker ✅
- **Visual Calendar** - Custom calendar view dengan monthly grid
- **Holiday Highlights** - Hari libur ditandai dengan warna merah dan dot indicator
- **Weekend Highlights** - Sabtu & Minggu ditandai dengan warna oranye
- **Date Range Selection** - Support single date dan range selection dengan visual feedback
- **Month Navigation** - Navigate antar bulan dengan prev/next button
- **Legend** - Visual legend untuk warna (terpilih, rentang, weekend, libur)

### 14. PWA Support ✅
- **Web App Manifest** - manifest.json dengan app metadata dan icons
- **Service Worker** - Offline support dengan cache strategy
- **App Icons** - 192x192 dan 512x512 PNG icons
- **Installable** - Bisa diinstall sebagai app di desktop/mobile
- **Apple Touch Icon** - Support untuk iOS devices
- **Theme Color** - Blue theme color (#2563eb) untuk browser UI
- **PWA Meta Tags** - Complete PWA meta tags untuk installability

---

## 🔄 Potential Improvements (Not Yet Implemented)

### 1. Working Days Calendar Heatmap
**Priority: Low**

Tampilkan heatmap calendar yang menunjukkan working days vs holidays dalam satu tahun.

**Visual:**
- Green = working day
- Red = holiday
- Gray = weekend

**Implementation:**
- Year view dengan 365/366 cells
- Color-coded untuk visualisasi cepat
- Tooltip dengan detail per tanggal

### 6. Success Animation
**Priority: Very Low**

Confetti/celebration saat hitung hari kerja tertentu (misal > 100 hari) untuk gamification.

### 7. Share URL
**Priority: Very Low**

Generate shareable URL dengan query params.

**Example:**
```
?mode=forward&start=2026-01-01&end=2026-01-31
```

### 8. Multiple Date Ranges Comparison
**Priority: Very Low**

Bandingkan beberapa range tanggal sekaligus.

**Example:**
- Q1 2026 vs Q2 2026
- Side by side comparison

### 9. Working Hours Calculation
**Priority: Very Low**

Hitung total working hours (bukan hanya hari).

**Formula:**
`workingDays × 8 hours = total workingHours`

### 10. Sound Effects / Haptic Feedback
**Priority: Very Low**

Subtle sound atau haptic feedback saat:
- Calculation completes
- Button pressed
- Error occurs

### 11. Undo/Redo
**Priority: Very Low**

Undo/redo functionality untuk form changes.

### 12. PWA Support
**Priority: Very Low**

Progressive Web App features:
- Install as app
- Offline support
- App icon

### 13. Export to CSV/PDF
**Priority: Very Low**

Export hasil perhitungan ke file untuk dokumentasi atau reporting.

**Options:**
- CSV untuk spreadsheet
- PDF untuk formal documentation
- Image untuk share ke social media

### 12. Multiple Date Ranges Comparison
**Priority: Very Low**

Bandingkan beberapa range tanggal sekaligus.

**Example:**
- Q1 2026 vs Q2 2026
- Side by side comparison

### 13. Working Days Calendar Heatmap
**Priority: Low**

Tampilkan heatmap calendar yang menunjukkan working days vs holidays.

**Visual:**
- Green = working day
- Red = holiday
- Gray = weekend

### 14. Exclude Specific Holidays Toggle
**Priority: Medium**

Checkbox untuk exclude/include specific holidays (misalnya exclude cuti bersama).

**Use Case:**
- Some companies don't observe cuti bersama
- User wants to calculate with/without certain holidays

### 15. Working Hours Calculation
**Priority: Very Low**

Hitung total working hours (bukan hanya hari).

**Formula:**
`workingDays × 8 hours = total workingHours`

### 16. Deadline Countdown
**Priority: Low**

Tampilkan countdown hari kerja tersisa dari hari ini ke target date.

**Example:**
"15 hari kerja lagi sampai deadline"

### 17. Skeleton Loading
**Priority: Very Low**

Add skeleton loading state untuk smoother perceived performance.

### 18. Sound Effects / Haptic Feedback
**Priority: Very Low**

Subtle sound atau haptic feedback saat:
- Calculation completes
- Button pressed
- Error occurs

### 19. Dark Mode Toggle Button
**Priority: Low**

Tambah explicit toggle button untuk dark mode (bukan hanya rely on system preference).

### 20. Print-Optimized Styles
**Priority: Very Low**

CSS print media query untuk hasil perhitungan yang rapi saat di-print.

```css
@media print {
  .no-print { display: none; }
  .print-break { page-break-before: always; }
}
```

### 21. Tooltip Helper
**Priority: Low**

Tooltip dengan info tambahan saat hover:
- "Weekend: Sabtu & Minggu dikecualikan"
- "Cuti Bersama: Hari libur tambahan dari pemerintah"

### 22. Input Validation Real-time
**Priority: Medium**

Show validation feedback saat user mengetik, bukan hanya saat submit.

**Example:**
- Red border jika date > today
- Warning jika date range terlalu jauh (> 1 year)

### 23. Quick Date Presets
**Priority: Medium**

Tombol quick select untuk common ranges:
- "Hari Ini"
- "Minggu Ini"
- "Bulan Ini"
- "Kuartal Ini"
- "Tahun Ini"

### 24. Undo/Redo
**Priority: Very Low**

Undo/redo functionality untuk form changes.

### 25. PWA Support
**Priority: Very Low**

Progressive Web App features:
- Install as app
- Offline support
- App icon

### 26. Loading States
**Priority: High**

Skeleton/shimmer loading state saat kalkulasi berjalan.

**Why:** Meskipun kalkulasi cepat (<50ms), loading state penting untuk:
- Future-proof jika ada API calls
- Better perceived performance
- User confidence bahwa sistem sedang bekerja

**Implementation:**
```tsx
{isCalculating && (
  <div className="animate-pulse space-y-4">
    <div className="h-32 bg-gray-200 rounded-xl" />
    <div className="h-24 bg-gray-200 rounded-xl" />
  </div>
)}
```

### 27. Form Auto-save
**Priority: High**

Simpan input user ke localStorage untuk restore setelah refresh/navigasi.

**Why:** User bisa kehilangan input jika accidentally refresh. Auto-save memberi peace of mind.

**Implementation:**
```tsx
useEffect(() => {
  localStorage.setItem('calculator-state', JSON.stringify({
    mode, startDate, endDate, targetDays
  }));
}, [mode, startDate, endDate, targetDays]);
```

### 28. Date Swap Indicator
**Priority: High**

Tampilkan visual notice saat tanggal otomatis di-swap (ketika start > end).

**Why:** User mungkin tidak sadar tanggal di-swap, bisa menyebabkan kebingungan.

**Implementation:**
```tsx
{wasSwapped && (
  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm flex items-center gap-2">
    <svg>...</svg>
    Tanggal mulai & selesai ditukar agar sesuai urutan
  </div>
)}
```

### 29. ARIA Live Regions
**Priority: High**

Announce hasil perhitungan untuk screen reader users.

**Why:** Accessibility requirement untuk dynamic content updates.

**Implementation:**
```tsx
<div aria-live="polite" aria-atomic="true">
  {hasResult && `Hasil: ${result.workingDays} hari kerja`}
</div>
```

### 30. Skip to Content Link
**Priority: High**

"Skip to main content" link untuk keyboard users.

**Why:** Accessibility best practice, memudahkan navigation tanpa mouse.

**Implementation:**
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 ..."
>
  Skip to content
</a>
```

### 31. Mobile Bottom Sheet
**Priority: High**

Tampilkan hasil perhitungan di bottom sheet pada mobile.

**Why:** Lebih ergonomic untuk mobile users, hasil tetap visible saat scroll.

**Implementation:**
- Fixed position bottom sheet
- Swipe up to expand
- Backdrop blur overlay
- Close button

### 32. Sticky Mode Toggle
**Priority: High**

Mode toggle tetap visible (sticky) saat scroll di mobile.

**Why:** User bisa ganti mode tanpa scroll ke atas lagi.

**Implementation:**
```tsx
<div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm py-2">
  <ModeToggle ... />
</div>
```

### 33. Result Tooltip Enhancement
**Priority: High**

Tooltip dengan breakdown singkat saat hover result card.

**Why:** User bisa melihat quick info tanpa scroll ke breakdown section.

### 34. Clear Invalid Dates
**Priority: High**

Button/quick action untuk clear invalid dates.

**Why:** Memudahkan user memperbaiki error tanpa manual delete.

### 35. Confirm Before Reset
**Priority: High**

Confirmation dialog sebelum reset jika ada input yang terisi.

**Why:** Mencegah accidental data loss.

---

## Priority Order (Updated)

### Completed ✅ (35 items)

**Original High Priority** (5 items)
1. Visual Hierarchy & Card Container ✅
2. Empty State ✅
3. Micro-interactions ✅
4. Mobile Responsive ✅
5. Additional Features ✅

**High Priority Round 2** (10 items)
6. Focus Management ✅
7. Input Validation Real-time ✅
8. Quick Date Presets ✅
9. Loading States ✅
10. Form Auto-save ✅
11. Date Swap Indicator ✅
12. ARIA Live Regions ✅
13. Skip to Content Link ✅
14. Mobile Bottom Sheet ✅
15. Sticky Mode Toggle ✅

**Design Enhancement** (5 items)
16. Enhanced Mode Toggle Design ✅
17. Colorful Gradient Background ✅
18. Mode Toggle Icons ✅
19. Responsive Toggle Labels ✅
20. Precise Sliding Indicator ✅

**Medium Priority Round 3** (5 items)
21. Toast Notification ✅
22. Year Selector ✅
23. Exclude Specific Holidays Toggle ✅
24. Result Tooltip Enhancement ✅
25. Clear Invalid Dates ✅
26. Confirm Before Reset ✅

**Low Priority Round 4** (5 items)
27. Keyboard Shortcuts ✅
28. Custom Scrollbar ✅
29. Better Error Messages ✅
30. Dark Mode Toggle Button ✅
31. Print-Optimized Styles ✅

**Low Priority Round 5** (3 items)
32. History / Recent Calculations ✅
33. Deadline Countdown ✅
34. Tooltip Helper (general) ✅

**Medium Priority Round 4** (1 item)
35. Calendar View / Date Range Picker ✅

**Very Low Priority** (1 item)
36. PWA Support ✅

**Additional Enhancements** (6 items)
37. Smart History Saving ✅
- History hanya disimpan ketika calculation inputs berubah (mode, tanggal, target days)
- Settings changes (year, excluded holidays, working days) tidak menambah history
- Mencegah history clutter dari pengaturan yang berubah-ubah

38. Collapsible Info Banner ✅
- Banner info "Hari Kerja = Senin - Jumat" bisa di-hide dengan tombol close
- Link "Tampilkan info perhitungan" untuk show lagi
- Preferensi disimpan di localStorage
- Mengurangi visual noise untuk user yang sudah paham

39. Collapsible Footer Info ✅
- Footer info weekend & libur bisa di-hide
- Link "Tampilkan info perhitungan" untuk show lagi
- Preferensi tersimpan terpisah dari banner
- Tampilan lebih minimalis

40. Footer Credit ✅
- "Revandev • Dibuat dengan ❤ di Sleman" di footer paling bawah
- Rata tengah, subtle design
- Icon hati (heart) berwarna merah

41. Custom Working Days ✅
- Pilih hari mana saja yang dikecualikan (bukan hanya Sabtu Minggu)
- UI grid 7 hari dengan color coding (hijau = on, merah = off)
- Default: Sabtu (6) & Minggu (0) dikecualikan
- Bisa pilih semua hari on (7 hari kerja) atau custom combination
- Tombol "Reset ke Default" untuk kembali ke Sabtu-Minggu
- Persistensi di localStorage
- Breakdown menampilkan "Hari Custom Off" terpisah dari weekend
- Support untuk perusahaan dengan jadwal kerja unik (4 hari, 6 hari, dll)

42. Calculation Insight/Analysis ✅
- Saran dan analisa berdasarkan hasil perhitungan
- Efisiensi kerja (persentase hari kerja vs total hari)
- Peringatan jika banyak libur dalam periode
- Estimasi kapasitas (1 minggu, 2 minggu, 1 bulan kerja)
- Tips perencanaan project
- Info hari libur dalam periode
- Warna berbeda per tipe: Success (hijau), Warning (kuning), Info (biru), Tip (ungu)
- Maksimal 2 card agar tidak terlalu ramai

43. Quick Summary Component ✅ (Hidden by default)
- Ringkasan visual: Weekend, Custom Off, Libur Nasional, Dikecualikan
- Grid layout dengan icon dan warna
- Bisa di-hide untuk tampilan lebih minimalis
- Informasi tetap tersedia di Rincian Perhitungan

44. Deadline Countdown Reposition ✅
- Dipindahkan ke posisi strategis: langsung di bawah hasil utama
- Sebelum insight dan breakdown
- Icon lebih besar (w-6 h-6)
- Font lebih bold dan prominent
- Rounded-xl dengan shadow
- Sangat membantu PM melihat estimasi hari dengan cepat

### Not Yet Implemented 🔄 (0 items)

**All planned improvements have been completed! 🎉**

**Optional Future Enhancements** (Not originally scoped):
- Working Days Calendar Heatmap (Year view)
- Success Animation (Confetti)
- Share URL with query params
- Multiple Date Ranges Comparison
- Working Hours Calculation
- Export to CSV/PDF
- Sound Effects / Haptic Feedback
- Undo/Redo

**Progress: 42/35 improvements completed (120%)**

---

**Very Low Priority** (5 items)
2. Success Animation
3. Share URL
4. Multiple Date Ranges Comparison
5. Working Hours Calculation
6. Export to CSV/PDF
7. Sound Effects / Haptic Feedback
8. Undo/Redo
9. PWA Support

**Progress: 34/35 improvements completed (97%)**

---

## Design System Summary

### Colors
- **Primary:** Blue (blue-500 to blue-600)
- **Forward Mode:** Indigo (indigo-600/400)
- **Reverse Mode:** Pink (pink-600/400)
- **Success:** Green (green-500/600)
- **Warning:** Orange (orange-500/600)
- **Error:** Red (red-500/600, red-900/20 for dark bg)
- **Info:** Blue (blue-600/400, blue-900/20 for dark bg)
- **Insight Success:** Green (green-600/400, green-900/20 for dark bg)
- **Insight Warning:** Amber (amber-700/400, amber-900/20 for dark bg)
- **Insight Tip:** Purple (purple-600/400, purple-900/20 for dark bg)
- **Custom Off:** Purple (purple-600/400, purple-900/20 for dark bg)
- **Excluded:** Cyan (cyan-600/400, cyan-900/20 for dark bg)
- **Swap Notice:** Amber (amber-700/400, amber-900/20 for dark bg)
- **Background:** Gray scale (gray-50 to gray-900)
- **Border:** gray-100 to gray-700
- **Text:** gray-900/600/500/400

### Typography
- **Heading:** font-bold, tracking-tight
- **Body:** font-normal
- **Numbers:** tabular-nums for alignment
- **Sizes:**
  - Title: text-2xl sm:text-3xl md:text-4xl lg:text-5xl
  - Label: text-sm
  - Body: text-base sm:text-lg
  - Small: text-xs sm:text-sm

### Spacing
- **Card padding:** p-4 sm:p-6 md:p-8
- **Gap:** gap-3 sm:gap-4 md:gap-6
- **Space Y:** space-y-4 sm:space-y-6 sm:space-y-8
- **Min touch target:** 44-48px

### Border Radius
- **Card:** rounded-2xl (16px)
- **Input/Button:** rounded-lg (8px)
- **Badge:** rounded-full
- **Toggle indicator:** rounded-md (6px)

### Shadows
- **Card:** shadow-xl
- **Card hover:** shadow-2xl
- **Button:** shadow-sm
- **Toggle indicator:** shadow-sm

### Transitions
- **Fast:** duration-150 (hover states)
- **Normal:** duration-200 (most transitions)
- **Slow:** duration-300 (layout changes, mode toggle)

### Animations
- **Fade in:** animate-in fade-in
- **Slide up:** slide-in-from-bottom-4
- **Slide down:** slide-in-from-top-2
- **Pulse:** animate-pulse (empty state icon)
- **Scale:** hover:scale-[1.02], hover:scale-125, active:scale-95

### Components

#### Mode Toggle
- Gradient background (indigo → purple → pink)
- Flex-based gap positioning
- Absolute sliding indicator with calc width
- Icons untuk visual clarity
- Responsive labels (desktop vs mobile)
- Ring border untuk definition

#### Quick Actions
- Preset buttons row (Hari Ini, Minggu Ini, Bulan Ini, Kuartal Ini, Tahun Ini)
- Reset button dengan confirmation dialog
- Auto focus kembali ke input setelah klik
- Color-coded (red untuk reset, gray untuk presets)

#### Date Input
- Label block dengan text-sm font-medium
- Input type="date" dengan min-h-[48px]
- Focus ring: ring-4 ring-blue-500/20
- Hover border change

#### Result Card
- Gradient background (from-blue-500 to-blue-600)
- Group hover untuk scale effect
- Relative positioning untuk overlay buttons
- Copy button dengan group-hover:opacity-100

#### Breakdown Cards
- White background di gray container
- Colored indicator dots (3px rounded-full)
- Hover border color change
- Hover shadow effect

#### Holiday List Toggle
- Collapsible dengan animate-in
- Badge count
- Chevron rotation pada open/close
- Max-height scrollable content

#### Loading Skeleton
- Animate-pulse untuk shimmer effect
- Mirrors result card structure
- Shows during 300ms calculation delay

#### Reset Confirmation Dialog
- Fixed position overlay dengan backdrop
- Zoom/fade animation
- Batal & Ya buttons
- Prevents accidental data loss

#### Mobile Bottom Sheet
- Fixed position bottom sheet (sm:hidden)
- Floating action button trigger
- Backdrop blur overlay
- Swipe up to expand
- Close button

#### Date Swap Notice
- Amber warning box
- Icon + text
- Fade-in slide-in animation
- Shows when start > end

#### Custom Working Days Panel
- Grid 7 hari (Min-Sen-Sel-Rab-Kam-Jum-Sab)
- Checkbox per hari dengan color coding
- Hijau = Hari Kerja (On), Merah = Dikecualikan (Off)
- Label "On/Off" untuk clarity
- "Reset ke Default" button
- Info text: "X hari kerja per minggu"
- Persistensi di localStorage
- Animated fade-in/slide-in

#### Calculation Insight Cards
- Dynamic insights berdasarkan breakdown
- 4 types: Success (hijau), Warning (kuning), Info (biru), Tip (ungu)
- Icon + title + message structure
- Max 2 cards ditampilkan
- Animated fade-in dengan delay (staggered)
- Context-aware messages (efisiensi, kapasitas, deadline warning)

#### Deadline Countdown Card
- Prominent display untuk reverse mode
- 3 states: Past (merah), Today (hijau), Future (biru)
- Large icon (w-6 h-6) dengan clock
- Bold text untuk countdown number
- Subtext dengan estimasi minggu kerja
- Rounded-xl dengan shadow-sm
- Positioned right after main result card

#### Quick Summary (Optional)
- Grid layout dengan 2 columns
- Cards: Weekend (orange), Custom Off (purple), Libur (red), Dikecualikan (cyan)
- Icon + label + value + description
- Hidden by default untuk minimalis UI
- Same info available in detailed breakdown

#### Collapsible Info Banner
- Blue background dengan info icon
- Close button (X) di pojok kanan
- "Tampilkan info perhitungan" link saat collapsed
- localStorage persistence
- Animated fade-in/slide-in

#### Footer Credit
- Rata tengah di bagian paling bawah
- Text kecil (text-xs)
- "Revandev • Dibuat dengan ❤ di Sleman"
- Icon hati berwarna merah
- Subtle gray color

---

## References

- [Tailwind CSS Animation](https://tailwindcss.com/docs/animation)
- [WCAG Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Material Design Cards](https://m3.material.io/components/containers/guidelines)
- [Tailwind CSS Typography](https://tailwindcss.com/docs/font-size)
