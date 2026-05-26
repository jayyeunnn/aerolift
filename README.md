# AeroLift

AeroLift adalah pelacak kebugaran minimalis yang dirancang untuk membantu kamu mencatat aktivitas olahraga dan nutrisi secara cepat dan mudah — kapan saja, di mana saja, bahkan tanpa koneksi internet. Aplikasi ini dirancang sebagai Progressive Web App (PWA) yang memberikan pengalaman layaknya aplikasi native di perangkat mobile maupun desktop.

## Fitur Utama

- **Pencatatan Kardio & Angkat Beban**: Lacak sesi lari, bersepeda, maupun latihan kekuatan di gym dengan mudah.
- **Input Suara Pintar**: Catat aktivitas olahraga atau makanan menggunakan suara kamu berkat dukungan Web Speech API.
- **Jurnal Nutrisi Harian**: Pantau asupan kalori dan makronutrisi harian untuk mendukung target kebugaran kamu.
- **Dukungan Offline Penuh**: Aplikasi tetap berfungsi tanpa koneksi internet. Data akan disinkronisasi secara otomatis ketika perangkat kembali online (mendukung PWA).
- **Statistik & Grafik Kemajuan**: Pantau perkembangan kebugaranmu dari waktu ke waktu melalui metrik yang visual dan mudah dipahami.

## Teknologi yang Digunakan

- **Frontend Framework**: [React 18](https://reactjs.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Database**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Offline Storage**: [localforage](https://localforage.github.io/localForage/)

## Cara Instalasi (Clone & Setup)

Ikuti langkah-langkah berikut untuk menjalankan AeroLift secara lokal di mesin kamu:

1. **Clone repositori**
   ```bash
   git clone https://github.com/username/aerolift-app.git
   cd aerolift-app
   ```
   *(Ganti URL dengan URL repositori yang sesuai jika berbeda)*

2. **Instal dependensi**
   Pastikan kamu telah menginstal Node.js, lalu jalankan:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env` di direktori root aplikasi (jika belum ada) atau salin dari `.env.example`. Tambahkan kredensial Supabase kamu:
   ```env
   VITE_SUPABASE_URL=URL_SUPABASE_KAMU
   VITE_SUPABASE_ANON_KEY=ANON_KEY_SUPABASE_KAMU
   ```

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173`.

---

Dibuat dengan ❤️ untuk pelacakan kebugaran yang lebih baik.
