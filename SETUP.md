# Setup Portal OPA OFFICIAL (sekali saja, ±10 menit)

## 1. Buat project Firebase
1. Buka https://console.firebase.google.com → **Add project** → nama: `opa-official`
2. (Google Analytics boleh dimatikan)

## 2. Aktifkan Authentication
- **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save**

## 3. Aktifkan Firestore
- **Build → Firestore Database → Create database**
- Pilih lokasi terdekat (`asia-southeast2` Jakarta), mode **Production**

## 4. Pasang aturan keamanan (WAJIB)
- Firestore → tab **Rules** → hapus isinya → tempel seluruh isi file `firestore.rules` → **Publish**

## 5. Ambil config web
- ⚙️ Project settings → **Your apps → `</>` (Web)** → daftarkan app → salin blok `firebaseConfig`
- Buka `js/firebase-config.js` dan ganti semua nilai `GANTI_...` dengan config kamu

## 6. Izinkan domain GitHub Pages
- Authentication → **Settings → Authorized domains → Add domain**
- Tambahkan: `feynjf.github.io` (atau domain kamu)

## 7. Buat akun Admin & Guest
Buka website kamu → tab **Create Akun**, lalu buat dua akun:

| Username | Password | Untuk |
|---|---|---|
| `admin` | `adminOPAOFFICIAL1234` | admin / developer |
| `User` | `User12345` | akun guest demo |

> Catatan: username disimpan huruf kecil di belakang layar, jadi `User` = `user`.

## 8. Jadikan akun `admin` benar-benar admin
Semua akun baru otomatis `guest`. Naikkan **manual** lewat console (inilah yang membuat admin aman):

1. Firebase Console → **Firestore Database → Data → koleksi `users`**
2. Buka dokumen milik `admin` (cari field `username: "admin"`)
3. Ubah field **`role`** dari `guest` menjadi **`admin`** → Save
4. Logout lalu login ulang

## 9. Upload ke GitHub
Upload **seluruh isi folder** (struktur `css/`, `js/` harus dipertahankan) ke repo, lalu tunggu GitHub Pages ter-build.

## Keamanan — hal penting
- Password admin **tidak ada di kode web**; tersimpan terenkripsi di Firebase Auth.
- Hak admin dicek oleh **Firestore Rules di server**, bukan oleh JavaScript, jadi tidak bisa diakali lewat View Source atau DevTools.
- Siapa pun yang membuat akun lewat web **hanya** bisa jadi `guest`; aturan menolak `role: admin` dari web.
- Untuk berjaga-jaga, **ganti password admin** jika sudah pernah dibagikan di tempat umum.

---

## Status Pendaftaran (Verifikasi → Memproses → Online → Diterima)

- Saat form Register terkirim, status otomatis **Verifikasi**.
- Admin mengubah status lewat dropdown di menu **Register → Daftar Pendaftar Masuk**.
- Setiap perubahan dicatat dengan **tanggal, bulan, tahun, dan jam**.
- Pendaftar memantau statusnya sendiri di menu **Register** (progress bar + riwayat).
- Saat admin memilih **Diterima**:
  - waktu penerimaan ditampilkan ke pendaftar,
  - orangnya otomatis masuk daftar **Anggota**,
  - pesan "Selamat, kamu diterima" terkirim otomatis ke menu **Pesan** mereka.
- Status **Diterima** bersifat final (dropdown terkunci) agar tidak salah ubah.

> Setelah update ini, **publish ulang `firestore.rules`** (Firestore → Rules → Publish), karena aturan pendaftar diperketat.
