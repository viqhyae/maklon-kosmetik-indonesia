# Jalankan Project dengan Docker

## 1) Pastikan Docker Desktop aktif
- Buka Docker Desktop sampai status engine `running`.

## 2) Build dan nyalakan container
```bash
docker compose up -d --build
```

## 3) Inisialisasi Laravel (sekali saja / saat butuh)
```bash
docker compose exec app php artisan key:generate --force
docker compose exec app php artisan migrate --force
```

## 4) Akses aplikasi
- App: `http://localhost:7777`
- Vite HMR: `http://localhost:5173`
- MySQL host machine: `127.0.0.1:3307`

## 5) Cek status / log
```bash
docker compose ps
docker compose logs -f app
docker compose logs -f web
docker compose logs -f vite
docker compose logs -f db
```

## 6) Stop container
```bash
docker compose down
```

Untuk reset database volume:
```bash
docker compose down -v
```
