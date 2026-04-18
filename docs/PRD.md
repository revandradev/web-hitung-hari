# Product Requirements Document (PRD): Working Days Calculator

| Metadata | Detail |
| :--- | :--- |
| **Project Name** | Indonesia Working Days Calculator |
| **Target Region** | Indonesia (WIB/GMT+7) |
| **Status** | MVP Draft |
| **Last Updated** | 2026-04-16 |

---

## 1. Objective
Menyediakan alat internal yang akurat untuk menghitung hari kerja di Indonesia guna membantu Project Manager dalam:
* **Perencanaan Timeline:** Menyusun jadwal proyek yang realistis.
* **Estimasi Deadline:** Menentukan target penyelesaian tugas dengan presisi.
* **Simulasi Durasi:** Membandingkan durasi kerja dengan/tanpa variabel libur nasional.

## 2. Target User
* **User:** Project Manager, Product Manager, Operations Planner.
* **Karakteristik:** Membutuhkan alat yang cepat, akurat (termasuk cuti bersama), dan bebas dari kompleksitas fitur HR/Payroll.

## 3. Core Use Cases
* **UC1 - Hitung Hari Kerja:** Input `Start Date` + `End Date` ➔ Output: Total hari kerja aktif.
* **UC2 - Hitung Tanggal Selesai (Reverse):** Input `Start Date` + `Jumlah Hari` ➔ Output: Tanggal selesai (deadline).
* **UC3 - Simulasi:** Membandingkan hasil perhitungan dengan/tanpa menyertakan hari libur tertentu.

## 4. Functional Requirements

### A. Input Data
* **Start Date:** Tanggal mulai proyek.
* **End Date:** Tanggal berakhir (khusus mode Forward).
* **Target Days:** Jumlah hari kerja yang diinginkan (khusus mode Reverse).
* **Mode Switch:** Toggle antara *Date-to-Days* atau *Days-to-Date*.

### B. Aturan Perhitungan (Working Days Rules)
1.  **Weekend:** Sabtu dan Minggu otomatis tidak dihitung.
2.  **Public Holidays:** Mengecualikan Hari Libur Nasional Indonesia.
3.  **Cuti Bersama:** Mengecualikan hari cuti bersama sesuai ketetapan pemerintah.
4.  **Work Week:** Senin s/d Jumat (5 hari kerja).

### C. Holiday System (MVP)
Menggunakan dataset hardcoded JSON untuk performa maksimal pada fase awal.
* **Sumber:** Kalender Resmi Pemerintah Indonesia.
* **Struktur Data:**
    ```json
    [
      { "date": "2026-01-01", "name": "Tahun Baru Masehi" },
      { "date": "2026-03-22", "name": "Hari Raya Nyepi" }
    ]
    ```

### D. Output & Transparansi
Sistem harus menampilkan breakdown detail:
* **Contoh Forward:** "Total: 18 hari kerja (6 hari weekend & 2 hari libur diabaikan)."
* **Contoh Reverse:** "Target selesai: 12 Maret 2026 (Melompati 4 weekend & 1 hari libur)."

## 5. Non-Functional Requirements
* **Accuracy:** Tidak boleh ada *double-counting* jika hari libur jatuh pada hari Sabtu/Minggu.
* **Timezone:** Default Asia/Jakarta (WIB).
* **Performance:** Kalkulasi < 50ms untuk rentang waktu hingga 5 tahun.
* **Deterministic:** Input yang sama harus selalu menghasilkan output yang sama.

## 6. Edge Cases
* **Start > End:** Sistem otomatis melakukan swap tanggal atau menampilkan pesan error validasi.
* **Start = End:** Dihitung 1 hari jika jatuh pada hari kerja, atau 0 jika weekend/libur.
* **Leap Year:** Penanganan otomatis untuk tanggal 29 Februari.
* **Input Kosong:** Menampilkan state default atau instruksi pengisian.

## 7. UX & UI Requirements
* **Interaction:** *Real-time calculation* (perhitungan berjalan otomatis tanpa tombol submit).
* **Visuals:** Pemisahan visual yang jelas antara hasil utama (angka/tanggal) dan breakdown (keterangan).
* **Feedback:** Pesan error yang informatif jika format tanggal tidak valid.

## 8. Technical Stack (MVP)
* **Framework:** Next.js / React.
* **Library:** `date-fns` atau `dayjs`.
* **Deployment:** Vercel atau internal server.

## 9. Algoritma Inti (Pseudo-code)
```typescript
function calculate(start, end, holidays) {
  let count = 0;
  let current = start;
  while (current <= end) {
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;
    const isHoliday = holidays.includes(current.format('YYYY-MM-DD'));
    
    if (!isWeekend && !isHoliday) {
      count++;
    }
    current.add(1, 'day');
  }
  return count;
}
