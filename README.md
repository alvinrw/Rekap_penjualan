# Sistem Pendataan Ayam Berbasis Kloter

Aplikasi web untuk mencatat dan menganalisis seluruh siklus peternakan ayam per **kloter (batch)**: mulai dari pembelian DOC, pengeluaran harian (pakan, obat, dll), kematian, panen, sampai penjualan. Sistem menghitung otomatis stok ayam hidup, FCR, mortality rate, net profit, dan margin/ROI per kloter.

> Dokumen kebutuhan lengkap ada di PRD (`PRD — Sistem Pendataan Ayam Berbasis Kloter`). README ini adalah ringkasan untuk developer.

## Fitur Utama

- **Manajemen Kloter**: nama, tanggal mulai, jumlah DOC, harga beli DOC, status (Aktif / Panen / Selesai).
- **Pengeluaran**: pakan (dengan jumlah Kg), obat-obatan, listrik & air, tenaga kerja, pemeliharaan kandang, lainnya.
- **Kematian Ayam**: otomatis mengurangi sisa ayam hidup.
- **Panen**: mendukung panen bertahap per kloter.
- **Penjualan**: input berat timbangan (gram), total harga dihitung otomatis dari harga per ons.
- **Pengaturan Harga**: harga per ons (awal **Rp 7.500**) bisa diubah lewat menu terpisah tanpa mengubah penjualan lama.
- **Analisis per kloter**: FCR, Mortality Rate, Net Profit, Margin/ROI.
- **3 role**: Viewer, Admin, Super Admin.

## Role & Hak Akses

| Fitur | Viewer | Admin | Super Admin |
|---|:-:|:-:|:-:|
| Lihat dashboard, kloter, laporan, harga aktif | ✅ | ✅ | ✅ |
| Input kloter, pengeluaran, kematian, panen, penjualan | ❌ | ✅ | ✅ |
| Ubah harga per ons | ❌ | ✅ | ✅ |
| Edit data kloter yang sudah Selesai | ❌ | ❌ | ✅ |
| Hapus (soft delete) & restore data | ❌ | ❌ | ✅ |
| Kelola user & role | ❌ | ❌ | ✅ |
| Audit log & pengaturan | ❌ | ❌ | ✅ |

## Alur Sistem

```
Buat Kloter (beli DOC)
      ↓
Pemeliharaan: catat Pengeluaran harian + catat Kematian
      ↓
Panen (bisa bertahap)
      ↓
Input Penjualan (berat timbangan × harga per ons)
      ↓
Tutup Kloter → hitung FCR, Mortality, Net Profit, ROI
```

## Rumus

| Metrik | Rumus |
|---|---|
| Sisa ayam hidup | DOC awal − total kematian − total ekor dipanen |
| FCR | Total pakan (Kg) ÷ Total bobot hidup panen (Kg) |
| Mortality Rate (%) | Total kematian ÷ DOC awal × 100 |
| Total harga penjualan | (Berat timbangan gram ÷ 100) × Harga per ons |
| Total modal | Harga beli DOC + Σ semua pengeluaran |
| Net Profit | Total pemasukan − Total modal |
| Margin / ROI (%) | Net Profit ÷ Total modal × 100 |

Contoh: timbangan 2.500 gram = 25 ons × Rp 7.500 = **Rp 187.500**. (1 ons = 100 gram)

## Model Data

| Tabel / Model | Keterangan |
|---|---|
| `users` | Akun dengan role `viewer` / `admin` / `super_admin` |
| `kloters` (`Kloter`) | Data batch: DOC, harga DOC, tanggal mulai, status |
| `pengeluarans` (`Pengeluaran`) | Biaya operasional per kloter, `jumlah_kg` untuk pakan |
| `kematian_ayams` (`KematianAyam`) | Kematian harian per kloter |
| `panens` (`Panen`) | Panen: jumlah ekor & total bobot (Kg) |
| `data_penjualans` (`DataPenjualan`) | Penjualan: berat gram, snapshot harga per ons, total uang |
| `pengaturan_hargas` | Riwayat harga per ons (`harga_per_ons`, `berlaku_mulai`) |
| `kloter_summaries` (`KloterSummary`) | Hasil hitung otomatis: sisa ayam, FCR, mortality, profit, ROI |
| `audit_logs` | Riwayat perubahan data |

