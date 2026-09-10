# SuperGT Web Panel & server_data.php

Web server controller untuk Growtopia Private Server (GTPS) yang siap di-deploy secara **100% GRATIS** ke **Vercel**.

## 🌟 Fitur
- **Domain 18 Karakter:** `supergt.vercel.app` (sama persis dengan panjang `www.growtopia1.com`, aman saat di-patch ke APK).
- **HTTPS Otomatis:** Sertifikat SSL aktif dari Vercel tanpa setting apapun.
- **Modern Dark UI Panel:** Akses `/panel` untuk mengganti IP VPS, Port, Meta, dan pesan Maintenance secara langsung.
- **Endpoint GTPS:** Meng-handle request `/growtopia/server_data.php` dengan format standar game Growtopia.

---

## 🚀 Cara Deploy ke Vercel (Gratis & Cepat)

### Langkah 1: Upload ke GitHub
1. Buka [github.com](https://github.com) dan buat repository baru bernama `supergt-panel` (bisa Public atau Private).
2. Jalankan perintah git di folder ini:
   ```bash
   git init
   git add .
   git commit -m "Initial commit SuperGT panel"
   git branch -M main
   git remote add origin https://github.com/USERNAME_KAMU/supergt-panel.git
   git push -u origin main
   ```

### Langkah 2: Hubungkan ke Vercel
1. Buka [vercel.com](https://vercel.com) dan login menggunakan akun GitHub kamu.
2. Klik tombol **Add New...** -> **Project**.
3. Pilih repository `supergt-panel` yang baru saja kamu upload -> klik **Import**.
4. Di bagian **Project Name**, pastikan diisi: `supergt` (agar domain yang kamu dapat adalah `supergt.vercel.app`).
5. Klik **Deploy**!

Selesai! Dalam 30 detik web kamu sudah live di:
- **Panel:** `https://supergt.vercel.app/panel`
- **Game Endpoint:** `https://supergt.vercel.app/growtopia/server_data.php`

---

## 🧪 Menjalankan Secara Lokal (Uji Coba di PC)
Kamu bisa menguji web server ini di PC kamu tanpa instal modul apapun:
```bash
node local-server.js
```
Lalu buka browser di `http://localhost:3000/panel`.
