import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, onSnapshot, getDocs, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
};

let currentUser = null;   // firebase user
let profile = null;       // { username, role }
let isAdmin = false;
const unsubs = [];        // realtime listeners to clean up

// ============================================================
//  AUTH GUARD
// ============================================================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }
  currentUser = user;

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    profile = snap.exists()
      ? snap.data()
      : { username: user.email.split("@")[0], role: "guest" };
  } catch (err) {
    console.error(err);
    profile = { username: user.email.split("@")[0], role: "guest" };
  }

  isAdmin = profile.role === "admin";
  initUI();
  $("boot").style.display = "none";
  $("shell").hidden = false;
});

// ============================================================
//  UI INIT
// ============================================================
function initUI() {
  $("userName").textContent = profile.username;
  $("userAvatar").textContent = profile.username.charAt(0).toUpperCase();
  const roleEl = $("userRole");
  roleEl.textContent = profile.role;
  roleEl.className = "badge " + (isAdmin ? "badge--admin" : "badge--guest");

  // Fitur khusus admin
  // Kartu "Pendaftar" hanya bermakna untuk admin (guest tidak boleh membaca semua pendaftar)
  if (!isAdmin) { const c = $("statApps").closest(".stat"); if (c) c.hidden = true; }

  $("btnEditInfo").hidden = !isAdmin;
  $("btnAddMember").hidden = !isAdmin;
  $("composeBox").hidden = !isAdmin;
  $("appsPanel").hidden = !isAdmin;
  $("membersSub").textContent = isAdmin
    ? "Kelola anggota guild langsung dari sini."
    : "Daftar anggota guild.";
  $("msgSub").textContent = isAdmin
    ? "Kirim pesan ke pendaftar dan lihat riwayat pesan."
    : "Pesan dari admin guild untuk kamu.";

  bindNav();
  listenGuildInfo();
  listenMembers();
  listenMessages();
  if (isAdmin) listenApplications();
  else listenMyApplication();
}

$("btnLogout").addEventListener("click", async () => {
  unsubs.forEach((u) => u());
  await signOut(auth);
  window.location.replace("index.html");
});

// ============================================================
//  NAVIGATION
// ============================================================
function bindNav() {
  document.querySelectorAll(".nav__item").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });
}
function showView(name) {
  document.querySelectorAll(".nav__item").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === name));
  document.querySelectorAll(".view").forEach((v) =>
    v.classList.toggle("active", v.id === "view-" + name));
  window.scrollTo({ top: 0 });
}

// ============================================================
//  HOME — informasi guild
// ============================================================
function listenGuildInfo() {
  const ref = doc(db, "guild", "info");
  unsubs.push(onSnapshot(ref, (snap) => {
    const text = snap.exists() ? (snap.data().text || "").trim() : "";
    const el = $("infoBody");
    if (text) {
      el.textContent = text;
      el.classList.remove("placeholder");
    } else {
      el.textContent = isAdmin
        ? "Belum ada informasi. Klik tombol Edit untuk menulis informasi guild."
        : "Informasi guild akan segera diperbarui oleh admin.";
      el.classList.add("placeholder");
    }
  }, (err) => {
    console.error(err);
    $("infoBody").textContent = "Gagal memuat informasi guild.";
  }));
}

$("btnEditInfo").addEventListener("click", () => {
  const el = $("infoBody");
  $("infoText").value = el.classList.contains("placeholder") ? "" : el.textContent;
  el.hidden = true;
  $("infoEdit").hidden = false;
  $("btnEditInfo").hidden = true;
});
function closeInfoEdit() {
  $("infoBody").hidden = false;
  $("infoEdit").hidden = true;
  $("btnEditInfo").hidden = !isAdmin;
}
$("btnCancelInfo").addEventListener("click", closeInfoEdit);
$("btnSaveInfo").addEventListener("click", async () => {
  const btn = $("btnSaveInfo");
  btn.disabled = true;
  try {
    await setDoc(doc(db, "guild", "info"), {
      text: $("infoText").value,
      updatedAt: serverTimestamp(),
      updatedBy: profile.username
    });
    closeInfoEdit();
  } catch (err) {
    alert("Gagal menyimpan: " + err.message);
  }
  btn.disabled = false;
});

