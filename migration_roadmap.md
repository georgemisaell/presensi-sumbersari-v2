# 🗺️ Roadmap Lengkap Migrasi PHP ke Next.js

Panduan ini merangkum langkah-langkah komprehensif end-to-end untuk memigrasikan project PHP "Presensi Sumbersari" ke ekosistem modern Next.js.

## 🏁 Fase 1: Langkah Sangat Awal (Persiapan & Inisialisasi)

Langkah ini dilakukan sebelum Anda memindahkan logika atau tampilan apapun dari PHP.

1. **Audit Project Lama (PHP)**
   - Pahami alur kerja project lama (Routing, relasi Database, tipe Role: Admin/Pegawai).
   - Identifikasi fitur krusial (terutama pengambilan titik GPS dan foto kamera).
2. **Install Persyaratan Sistem**
   - Pastikan **Node.js** (versi LTS terbaru) sudah terinstall di komputer Anda.
3. **Inisialisasi Project Next.js**
   - Buka terminal Anda, lalu buat project baru dengan command: 
     ```bash
     npx create-next-app@latest presensi-nextjs
     ```
   - *Rekomendasi konfigurasi:* Gunakan TypeScript, Tailwind CSS, direktori `src/`, dan **App Router** (arsitektur terbaru).
4. **Pembersihan & Setup Struktur**
   - Bersihkan kode *boilerplate* bawaan Next.js.
   - Siapkan folder untuk menampung UI (`src/components`), utilitas (`src/lib`), dan asset statis (`public`).

---

## ⚙️ Fase 2: Koneksi & Skema Database

Karena Anda menggunakan MySQL, kita perlu menghubungkan Next.js ke database Anda yang sudah ada saat ini.

1. **Pilih dan Install ORM (Object-Relational Mapper)**
   - Sangat disarankan menggunakan **Prisma ORM** agar lebih mudah.
   - Install via terminal: `npm install @prisma/client` dan `npx prisma init`.
2. **Hubungkan ke Database Lama**
   - Next.js menggunakan file `.env` (bukan `config.php`). Masukkan *connection string* MySQL Anda:
     ```env
     DATABASE_URL="mysql://root:@localhost:3306/nama_database_presensi"
     ```
3. **Generate Skema (Introspection)**
   - Anda tidak perlu membuat ulang tabel. Tarik struktur tabel MySQL lama ke Prisma:
     ```bash
     npx prisma db pull
     npx prisma generate
     ```

---

## 🔐 Fase 3: Fondasi Autentikasi (Sistem Login)

Jangan memigrasikan fitur absen sebelum sistem login/keamanan (yang menggantikan `$_SESSION` di PHP) selesai.

1. **Install Library Autentikasi**
   - Gunakan library standar industri untuk Next.js: **NextAuth.js** (`npm install next-auth`).
2. **Konfigurasi Sistem Login**
   - Buat file konfigurasi (`app/api/auth/[...nextauth]/route.ts`).
   - Setup `CredentialsProvider` untuk memverifikasi username/password ke database (cocokkan hash password yang sama dengan PHP sebelumnya).
3. **Lindungi Halaman (Middleware/Authorization)**
   - Buat `middleware.ts` untuk memblokir halaman `/admin` atau `/pegawai` jika user belum memiliki sesi login yang valid.

---

## 🏗️ Fase 4: Migrasi Fitur Inti (UI & Logika)

Ini adalah porsi pekerjaan terbesar: memindahkan dan menerjemahkan file PHP Anda.

1. **Migrasi Frontend (Tampilan)**
   - Ubah HTML/CSS yang ada di folder `admin/` dan `pegawai/` menjadi **Komponen React** (biasanya di folder `app/admin/page.tsx`).
   - Ubah CSS lama menjadi kelas-kelas **Tailwind CSS** agar tampilan lebih modern dan responsif.
2. **Migrasi Backend (Proses Data)**
   - Ubah file PHP yang biasanya memproses Form (seperti insert data absen GPS) menjadi **Route Handlers** (API Endpoint seperti `app/api/absen/route.ts`) atau gunakan **Server Actions** Next.js.
3. **Integrasi Hardware (Kamera & GPS)**
   - Pindahkan script JS lama Anda yang memakai Web API native (`navigator.geolocation` untuk lokasi GPS dan WebRTC/input tag untuk kamera) ke dalam komponen React sisi klien (ditandai dengan `"use client"` di bagian atas file Next.js).

---

## 🚀 Fase 5: Langkah Paling Akhir (Testing, Build & Deployment)

Langkah terakhir ketika semua file PHP berhasil dipindahkan, dan aplikasi siap *Go-Live*.

1. **Pengujian Menyeluruh (Testing Local)**
   - Jalankan `npm run dev`. Simulasikan semua alur secara menyeluruh dari sisi *Admin* maupun *Pegawai* untuk memastikan tidak ada fungsi yang hilang/rusak.
2. **Proses Build (Kompilasi Aplikasi)**
   - Jalankan perintah build untuk menerjemahkan kode Next.js menjadi aplikasi produksi yang cepat:
     ```bash
     npm run build
     ```
   - Jika build berhasil (tidak ada *error* merah), project siap untuk tahap *Deployment*.
3. **Pilih Layanan Hosting**
   - > [!WARNING]
     > Next.js (yang memiliki backend Node.js) **TIDAK BISA** dijalankan di "Shared Hosting" biasa (seperti cPanel pada umumnya) yang hanya mendukung PHP.
   - **Solusi Hosting:** Gunakan platform modern seperti **Vercel** (sangat direkomendasikan dan gratis), Netlify, atau gunakan **VPS** (seperti AWS, DigitalOcean) menggunakan Nginx dan PM2.
4. **Siapkan Database Production**
   - Pindahkan database MySQL lokal Anda (`temp_db`) ke layanan Cloud Database (misal: Railway, PlanetScale, Aiven, atau VPS Anda).
   - Update `DATABASE_URL` di environment hosting production Anda.
5. **Rilis & Monitoring (Go Live)**
   - Arahkan domain utama instansi Anda (misal: `absen.desa-sumbersari.id`) ke server Next.js Anda.
   - Migrasi Selesai! Aplikasi Anda kini jauh lebih cepat, modern, dan siap menampung lebih banyak request.
