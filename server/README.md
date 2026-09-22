# Backend Pendataan & Penjualan Ayam Broiler (PostgreSQL + Express + Prisma)

Backend API untuk aplikasi manajemen dan pendataan ayam broiler berbasis kloter dengan database PostgreSQL.

## Fitur Utama
1. **PostgreSQL & Prisma ORM**: Skema lengkap untuk Kloter, Pengeluaran, Kematian, Panen, Penjualan, User, Harga, Audit Logs, dan Jadwal Export.
2. **Super Admin Default**: User `alvin_admin` (Alvin Rifky).
3. **Cetak Struk Penjualan PDF**: Endpoint `GET /api/penjualan/:id/struk-pdf` menghasilkan struk thermal PDF sesuai template contoh nota penjualan.
4. **REST API Lengkap**: Terhubung langsung ke frontend React.

## Cara Menjalankan

### 1. Jalankan PostgreSQL
Jika menggunakan Docker:
```bash
docker compose up -d
```
Atau pastikan PostgreSQL lokal Anda aktif di port `5432` dengan database `pendataan_ayam`.

### 2. Push Skema ke PostgreSQL
```bash
npx prisma db push
```

### 3. Seed Akun Super Admin Alvin Rifky
```bash
npm run prisma:seed
```

### 4. Jalankan Server API Backend
```bash
npm run dev
```
Server akan berjalan di `http://localhost:5000`.