// ============================================================
//  ANGGOTA
// ============================================================
let allMembers = [];
let editingMemberId = null;

function listenMembers() {
  const q = query(collection(db, "members"), orderBy("createdAt", "asc"));
  unsubs.push(onSnapshot(q, (snap) => {
    allMembers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    $("statMembers").textContent = allMembers.length;
    renderMembers();
  }, (err) => {
    console.error(err);
    $("memberEmpty").textContent = "Gagal memuat anggota.";
    $("memberEmpty").hidden = false;
  }));
}

function renderMembers() {
  const term = $("memberSearch").value.trim().toLowerCase();
  const list = allMembers.filter((m) =>
    !term || (m.name || "").toLowerCase().includes(term) || (m.ffId || "").includes(term));

  $("memberEmpty").textContent = allMembers.length ? "Anggota tidak ditemukan." : "Belum ada anggota.";
  $("memberEmpty").hidden = list.length > 0;

  $("memberList").innerHTML = list.map((m, i) => `
    <div class="row">
      <span class="row__num">${String(i + 1).padStart(2, "0")}</span>
      <div class="row__body">
        <div class="row__title">${esc(m.name)} <span class="badge">${esc(m.role || "Anggota")}</span></div>
        <div class="row__sub">ID: ${esc(m.ffId || "-")}</div>
      </div>
      ${isAdmin ? `
      <div class="row__actions">
        <button class="btn btn--outline btn--sm" data-edit="${m.id}">Edit</button>
        <button class="btn btn--danger btn--sm" data-del="${m.id}">Hapus</button>
      </div>` : ""}
    </div>`).join("");
}
$("memberSearch").addEventListener("input", renderMembers);

$("memberList").addEventListener("click", async (e) => {
  const editId = e.target.dataset.edit;
  const delId = e.target.dataset.del;
  if (editId) openMemberModal(allMembers.find((m) => m.id === editId));
  if (delId) {
    const m = allMembers.find((x) => x.id === delId);
    if (confirm(`Hapus anggota "${m.name}"?`)) {
      try { await deleteDoc(doc(db, "members", delId)); }
      catch (err) { alert("Gagal menghapus: " + err.message); }
    }
  }
});

function openMemberModal(member) {
  editingMemberId = member ? member.id : null;
  $("memberModalTitle").textContent = member ? "Edit Anggota" : "Tambah Anggota";
  $("mName").value = member ? member.name : "";
  $("mId").value = member ? (member.ffId || "") : "";
  $("mRole").value = member ? (member.role || "Anggota") : "Anggota";
  $("mError").classList.remove("show");
  $("memberModal").hidden = false;
}
$("btnAddMember").addEventListener("click", () => openMemberModal(null));
$("mCancel").addEventListener("click", () => { $("memberModal").hidden = true; });
$("memberModal").addEventListener("click", (e) => {
  if (e.target === $("memberModal")) $("memberModal").hidden = true;
});

$("mSave").addEventListener("click", async () => {
  const name = $("mName").value.trim();
  const ffId = $("mId").value.trim();
  const role = $("mRole").value;
  const err = $("mError");

  if (!name) { err.textContent = "Nama in-game wajib diisi."; err.classList.add("show"); return; }
  if (ffId && !/^[0-9]{6,12}$/.test(ffId)) {
    err.textContent = "ID Free Fire harus angka 6-12 digit."; err.classList.add("show"); return;
  }

  $("mSave").disabled = true;
  try {
    if (editingMemberId) {
      await updateDoc(doc(db, "members", editingMemberId), { name, ffId, role });
    } else {
      await addDoc(collection(db, "members"), { name, ffId, role, createdAt: serverTimestamp() });
    }
    $("memberModal").hidden = true;
  } catch (e) {
    err.textContent = "Gagal menyimpan: " + e.message;
    err.classList.add("show");
  }
  $("mSave").disabled = false;
});

