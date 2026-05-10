# Catatan Deploy Production

Domain production:

- `https://cek.maklonkosmetik.co.id`

## 1. Paket File Manager Siap Upload

Paket siap upload dibuat dengan struktur:

```text
DATABASE_IMPORT.sql
public_html/
laravel_app/
```

Cara pakai di hosting:

1. Upload file `mki-file-manager-ready.zip` ke folder utama akun hosting, yaitu folder yang posisinya sejajar dengan `public_html`.
2. Extract zip tersebut.
3. Pastikan hasilnya menjadi `public_html/index.php` dan `laravel_app/.env`.
4. Masuk phpMyAdmin, pilih database hosting yang dipakai aplikasi, lalu import `DATABASE_IMPORT.sql`.
5. Setelah import berhasil, hapus `DATABASE_IMPORT.sql` dari hosting.
6. Buka `https://cek.maklonkosmetik.co.id`.

Tidak perlu menjalankan `composer install`, `npm install`, `npm run build`, `php artisan migrate`, `php artisan storage:link`, atau `php artisan env:decrypt` untuk paket ini, karena vendor, build asset, `.env` production, dan SQL awal sudah ikut di dalam paket.

Jika File Manager langsung membuka folder `public_html`, naik satu folder dulu sebelum upload zip. Jangan extract zip ini di dalam `public_html`, karena nanti strukturnya menjadi dobel.

## 2. Database Awal

File SQL siap import ada di:

```text
DATABASE_IMPORT.sql
```

Isi SQL:

- semua tabel Laravel dan tabel aplikasi
- data dari database Docker lokal yang sudah pernah dipakai
- akun/user lama, brand, produk, batch tag, kode tag, riwayat scan, kategori, dan pengaturan
- hash password lama, jadi password login lama tetap berlaku

Login awal:

```text
Email    : admin@gmail.com
Password : pakai password lama yang sudah pernah dipakai
```

Jika database hosting sudah berisi data lama, jangan import file ini sebelum backup, karena SQL ini disiapkan untuk database kosong deploy pertama.

## 3. Environment Server

Pastikan server memakai PHP 8.2+ dengan extension umum Laravel aktif: `pdo_mysql`, `mbstring`, `fileinfo`, `openssl`, `tokenizer`, `xml`, `ctype`, dan `json`.

Isi file `.env` di server dengan nilai production:

```env
APP_NAME="Cek MKI"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://cek.maklonkosmetik.co.id
APP_TIMEZONE=Asia/Jakarta
APP_TRUSTED_HOSTS=cek.maklonkosmetik.co.id
FORCE_HTTPS=true

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=ISI_NAMA_DB_HOSTING
DB_USERNAME=ISI_USERNAME_DB_HOSTING
DB_PASSWORD=ISI_PASSWORD_DB_HOSTING

SESSION_DRIVER=database
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

FILESYSTEM_DISK=public
QUEUE_CONNECTION=database
CACHE_STORE=database

SECURITY_HEADERS_ENABLED=true
SECURITY_HSTS_ENABLED=true
SECURITY_HSTS_MAX_AGE=31536000
```

Pastikan `APP_KEY` sudah terisi. Jika belum:

```bash
php artisan key:generate --force
```

## 4. Environment Terenkripsi

File `.env` sudah dienkripsi menjadi `.env.encrypted`. File terenkripsi ini boleh ikut repository atau paket deploy, tetapi encryption key wajib disimpan terpisah di secret manager/catatan aman.

Decrypt di server:

```bash
php artisan env:decrypt --key="ISI_ENV_ENCRYPTION_KEY" --force
```

Alternatif lewat environment variable:

```bash
LARAVEL_ENV_ENCRYPTION_KEY="ISI_ENV_ENCRYPTION_KEY" php artisan env:decrypt --force
```

Setelah `.env` berhasil terbentuk di server, jangan simpan key di file project.

Jika isi `.env` berubah, encrypt ulang dari lokal:

```bash
php artisan env:encrypt --force
```

Simpan key baru, lalu anggap key lama sudah tidak berlaku.

## 5. Build Manual Sebelum Upload

Bagian ini hanya untuk deploy manual dari source repository. Paket `mki-file-manager-ready.zip` sudah melewati langkah ini.

Jalankan dari root project:

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan optimize:clear
```

Folder `public/build` wajib ikut ter-upload bila server production tidak menjalankan `npm run build`.

## 6. Struktur Hosting

Document root domain harus mengarah ke folder `public`.

Jika panel hosting tidak bisa mengarah langsung ke `public`, pindahkan isi folder `public` ke `public_html`, lalu sesuaikan path `require` di `public_html/index.php` agar mengarah ke folder project Laravel.

## 7. Command Setelah Upload Manual

Bagian ini hanya untuk deploy manual dari source repository. Paket `mki-file-manager-ready.zip` tidak membutuhkan command ini.

Jalankan di server:

```bash
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Jika belum ada admin, buat dari server:

```bash
php artisan tinker --execute="\App\Models\User::query()->forceCreate(['name'=>'Super Admin','email'=>'admin@example.com','email_verified_at'=>now(),'password'=>'GANTI_PASSWORD_KUAT','role'=>'Super Admin','status'=>1]);"
```

Ganti email dan password sebelum dipakai live.

## 8. Jangan Upload

- `.git`
- `.env` lokal/development
- `node_modules`
- dump database lama atau cadangan seperti `*.sql`
- file log di `storage/logs`
- cache sementara di `storage/framework/views`
- encryption key untuk `.env.encrypted`

Catatan: `DATABASE_IMPORT.sql` boleh ikut paket awal agar mudah import. Setelah import berhasil di phpMyAdmin, hapus file itu dari hosting.

## 9. Cek Setelah Live

- Buka `https://cek.maklonkosmetik.co.id`
- Login ke `https://cek.maklonkosmetik.co.id/login`
- Masuk dashboard `/adminmki`
- Coba cek kode produk publik
- Upload logo/foto produk kecil untuk memastikan `storage:link` berjalan

## 10. Checklist Keamanan

- Pastikan SSL aktif dan redirect HTTP ke HTTPS aktif dari hosting/CDN.
- Pastikan document root mengarah ke `public`, bukan root project Laravel.
- Pastikan `.env`, `.env.encrypted`, `composer.lock`, dan file project lain tidak bisa dibuka langsung dari browser.
- Simpan encryption key `.env.encrypted` di tempat aman, terpisah dari source code.
- Gunakan password Super Admin yang unik dan kuat.
- Nonaktifkan akun yang tidak dipakai dari menu Users & Roles.
- Backup database sebelum dan sesudah deploy pertama.
- Setelah deploy, jalankan `php artisan route:list` di server untuk memastikan route register/reset publik tetap tidak aktif.
