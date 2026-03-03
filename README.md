# Smart Queue System - Buku Tamu Digital

Sistem Antrian Terintegrasi untuk pengelolaan pengunjung dan antrian secara digital.

## 🚀 Fitur

### Public Features
- 📝 **Form Pendaftaran Digital** - Isi data pengunjung via QR Code
- 📷 **Capture Foto Selfie** - Kamera terintegrasi
- ✍️ **Tanda Tangan Digital** - Canvas signature pad
- 📍 **Auto Location** - Deteksi lokasi via GPS
- 🎫 **E-Ticket** - Tiket digital dengan QR Code

### Display Screen
- 🖥️ **Public Display** - Layar antrian fullscreen untuk TV
- 🔊 **Voice Announcement** - Panggilan suara otomatis (Web Speech API)
- 📊 **Real-time Statistics** - Statistik antrian live (polling)
- 📜 **Running Text** - Informasi berjalan

### Admin Dashboard
- 🔐 **Authentication** - Login dengan Laravel Sanctum
- 📊 **Dashboard** - Statistik antrian hari ini
- 🎛️ **Queue Management** - Panggil, selesaikan, lewati antrian
- ⚙️ **Service Management** - Kelola layanan dan loket

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 10 (PHP 8.3) |
| Frontend | React 18 + Vite |
| UI | Tailwind CSS + Shadcn-style Components |
| Auth | Laravel Sanctum |
| Database | MySQL |

## 📋 Requirements

- PHP >= 8.1
- Node.js >= 18
- MySQL >= 5.7
- Composer
- NPM

## ⚡ Installation

1. **Clone & Install Dependencies**
```bash
composer install
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
php artisan key:generate
```

3. **Configure Database** (edit .env)
```
DB_DATABASE=bukutamu
DB_USERNAME=root
DB_PASSWORD=
```

4. **Run Migration & Seeder**
```bash
php artisan migrate --seed
```

5. **Build Frontend**
```bash
npm run build
```

6. **Start Server**
```bash
php artisan serve
```

## 🔑 Default Login

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password | Admin |
| superadmin@example.com | password | Super Admin |

## 📁 Project Structure

```
app/
├── Http/Controllers/
│   ├── Public/          # Public API controllers
│   └── Admin/           # Admin API controllers
├── Models/              # Eloquent models
└── Services/            # Business logic (QueueService)

resources/js/
├── components/ui/       # Reusable UI components
├── pages/               # React pages
│   ├── PublicForm.jsx
│   ├── TicketDisplay.jsx
│   ├── PublicDisplay.jsx
│   └── admin/
├── services/            # API service
└── lib/                 # Utilities

database/
├── migrations/          # Database schema
└── seeders/            # Initial data
```

## 🌐 Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Form pendaftaran pengunjung |
| `/ticket/{id}` | Tampilan tiket |
| `/display` | Layar display antrian |

### Admin Routes
| Route | Description |
|-------|-------------|
| `/admin/login` | Login admin |
| `/admin/dashboard` | Dashboard statistik |
| `/admin/queue` | Kelola antrian |
| `/admin/services` | Kelola layanan & loket |

### API Routes
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/services` | Daftar layanan |
| POST | `/api/queue/register` | Daftar antrian |
| GET | `/api/ticket/{id}` | Detail tiket |
| GET | `/api/display/current` | Data display |
| POST | `/api/admin/login` | Login admin |
| GET | `/api/admin/queue` | Daftar antrian |
| POST | `/api/admin/queue/call` | Panggil antrian |

## 📱 Usage Flow

### Pengunjung
1. Scan QR Code → Buka form pendaftaran
2. Isi data diri, foto, tanda tangan
3. Submit → Dapatkan nomor antrian
4. Tunggu di layar display

### Admin
1. Login ke `/admin/login`
2. Lihat statistik di dashboard
3. Kelola antrian: PANGGIL → SELESAI/LEWATI
4. Kelola layanan & loket

## 🎨 Customization

### Menambah Layanan
Via Admin Panel → Layanan → Tambah Layanan

### Mengubah Suara
Edit `resources/js/lib/utils.js` - function `speakQueueNumber()`

### Mengubah Tema
Edit `resources/css/app.css` - CSS variables

## 📄 License

MIT License

## 👨‍💻 Author

Smart Queue System - 2026