Relasi: `kloters` 1—N `pengeluarans`, `kematian_ayams`, `panens`, `data_penjualans`; `kloters` 1—1 `kloter_summaries`.

## Aturan Penting

- Sisa ayam hidup tidak boleh negatif (kematian & panen divalidasi terhadap sisa ayam).
- Tanggal kematian/panen/penjualan tidak boleh sebelum tanggal mulai kloter.
- Setiap penjualan menyimpan **snapshot harga per ons** saat transaksi, jadi mengubah harga tidak mengubah penjualan lama.
- Hasil FCR/profit saat kloter belum selesai bersifat estimasi, final saat kloter ditutup.
- Otorisasi dicek di server, bukan hanya menyembunyikan menu.

## Tech Stack

Mengikuti struktur proyek yang ada (model seperti `Kloter.php`, `KematianAyam`, `Pengeluaran`, `Panen`, `DataPenjualan`, `KloterSummary`), yang mengarah ke **Laravel (PHP)**. Sesuaikan bagian ini dan bagian instalasi di bawah kalau stack aslinya berbeda.

## Instalasi

```bash
# 1. Clone & masuk ke folder proyek
git clone <url-repo>
cd <nama-folder>

# 2. Install dependency
composer install
npm install

# 3. Salin env & generate key
cp .env.example .env
php artisan key:generate

# 4. Atur koneksi database di .env, lalu migrasi + seed
php artisan migrate --seed

# 5. Jalankan
npm run dev
php artisan serve
```

Seeder default sebaiknya membuat:
- 1 akun Super Admin awal (ganti password setelah login pertama).
- Harga per ons awal: **7500**.

## Konfigurasi `.env` (contoh)

```env
APP_NAME="Pendataan Ayam"
APP_ENV=local
APP_URL=http://localhost:8000
APP_LOCALE=id
APP_TIMEZONE=Asia/Jakarta

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pendataan_ayam
DB_USERNAME=root
DB_PASSWORD=
```

## Halaman

| Halaman | Viewer | Admin | Super Admin |
|---|:-:|:-:|:-:|
| Login | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ |
| Daftar & Detail Kloter | ✅ (read-only) | ✅ | ✅ |
| Form Input (kloter, pengeluaran, kematian, panen, penjualan) | ❌ | ✅ | ✅ |
| Pengaturan Harga | ✅ (read-only) | ✅ | ✅ |
| Laporan & Perbandingan Kloter | ✅ | ✅ | ✅ |
| Manajemen User | ❌ | ❌ | ✅ |
| Audit Log & Pengaturan | ❌ | ❌ | ✅ |

## Roadmap

- **MVP (P0)**: auth + 3 role, CRUD kloter, pengeluaran, kematian, panen, penjualan, menu Pengaturan Harga, kalkulasi FCR/mortality/profit/ROI, dashboard dasar.
- **Rilis 2 (P1)**: grafik & perbandingan kloter, export PDF/Excel, audit log, soft delete/restore, buka kembali kloter, riwayat perubahan harga, override total penjualan.
- **Rilis 3 (P2)**: piutang, upload bukti nota, alert mortalitas, ringkasan bulanan/tahunan, harga per ons berbeda per tipe penjualan.

## Pertanyaan yang Masih Terbuka

Daftar lengkap ada di bagian 13 PRD. Beberapa yang paling berpengaruh ke implementasi:
- Apakah Viewer boleh melihat angka keuangan (profit, modal)?
- Apakah harga per ons sama untuk penjualan umum dan toko?
- Apakah total harga boleh dioverride manual?
- Apakah satu kandang bisa menjalankan lebih dari satu kloter aktif sekaligus?

## Lisensi

Tentukan lisensi proyek (mis. MIT atau proprietary) sebelum rilis.