// ============================================================
//  PESAN
// ============================================================
function fmtDate(ts) {
  if (!ts || !ts.toDate) return "";
  return ts.toDate().toLocaleString("id-ID", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  });
}

function listenMessages() {
  // Admin melihat semua pesan; user hanya pesan miliknya
  const base = collection(db, "messages");
  const q = isAdmin
    ? query(base, orderBy("createdAt", "desc"))
    : query(base, where("toUid", "==", currentUser.uid));

  unsubs.push(onSnapshot(q, (snap) => {
    let msgs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // user biasa: urutkan di sisi klien (menghindari kebutuhan composite index)
    if (!isAdmin) {
      msgs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }
    renderMessages(msgs);

    const unread = isAdmin ? 0 : msgs.filter((m) => !m.read).length;
    $("msgDot").hidden = unread === 0;
    $("statUnread").textContent = unread;
  }, (err) => {
    console.error(err);
    $("messageEmpty").textContent = "Gagal memuat pesan.";
    $("messageEmpty").hidden = false;
  }));
}

function renderMessages(msgs) {
  $("messageEmpty").textContent = "Belum ada pesan.";
  $("messageEmpty").hidden = msgs.length > 0;
  $("messageList").innerHTML = msgs.map((m) => `
    <div class="row row--msg ${!isAdmin && !m.read ? "row--unread" : ""}">
      <div class="row__body">
        <div class="row__title">
          ${isAdmin ? "Ke: " + esc(m.toUsername) : "Dari: " + esc(m.fromUsername || "Admin")}
          ${!isAdmin && !m.read ? '<span class="badge badge--danger">Baru</span>' : ""}
          ${isAdmin ? `<span class="badge ${m.read ? "badge--ok" : "badge--warn"}">${m.read ? "Dibaca" : "Belum dibaca"}</span>` : ""}
        </div>
        <div class="row__text">${esc(m.body)}</div>
        <div class="row__sub">${esc(fmtDate(m.createdAt))}</div>
      </div>
      <div class="row__actions">
        ${!isAdmin && !m.read ? `<button class="btn btn--outline btn--sm" data-read="${m.id}">Tandai dibaca</button>` : ""}
        ${isAdmin ? `<button class="btn btn--danger btn--sm" data-delmsg="${m.id}">Hapus</button>` : ""}
      </div>
    </div>`).join("");
}

$("messageList").addEventListener("click", async (e) => {
  const readId = e.target.dataset.read;
  const delId = e.target.dataset.delmsg;
  try {
    if (readId) await updateDoc(doc(db, "messages", readId), { read: true });
    if (delId && confirm("Hapus pesan ini?")) await deleteDoc(doc(db, "messages", delId));
  } catch (err) { alert("Gagal: " + err.message); }
});

$("btnSendMsg").addEventListener("click", async () => {
  const toName = $("msgTo").value.trim();
  const body = $("msgBody").value.trim();
  const err = $("msgError");
  err.classList.remove("show");

  if (!toName || !body) { err.textContent = "Username penerima dan isi pesan wajib diisi."; err.classList.add("show"); return; }

  $("btnSendMsg").disabled = true;
  try {
    // cari uid penerima lewat username
    const found = await getDocs(query(
      collection(db, "users"), where("usernameLower", "==", toName.toLowerCase())));
    if (found.empty) {
      err.textContent = `User "${toName}" tidak ditemukan.`;
      err.classList.add("show");
    } else {
      const target = found.docs[0];
      await addDoc(collection(db, "messages"), {
        toUid: target.id,
        toUsername: target.data().username,
        fromUsername: profile.username,
        body,
        read: false,
        createdAt: serverTimestamp()
      });
      $("msgTo").value = "";
      $("msgBody").value = "";
    }
  } catch (e) {
    err.textContent = "Gagal mengirim: " + e.message;
    err.classList.add("show");
  }
  $("btnSendMsg").disabled = false;
});

