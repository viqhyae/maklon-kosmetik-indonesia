# MKI Dashboard

Dokumentasi resmi untuk operasional dan maintenance website verifikasi keaslian produk MKI.

## 1. Website Ini Apa?

Project ini adalah **website verifikasi keaslian produk** dengan 2 area utama:

- **Halaman publik (`/`)** untuk cek kode produk oleh customer
- **Dashboard admin (`/adminmki`)** untuk operasional internal

Fungsi utama:

- Validasi kode produk (asli/peringatan/suspended/invalid)
- Pencatatan aktivitas scan (waktu, status, lokasi, IP, lat/lng)
- Manajemen master data:
  - Brand
  - Kategori produk (3 level)
  - SKU produk + spesifikasi dinamis
- Generate batch tag / QR
- Manajemen user & role (`Super Admin`, `Brand Owner`)
- Pengaturan keamanan (`max_valid_scan_limit`, `require_gps`)

## 2. Stack Teknologi

Backend:

- PHP `^8.2`
- Laravel `^12`
- Inertia Laravel `^2.0`
- MySQL 8

Frontend:

- React `^18`
- Inertia React `^2.0`
- Vite `^7`
- TailwindCSS
- Axios
- Lucide React

Infra:

- Docker + Docker Compose (opsional, direkomendasikan untuk onboarding cepat)
- Service compose: `app`, `mysql`, `phpmyadmin`

## 3. Kebutuhan Sistem

## Kebutuhan software (tanpa Docker)

- Git
- PHP 8.2+
- Composer
- Node.js + npm
- MySQL/MariaDB

## Kebutuhan software (dengan Docker)

- Git
- Docker Desktop
- Docker Compose
- Node.js + npm (untuk build asset frontend di host)

## Rekomendasi resource minimum

- Development: 2 vCPU, 4 GB RAM, 10 GB storage
- Production kecil-menengah: 4 vCPU, 8 GB RAM, SSD + backup terjadwal

## 4. Instalasi (Tanpa Docker)

```bash
git clone https://github.com/viqhyae/maklon-kosmetik-indonesia.git mki
cd mki
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
composer run dev
```

Catatan Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Minimal `.env`:

```env
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

`composer run dev` menjalankan:

- Laravel server
- Queue listener
- Laravel log tail (`pail`)
- Vite dev server

## 5. Instalasi (Docker)

```bash
git clone https://github.com/viqhyae/maklon-kosmetik-indonesia.git mki
cd mki
cp .env.example .env
docker compose up -d --build
docker compose exec -T app composer install
docker compose exec -T app php artisan key:generate
docker compose exec -T app php artisan migrate
docker compose exec -T app php artisan storage:link
npm install
npm run dev
```

Default endpoint:

- App: `http://localhost:8000`
- phpMyAdmin: `http://localhost:8080`
- MySQL host port: `3307`

## 6. Akun Awal

Register publik nonaktif. Jika belum ada admin, buat manual:

```bash
php artisan tinker --execute="\App\Models\User::query()->forceCreate(['name'=>'Super Admin','email'=>'admin@example.com','email_verified_at'=>now(),'password'=>'Admin12345!','role'=>'Super Admin','status'=>1]);"
```

Lalu login di `/login`.

## 7. SOP Maintenance

## Harian

1. Cek status service:
   - Lokal: `php artisan about`
   - Docker: `docker compose ps`
2. Cek error log:
   - `tail -f storage/logs/laravel.log`
3. Pantau scan activity dan respons halaman publik.

## Mingguan

1. Backup database.
2. Verifikasi restore backup pada environment test/staging.
3. Cek ukuran storage (`storage/logs`, `storage/app/public`).
4. Jalankan `php artisan optimize:clear` bila ada gejala cache stale.

## Bulanan

1. Update dependency keamanan (Composer/NPM) bertahap.
2. Audit akun admin aktif dan role.
3. Review performa query scan / dashboard.

## Backup & Restore

Backup (MySQL lokal):

```bash
mysqldump -u root -p laravel > backup_YYYYMMDD.sql
```

Backup (Docker):

```bash
docker compose exec -T mysql sh -lc "mysqldump -uroot -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE" > backup_YYYYMMDD.sql
```

Restore (lokal):

```bash
mysql -u root -p laravel < backup_YYYYMMDD.sql
```

Restore (Docker):

```bash
docker compose exec -i mysql sh -lc "mysql -uroot -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE" < backup_YYYYMMDD.sql
```

## Deploy / Update Aman

```bash
php artisan down
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan up
```

Jika Docker:

```bash
docker compose exec -T app <COMMAND>
```

## 8. Command Cepat

```bash
composer run dev
composer run test
php artisan optimize:clear
npm run build
```

## 9. Troubleshooting Singkat

1. `Vite manifest not found`
   - Jalankan `npm run build`
2. `No application encryption key has been specified`
   - Jalankan `php artisan key:generate`
3. Tidak bisa akses `/adminmki` setelah login
   - Pastikan `email_verified_at` terisi
   - Pastikan status user aktif (`1`)
4. Error tabel tidak ditemukan
   - Jalankan `php artisan migrate`
5. Perubahan tidak muncul
   - Jalankan `php artisan optimize:clear`
   - Hard refresh browser

## 10. Struktur Folder Penting

```text
app/
database/
resources/js/
resources/views/
routes/
```

## 11. Catatan Penting

- Jangan edit file hasil build di `public/build`.
- Wajib backup DB sebelum migrasi produksi.
- Simpan kredensial `.env` di secret manager, jangan commit ke Git.
