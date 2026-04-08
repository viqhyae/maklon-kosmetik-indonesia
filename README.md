# Dokumentasi Arsitektur MKI-DASHBOARD

Dokumentasi ini menjelaskan struktur terbaru halaman admin setelah refactor besar dari file monolitik menjadi modul-modul terpisah.

## Source Of Truth Halaman Utama

- Public `/`:
  dirender oleh backend Blade `resources/views/front/page/home.blade.php`
  melalui `LegacyFrontController@index`.
- Login `/login`:
  dirender oleh Inertia page `resources/js/Pages/Auth/Login.jsx`.
- Dashboard `/adminmki`:
  dirender oleh Inertia page `resources/js/Pages/AdminPanel.jsx`.
- `resources/js/Layouts/GuestLayout.jsx` dipakai oleh halaman auth lain
  (forgot/reset/verify/confirm), bukan renderer utama untuk `/login`.

## Tujuan Refactor

- Mengurangi kompleksitas file utama.
- Memisahkan tanggung jawab antara _container_, _view_, _sidebar config_, _komponen reusable_, dan _config data_.
- Mempermudah maintenance oleh developer lain.
- Menjaga perilaku aplikasi tetap sama (tanpa perubahan fitur).

## Cara Pemakaian

### Prasyarat

- PHP 8.2+
- Composer
- Node.js + npm
- Database MySQL/MariaDB (atau SQLite sesuai konfigurasi `.env`)

### Menjalankan Project (Lokal)

1. Install dependency backend dan frontend:

```bash
composer install
npm install
```

2. Buat file environment:

```bash
cp .env.example .env
```

3. Generate app key:

```bash
php artisan key:generate
```

4. Atur koneksi database di `.env`, lalu jalankan migrasi + seeder:

```bash
php artisan migrate --seed
```

5. Jalankan aplikasi:

```bash
composer run dev
```

Setelah itu akses aplikasi di URL Laravel Anda (umumnya `http://127.0.0.1:8000`).

### Menjalankan dengan Docker (Sail)

1. Jalankan container:

```bash
docker compose up -d
```

2. Install dependency:

```bash
docker compose exec -T laravel.test composer install
docker compose exec -T laravel.test npm install
```

3. Setup aplikasi:

```bash
docker compose exec -T laravel.test php artisan key:generate
docker compose exec -T laravel.test php artisan migrate --seed
```

4. Jalankan Vite dev server (opsional untuk development frontend):

```bash
docker compose exec -T laravel.test npm run dev
```

## Cara Login dan Akun

### URL Login

- Halaman login: `/login`
- Akses root `/` otomatis diarahkan ke `/login` jika belum login.

### Akun Default Seeder

Jika Anda menjalankan `php artisan migrate --seed`, akun default yang dibuat adalah:

| Nama      | Email            | Password | Role        | Status |
|-----------|------------------|----------|-------------|--------|
| Test User | test@example.com | password | Brand Owner | Aktif  |

### Catatan Penting Login

- Registrasi publik dinonaktifkan (route register di-comment).
- Jika akun default belum ada, jalankan kembali:

```bash
php artisan db:seed
```

- Jika database perlu di-reset total:

```bash
php artisan migrate:fresh --seed
```

## Kegunaan Website Ini

Website ini berfungsi sebagai panel admin untuk sistem manajemen brand dan tag verifikasi produk.

Manfaat utamanya:

- Sentralisasi data master `Brand`, `Kategori Produk`, dan `SKU Produk`.
- Pembuatan `Tag/QR` secara massal per batch untuk kebutuhan verifikasi produk.
- Monitoring aktivitas scan dari end-user untuk deteksi indikasi pemalsuan.
- Pengelolaan akun internal dan role akses (`Super Admin` dan `Brand Owner`).
- Pengaturan parameter sistem terkait keamanan dan perilaku scan.

## Flow Penggunaan Website

Flow operasional yang direkomendasikan:

1. Login melalui `/login`.
2. Buka tab `Dashboard` untuk melihat ringkasan data master dan statistik scan.
3. Kelola `Brand` (buat/ubah/nonaktifkan) dan tetapkan pemilik brand (Brand Owner).
4. Susun `Kategori Produk` (level 1, 2, 3) agar struktur katalog konsisten.
5. Input/kelola `SKU Produk` sesuai brand dan kategori yang sudah tersedia.
6. Generate batch `Tag/QR` pada menu `Generate Tag/QR`, lalu unduh hasil tag bila diperlukan.
7. Pantau `Aktivitas Scan` untuk melihat status validasi seperti `Original`, `Peringatan`, `Invalid`, atau indikasi lain.
8. Kelola `Users & Roles` untuk menambah user, ubah role, reset password, serta kontrol status akun.
9. Atur konfigurasi global pada menu `Pengaturan` sesuai kebijakan operasional.

Flow implementasi awal (first setup) yang umum:

1. Jalankan migrasi + seed.
2. Login dengan akun default.
3. Buat/aktifkan akun `Super Admin` jika diperlukan untuk kontrol penuh.
4. Tambahkan user `Brand Owner`.
5. Lengkapi master data, lalu mulai generate tag.

## Ringkasan Arsitektur

Saat ini arsitektur halaman admin dibagi menjadi 5 lapisan utama:

1. `AdminPanel.jsx` sebagai _container/controller_ utama.
2. `Views/` untuk setiap tab konten.
3. `Sidebar/` untuk definisi item menu sidebar.
4. `components/` untuk komponen reusable lintas view.
5. `config/` untuk data konstan dan skema.

## Entry Point Halaman Admin

- Backend route: `/dashboard`
- Controller: `BrandController@index`
- Inertia render: `Inertia::render('AdminPanel', ...)`
- Frontend page: `resources/js/Pages/AdminPanel.jsx`

