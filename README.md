# MKI Dashboard

Dokumentasi ini disusun untuk kebutuhan instalasi, operasional, dan maintenance project `mki` agar onboarding developer dan handover tim lebih mudah.

## Ringkasan

MKI Dashboard adalah panel admin berbasis Laravel + Inertia React untuk:

- Manajemen master data brand, kategori, dan SKU produk
- Generate batch Tag/QR
- Monitoring aktivitas scan produk
- Manajemen user dan role (`Super Admin`, `Brand Owner`)
- Pengaturan keamanan aplikasi

## Teknologi

- PHP 8.2+ (composer requirement)
- Laravel 12
- React 18 + Inertia.js
- Vite
- MySQL 8 (untuk setup Docker)
- Docker Compose (opsional)

## URL Penting

- Public homepage: `/`
- Login: `/login`
- Dashboard admin: `/adminmki`
- Verifikasi produk publik: `/verify-product-code`

## Prasyarat

Pastikan tools ini sudah terpasang:

- Git
- Composer
- Node.js + npm
- PHP 8.2+
- MySQL/MariaDB (jika tanpa Docker)
- Docker Desktop + Docker Compose (jika pakai Docker)

## Instalasi Lokal (Tanpa Docker)

1. Clone repository dari GitHub.

```bash
git clone <URL_REPOSITORY_GITHUB> mki
cd mki
```

2. Install dependency backend dan frontend.

```bash
composer install
npm install
```

3. Buat file environment.

```bash
cp .env.example .env
# PowerShell:
# Copy-Item .env.example .env
```

4. Konfigurasi `.env` (minimal `APP_URL`, `DB_*`).

Contoh MySQL lokal:

```env
APP_URL=http://127.0.0.1:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

5. Generate key, migrate database, dan link storage.

```bash
php artisan key:generate
php artisan migrate
php artisan storage:link
```

6. Jalankan mode development.

```bash
composer run dev
```

`composer run dev` akan menjalankan:

- Laravel server
- Queue listener
- Log tail (`pail`)
- Vite dev server

## Instalasi dengan Docker

`docker-compose.yml` pada project ini memakai service:

- `app` (Laravel/PHP)
- `mysql`
- `phpmyadmin`

1. Clone dan masuk ke folder project.

```bash
git clone <URL_REPOSITORY_GITHUB> mki
cd mki
```

2. Buat `.env`, lalu pastikan konfigurasi DB untuk container MySQL.

```bash
cp .env.example .env
```

Contoh nilai penting di `.env`:

```env
APP_PORT=8000
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=secret
MYSQL_ROOT_PASSWORD=root
FORWARD_DB_PORT=3307
PHPMYADMIN_PORT=8080
```

3. Jalankan container.

```bash
docker compose up -d --build
```

4. Install dependency PHP dan setup Laravel di container.

```bash
docker compose exec -T app composer install
docker compose exec -T app php artisan key:generate
docker compose exec -T app php artisan migrate
docker compose exec -T app php artisan storage:link
```

5. Install/build asset frontend dari host (karena image `app` tidak membawa Node.js).

```bash
npm install
npm run dev
# atau untuk production:
# npm run build
```

URL default:

- App: `http://localhost:8000`
- phpMyAdmin: `http://localhost:8080`
- MySQL host port: `3307`

## Akun Awal dan Login

Catatan penting:

- Route register publik dinonaktifkan
- `DatabaseSeeder` default kosong (tidak membuat akun dummy)
- Dashboard `/adminmki` memakai middleware `auth` + `verified`

Jika belum ada user admin, buat manual via tinker:

```bash
php artisan tinker --execute="\App\Models\User::query()->forceCreate(['name'=>'Super Admin','email'=>'admin@example.com','email_verified_at'=>now(),'password'=>'Admin12345!','role'=>'Super Admin','status'=>1]);"
```

Setelah itu login ke `/login`.

## Workflow GitHub untuk Maintenance

### Clone pertama kali

```bash
git clone <URL_REPOSITORY_GITHUB> mki
cd mki
```

### Update branch lokal dari `main`

```bash
git checkout main
git pull origin main
```

### Buat branch kerja

```bash
git checkout -b chore/<nama-perubahan>
```

### Commit dan push

```bash
git add .
git commit -m "chore: <deskripsi perubahan>"
git push -u origin chore/<nama-perubahan>
```

### Setelah itu

- Buat Pull Request ke `main`
- Minta review
- Merge setelah lulus review dan verifikasi

## SOP Maintenance Rutin

### 1) Cek kondisi service

Tanpa Docker:

```bash
php artisan about
```

Dengan Docker:

```bash
docker compose ps
```

### 2) Cek log aplikasi

```bash
tail -f storage/logs/laravel.log
# PowerShell:
# Get-Content storage\logs\laravel.log -Wait
```

### 3) Backup database

MySQL lokal:

```bash
mysqldump -u root -p laravel > backup_YYYYMMDD.sql
```

MySQL Docker:

```bash
docker compose exec -T mysql sh -lc "mysqldump -uroot -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE" > backup_YYYYMMDD.sql
```

### 4) Restore database (jika perlu)

MySQL lokal:

```bash
mysql -u root -p laravel < backup_YYYYMMDD.sql
```

MySQL Docker:

```bash
docker compose exec -i mysql sh -lc "mysql -uroot -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE" < backup_YYYYMMDD.sql
```

### 5) Deploy/update aman (ringkas)

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

Untuk setup Docker, jalankan command `php artisan ...` via:

```bash
docker compose exec -T app <COMMAND>
```

## Command Cepat yang Sering Dipakai

```bash
# Jalankan dev all-in-one
composer run dev

# Jalankan test
composer run test

# Bersihkan cache
php artisan optimize:clear

# Rebuild frontend
npm run build
```

## Troubleshooting Umum

1. Error `Vite manifest not found`

- Solusi: jalankan `npm run build`

2. Error `No application encryption key has been specified`

- Solusi: jalankan `php artisan key:generate`

3. Login berhasil tapi tidak bisa masuk `/adminmki`

- Cek `email_verified_at` user tidak `NULL`
- Cek `status` user aktif (`1`)

4. Error tabel tidak ditemukan (`SQLSTATE...`)

- Solusi: jalankan `php artisan migrate`

5. Perubahan code tidak tampil

- Jalankan `php artisan optimize:clear`
- Hard refresh browser

## Struktur Folder Inti

```text
app/
database/
resources/js/
resources/views/
routes/
```

## Catatan Tambahan

- Jangan edit file hasil build di `public/build`
- Lakukan backup DB sebelum migrasi di environment produksi
- Simpan kredensial `.env` di secret manager, jangan commit ke GitHub

