# Dokumentasi Arsitektur AdminPanel

Dokumentasi ini menjelaskan struktur terbaru halaman admin setelah refactor besar dari file monolitik menjadi modul-modul terpisah.

## Tujuan Refactor

- Mengurangi kompleksitas file utama.
- Memisahkan tanggung jawab antara _container_, _view_, _sidebar config_, _komponen reusable_, dan _config data_.
- Mempermudah maintenance oleh developer lain.
- Menjaga perilaku aplikasi tetap sama (tanpa perubahan fitur).

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
