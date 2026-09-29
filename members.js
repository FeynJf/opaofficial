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
    isi: "OPA OFFICIAL adalah guild Free Fire yang solid, siap perang, dan siap juara. Tulis penjelasan guild kamu di sini."
  },
  {
    judul: "Jadwal War & Turnamen",
    isi: "Belum ada jadwal. Tulis jadwal war / turnamen guild di sini."
  },
  {
    judul: "Pengumuman",
    isi: "Belum ada pengumuman. Tulis pengumuman terbaru di sini."
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
// jabatan: "Leader", "Admin", "Elite", atau "Anggota"
// tanggal: tanggal diterima / mendaftar (bebas ditulis, contoh "28 September 2026, 14:05")
const MEMBERS = [
  {
    nama: "OPA • Mᴀʙᴏᴏ",
    id: "123456789",
    jabatan: "LEADER",
    status: "diterima",
    tanggal: "20 September 2026, 14:05"
  },
  {
    nama: "OPA • Ŧeyͷ",
    id: "987654321",
    jabatan: "OFFICER",
    status: "diterima",
    tanggal: "20 September 2026, 15:30"
  },
  {
    nama: "OPA • Nox",
    id: "111222333",
    jabatan: "Anggota",
    status: "diterima",
    tanggal: "28 September 2026, 16:10"
  },
  {
    nama: "OPA • Nox",
    id: "111222333",
    jabatan: "Anggota",
    status: "diterima",
    tanggal: "28 September 2026, 16:10"
  }
];