// ============================================================
//  REGISTER — status pendaftaran
// ============================================================
const STATUS_FLOW = ["verifikasi", "memproses", "online", "diterima"];
const STATUS_LABEL = {
  verifikasi: "Verifikasi",
  memproses: "Memproses",
  online: "Online",
  diterima: "Diterima"
};
const STATUS_DESC = {
  verifikasi: "Pendaftaran kamu sudah masuk dan sedang diverifikasi oleh admin.",
  memproses: "Data kamu sedang diproses oleh admin guild.",
  online: "Admin sedang online dan akan segera menghubungi kamu. Pastikan WhatsApp aktif.",
  diterima: "Selamat! Kamu resmi diterima sebagai anggota OPA OFFICIAL."
};
const STATUS_BADGE = {
  verifikasi: "badge--warn",
  memproses: "badge--warn",
  online: "",
  diterima: "badge--ok"
};

// Format lengkap: tanggal / bulan / tahun / jam
function fmtFull(ts) {
  if (!ts || !ts.toDate) return "-";
  const d = ts.toDate();
  const tgl = d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).replace(".", ":");
  return `${tgl}, ${jam} WIB`;
}

function statusOf(a) { return STATUS_FLOW.includes(a.status) ? a.status : "verifikasi"; }

function renderTrack(status) {
  const cur = STATUS_FLOW.indexOf(status);
  return `<div class="track">${STATUS_FLOW.map((st, i) => {
    const cls = i < cur ? "done" : i === cur ? "current" + (st === "diterima" ? " is-final" : "") : "";
    return `<div class="track__step ${cls}"><span class="track__label">${STATUS_LABEL[st]}</span></div>`;
  }).join("")}</div>`;
}

function renderTimeline(history) {
  const items = (history || []).slice().reverse();
  if (!items.length) return "";
  return `<div class="timeline">${items.map((h, i) => `
    <div class="timeline__item ${i === 0 ? "latest" : ""}">
      <div>
        <div class="timeline__status">${esc(STATUS_LABEL[h.status] || h.status)}</div>
        <div class="timeline__time">${esc(fmtFull(h.at))}</div>
      </div>
    </div>`).join("")}</div>`;
}

// ---------- Tampilan untuk pendaftar (guest): pantau status sendiri ----------
function listenMyApplication() {
  const q = query(collection(db, "applications"), where("uid", "==", currentUser.uid));
  unsubs.push(onSnapshot(q, (snap) => {
    const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    const panel = $("myStatusPanel");

    if (!apps.length) { panel.hidden = true; $("registerCta").hidden = false; return; }

    const a = apps[0];
    const st = statusOf(a);
    const accepted = (a.history || []).slice().reverse().find((h) => h.status === "diterima");

    panel.hidden = false;
    $("registerCta").hidden = true; // sudah daftar, sembunyikan ajakan
    $("myStatusBody").innerHTML = `
      <div class="status-now">
        <span class="status-now__text">${esc(STATUS_LABEL[st])}</span>
        <span class="badge ${STATUS_BADGE[st]}">Status akun</span>
      </div>
      <p class="status-desc">${esc(STATUS_DESC[st])}</p>
      ${renderTrack(st)}
      ${st === "diterima" && accepted ? `
        <div class="accepted-box">
          <strong>Diterima pada</strong>
          <span>${esc(fmtFull(accepted.at))}</span>
        </div>` : ""}
      <h4 class="sub-h">Riwayat</h4>
      ${renderTimeline(a.history)}
    `;
  }, (err) => console.error(err)));
}