## Struktur Folder (Aktual)

```text
resources/js/Pages/
  AdminPanel.jsx
  AdminPanel/
    Sidebar/
      index.js
      Dashboard.js
      Brand.js
      ProductCategories.js
      ProductSku.js
      GenerateTag.js
      ScanActivity.js
      UsersRoles.js
      Settings.js

    Views/
      createAdminPanelViews.jsx
      Dashboard.jsx
      BrandManager.jsx
      CategoryManager.jsx
      ProductManager.jsx
      ProductForm.jsx
      TagGenerator.jsx
      UserManager.jsx
      ScanHistory.jsx
      Settings.jsx

    components/
      StatCard.jsx
      PageAlert.jsx
      ToggleSwitch.jsx
      Tooltip.jsx
      LeafletMap.jsx
      SortIcon.jsx

    config/
      productCatalog.js
```

## Peran Tiap Bagian

### 1) `AdminPanel.jsx`

File ini bertanggung jawab untuk:

- Menyimpan state global (active tab, modal, data, sorting, filter, toast, confirm).
- Menyimpan business logic dan handler API (create/update/delete, transform data, helper).
- Menyusun layout utama (sidebar, header, content area, modal global).
- Mengirim context ke seluruh view melalui `createAdminPanelViews`.

Catatan: File ini memang masih cukup panjang karena menampung logika aplikasi inti.

### 2) `Views/`

Setiap file di `Views/` mewakili 1 tab layar.

- `Dashboard.jsx`
- `BrandManager.jsx`
- `CategoryManager.jsx`
- `ProductManager.jsx`
- `ProductForm.jsx`
- `TagGenerator.jsx`
- `UserManager.jsx`
- `ScanHistory.jsx`
- `Settings.jsx`

`createAdminPanelViews.jsx` adalah aggregator/factory yang mengembalikan fungsi render per tab.

### 3) `Sidebar/`

Folder ini hanya berisi konfigurasi menu sidebar (id, label, icon, isSub).

`Sidebar/index.js` menggabungkan item menjadi 3 kelompok:

- `DASHBOARD_ITEM`
- `MASTER_DATA_ITEMS`
- `SYSTEM_ITEMS`

### 4) `components/`

Komponen reusable yang dipakai lintas view:

- `StatCard`
- `PageAlert`
- `ToggleSwitch`
- `Tooltip`
- `LeafletMap`
- `SortIcon`

### 5) `config/`

`productCatalog.js` berisi:

- `INITIAL_CATEGORY_DATA`
- `PRODUCT_SPEC_SCHEMA`

## Alur Render UI

1. Backend mengirim props awal ke Inertia (`databaseBrands`, `databaseCategories`, `databaseUsers`, `databaseTagBatches`).
2. `AdminPanel.jsx` menerima props, normalisasi data, dan menyimpan state.
3. `AdminPanel.jsx` memanggil `createAdminPanelViews(context)`.
4. Berdasarkan `activeTab`, tab yang sesuai dirender:

- `dashboard` -> `Dashboard()`
- `brand` -> `BrandManager()`
- `categories` -> `CategoryManager()`
- `product` -> `ProductManager()`
- `product_form` -> `ProductForm()`
- `tags` -> `TagGenerator()`
- `users` -> `UserManager()`
- `scan_history` -> `ScanHistory()`
- `settings` -> `Settings()`

## Konvensi Penamaan (Saat Ini)

- Nama folder sidebar: `Sidebar` (tidak memakai kata `MenuItems`).
- Nama file sidebar: tanpa suffix `MenuItem`.
- Nama file di `Views`: tanpa suffix `View`.
- Factory view: `createAdminPanelViews`.

## Panduan Maintenance

### Menambah menu sidebar baru

1. Tambah file baru di `resources/js/Pages/AdminPanel/Sidebar/`.
2. Export object item menu (id, label, icon, isSub).
3. Daftarkan di `Sidebar/index.js` ke grup yang sesuai.
4. Tambahkan handler render di `AdminPanel.jsx` bila butuh tab baru.

### Menambah tab view baru

1. Buat file baru di `Views/`, contoh: `Report.jsx`.
2. Export creator function, contoh: `createReport(context)`.
3. Daftarkan di `Views/createAdminPanelViews.jsx`.
4. Tambah kondisi render `activeTab` di `AdminPanel.jsx`.
5. Tambah item sidebar (jika tab harus bisa diklik dari menu).

### Menambah komponen reusable

1. Buat file di `components/`.
2. Import di `AdminPanel.jsx`.
3. Teruskan via `context` ke view yang membutuhkan.

## Build dan Validasi

Jalankan build untuk memastikan semua rename/import aman:

```bash
npm run build
```

Bila memakai container Docker project:

```bash
docker compose exec -T laravel.test npm run build
```

## Catatan Penting

- Setelah rename file/folder, selalu update seluruh import terkait.
- Jangan edit file hasil build di `public/build/`.
- Jika menambah state/handler baru, prioritaskan menaruh UI di `Views/` dan logika di `AdminPanel.jsx`.
- Untuk langkah refactor lanjutan, disarankan memecah logic besar di `AdminPanel.jsx` menjadi custom hooks (`useBrand`, `useUser`, `useTagBatch`, dll).

## Status Refactor Saat Ini

- Pemecahan sidebar: selesai.
- Pemecahan view per tab: selesai.
- Rename `Dashboard` ke `AdminPanel`: selesai.
- Konsistensi penamaan file/folder (`Sidebar`, tanpa suffix `View`/`MenuItem`): selesai.
- Build verifikasi pasca-rename: selesai.
