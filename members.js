// ============================================================
//  DATA GUILD OPA OFFICIAL
//  File ini satu-satunya yang perlu kamu edit untuk mengubah
//  informasi guild dan daftar anggota. Simpan lalu upload ulang.
// ============================================================

// ---------- INFORMASI GUILD (halaman Home) ----------
// Tiap item = satu kartu di Home. Tambah/hapus/ubah sesukamu.
const GUILD_INFO = [
  {
    judul: "Tentang OPA OFFICIAL",
    isi: "Welcome to family OPA! Yang mau masuk guild kami, silahkan klik Daftar Sekarang buat jadi bagian dari kami. Baca baik-baik rules dan peraturannya yah 😁🙏"
  },
  {
    judul: "Jadwal War & Turnamen",
    isi: "Guild War — buat menaikkan peringkat leaderboard guild dan level guild kita.\nJadwal: Rabu, Kamis, Jumat.\nUntuk detail jam bakalan ditulis langsung sama admin lewat grup.\n\nTurnamen — kalau guild sudah mulai ramai, admin bakalan segera membuka turnamen berhadiah khusus guild. 1x3 minggu, setiap minggu."
  },
  {
    judul: "Pengumuman",
    isi: "Guild ini tidak memandang player, yang penting berbaur sesama anggota lain, siap membuat tim dengan anggota guild, dan mematuhi peraturan yang diterapkan admin/leader."
  }
];

// ---------- STATISTIK (angka di Home) ----------
// Kosongkan ("") kalau mau dihitung otomatis dari daftar anggota.
const GUILD_STATS = {
  levelGuild: "1",     // level guild
  slot: "50"           // total slot anggota
};

// ---------- DAFTAR ANGGOTA ----------
// status: "diterima"  -> tampil di tab "Diterima"
//         "menunggu"  -> tampil di tab "Belum diterima"
// jabatan: "Leader", "Officer", "Admin", "Elite", atau "Anggota"
// tanggal: tanggal diterima / mendaftar (bebas ditulis, contoh "28 September 2026, 14:05")
const MEMBERS = [
  {
    nama: "OPA • Maboo",
    id: "2131775171",
    jabatan: "Leader",
    status: "diterima",
    tanggal: "30 September 2026, 16:00"
  },
  {
    nama: "OPA • Feyn",
    id: "2377250071",
    jabatan: "Officer",
    status: "diterima",
    tanggal: "30 September 2026, 16:00"
  },
  {
    nama: "OPA • Pongo乂",
    id: "7424126835",
    jabatan: "Officer",
    status: "diterima",
    tanggal: "30 September 2026, 16:00"
  },
  {
    nama: "OPA • Nox_",
    id: "1854311224",
    jabatan: "Anggota",
    status: "diterima",
    tanggal: "30 September 2026, 16:00"
  }
];