// ---------- Tampilan untuk admin: kelola semua pendaftar ----------
function listenApplications() {
  const q = query(collection(db, "applications"), orderBy("createdAt", "desc"));
  unsubs.push(onSnapshot(q, (snap) => {
    const apps = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    $("statApps").textContent = apps.length;
    $("appEmpty").hidden = apps.length > 0;
    $("appList").innerHTML = apps.map((a, i) => {
      const st = statusOf(a);
      const last = (a.history || [])[(a.history || []).length - 1];
      return `
      <div class="row row--msg">
        <span class="row__num">${String(i + 1).padStart(2, "0")}</span>
        <div class="row__body">
          <div class="row__title">
            ${esc(a.nama)}
            <span class="badge ${STATUS_BADGE[st]}">${esc(STATUS_LABEL[st])}</span>
            <span class="badge">CN: ${esc(a.waktuCN || "-")}</span>
          </div>
          <div class="row__sub">
            ${esc(a.namaLengkap)} · ${esc(a.gender)} · Lv ${esc(a.level)} · ID ${esc(a.idGame)}<br>
            WA: ${esc(a.hp)} · ${esc(a.email)}
            ${a.hasDiscord === "ya" ? " · Discord: " + esc(a.discordUsername) : ""}<br>
            Akun: ${esc(a.username || "-")} · Update terakhir: ${esc(fmtFull(last && last.at))}
          </div>
        </div>
        <div class="row__col">
          <select class="status-select" data-status="${a.id}" ${st === "diterima" ? "disabled" : ""}>
            ${STATUS_FLOW.map((s) => `<option value="${s}" ${s === st ? "selected" : ""}>${STATUS_LABEL[s]}</option>`).join("")}
          </select>
          <button class="btn btn--danger btn--sm" data-delapp="${a.id}">Hapus</button>
        </div>
      </div>`;
    }).join("");
    window.__apps = apps;
  }, (err) => console.error(err)));
}

// Admin mengubah status lewat dropdown
$("appList").addEventListener("change", async (e) => {
  const id = e.target.dataset.status;
  if (!id) return;
  const apps = window.__apps || [];
  const a = apps.find((x) => x.id === id);
  const newStatus = e.target.value;
  if (!a || newStatus === statusOf(a)) return;

  if (newStatus === "diterima" &&
      !confirm(`Terima "${a.nama}" sebagai anggota guild? Status tidak bisa diubah lagi setelah ini.`)) {
    e.target.value = statusOf(a);
    return;
  }

  e.target.disabled = true;
  try {
    const now = Timestamp.now();
    await updateDoc(doc(db, "applications", id), {
      status: newStatus,
      history: [...(a.history || []), { status: newStatus, at: now }]
    });

    // Diterima: otomatis masuk daftar Anggota + kirim pesan notifikasi
    if (newStatus === "diterima") {
      await addDoc(collection(db, "members"), {
        name: a.nama, ffId: a.idGame, role: "Anggota",
        acceptedAt: now, createdAt: serverTimestamp()
      });
      if (a.uid) {
        await addDoc(collection(db, "messages"), {
          toUid: a.uid,
          toUsername: a.username || a.nama,
          fromUsername: profile.username,
          body: `Selamat ${a.nama}! Pendaftaran kamu DITERIMA. Kamu resmi menjadi anggota OPA OFFICIAL pada ${fmtFull(now)}.`,
          read: false,
          createdAt: serverTimestamp()
        });
      }
    }
  } catch (err) {
    alert("Gagal mengubah status: " + err.message);
    e.target.value = statusOf(a);
  }
  e.target.disabled = false;
});

$("appList").addEventListener("click", async (e) => {
  const delId = e.target.dataset.delapp;
  if (delId && confirm("Hapus pendaftar ini?")) {
    try { await deleteDoc(doc(db, "applications", delId)); }
    catch (err) { alert("Gagal: " + err.message); }
  }
});
