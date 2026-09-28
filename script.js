// ============================================================
//  NAVIGASI (hotbar, berbasis hash URL)
// ============================================================
const views = document.querySelectorAll(".view");
const navLinks = document.querySelectorAll("[data-nav]");

function showView(name) {
  views.forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
  navLinks.forEach((a) => a.classList.toggle("active", a.dataset.nav === name));
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function routeFromHash() {
  const name = (location.hash || "#home").slice(1);
  const valid = ["home", "anggota", "register"].includes(name) ? name : "home";
  showView(valid);
}

navLinks.forEach((a) => {
  a.addEventListener("click", () => {
    // biarkan hash berubah secara alami, tapi langsung render tanpa menunggu event hashchange
    setTimeout(routeFromHash, 0);
  });
});
window.addEventListener("hashchange", routeFromHash);
routeFromHash();

// ============================================================
//  HOME — render info guild dari members.js
// ============================================================
function renderInfo() {
  const box = document.getElementById("infoCards");
  const items = (typeof GUILD_INFO !== "undefined" ? GUILD_INFO : []);
  if (!items.length) {
    box.innerHTML = `<div class="card"><h3>Belum ada informasi</h3><p>Tambahkan informasi guild lewat file members.js.</p></div>`;
    return;
  }
  box.innerHTML = items.map((it) => `
    <div class="card">
      <h3>${escapeHtml(it.judul)}</h3>
      <p>${escapeHtml(it.isi)}</p>
    </div>`).join("");
}

function renderStats() {
  const members = typeof MEMBERS !== "undefined" ? MEMBERS : [];
  const accepted = members.filter((m) => m.status === "diterima").length;
  document.getElementById("statAccepted").textContent = accepted;

  const stats = typeof GUILD_STATS !== "undefined" ? GUILD_STATS : {};
  document.getElementById("statSlot").textContent = stats.slot || "-";
  document.getElementById("statLevel").textContent = stats.levelGuild || "-";
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str == null ? "" : String(str);
  return d.innerHTML;
}

// ============================================================
//  ANGGOTA — render dari members.js, tab + pencarian
// ============================================================
let currentFilter = "diterima";

function renderMembers() {
  const members = typeof MEMBERS !== "undefined" ? MEMBERS : [];
  const term = document.getElementById("memberSearch").value.trim().toLowerCase();

  const accepted = members.filter((m) => m.status === "diterima");
  const pending = members.filter((m) => m.status === "menunggu");
  document.getElementById("cntAccepted").textContent = accepted.length;
  document.getElementById("cntPending").textContent = pending.length;

  let list = currentFilter === "diterima" ? accepted : pending;
  if (term) {
    list = list.filter((m) =>
      (m.nama || "").toLowerCase().includes(term) || (m.id || "").includes(term));
  }

  const listEl = document.getElementById("memberList");
  const emptyEl = document.getElementById("memberEmpty");

  if (!list.length) {
    listEl.innerHTML = "";
    emptyEl.hidden = false;
    emptyEl.textContent = term ? "Tidak ditemukan." :
      currentFilter === "diterima" ? "Belum ada anggota diterima." : "Tidak ada yang menunggu.";
    return;
  }
  emptyEl.hidden = true;

  listEl.innerHTML = list.map((m, i) => `
    <div class="row">
      <span class="row__num">${String(i + 1).padStart(2, "0")}</span>
      <div class="row__body">
        <div class="row__name">
          ${escapeHtml(m.nama)}
          <span class="badge ${m.jabatan === "Leader" ? "badge--lead" : ""}">${escapeHtml(m.jabatan || "Anggota")}</span>
          <span class="badge ${m.status === "diterima" ? "badge--ok" : "badge--warn"}">${m.status === "diterima" ? "Diterima" : "Menunggu"}</span>
        </div>
        <div class="row__sub">ID: ${escapeHtml(m.id || "-")} &middot; ${escapeHtml(m.tanggal || "-")}</div>
      </div>
    </div>`).join("");
}

document.getElementById("memberTabs").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  document.querySelectorAll("#memberTabs .tabs__btn").forEach((b) =>
    b.classList.toggle("active", b === btn));
  renderMembers();
});
document.getElementById("memberSearch").addEventListener("input", renderMembers);

// ============================================================
//  REGISTER — step flow
// ============================================================
const stepEls = document.querySelectorAll(".step");
const wizardNodes = document.querySelectorAll(".wizard__node");
const wizardLines = document.querySelectorAll(".wizard__line");

function goStep(name) {
  stepEls.forEach((s) => s.classList.toggle("active", s.dataset.step === String(name)));
  const idx = { 1: 0, 2: 1, 3: 2, done: 2 }[name] ?? 0;

  wizardNodes.forEach((node, i) => {
    node.classList.toggle("active", i === idx);
    node.classList.toggle("done", i < idx || name === "done");
  });
  wizardLines.forEach((line, i) => line.classList.toggle("done", i < idx));

  document.getElementById("steps").style.display = name === "done" ? "none" : "flex";
  window.scrollTo({ top: document.querySelector(".view__head")?.offsetTop - 90 || 0, behavior: "smooth" });
}

const agreeCheck = document.getElementById("agreeCheck");
const toStep2Btn = document.getElementById("toStep2");
agreeCheck.addEventListener("change", () => { toStep2Btn.disabled = !agreeCheck.checked; });

toStep2Btn.addEventListener("click", () => goStep(2));
document.getElementById("toStep3").addEventListener("click", () => goStep(3));
document.querySelectorAll("[data-back-step]").forEach((btn) => {
  btn.addEventListener("click", () => goStep(Number(btn.dataset.backStep)));
});

// ============================================================
//  DISCORD conditional field
// ============================================================
const discordField = document.getElementById("discordField");
const discordUsername = document.getElementById("discordUsername");
document.querySelectorAll('input[name="hasDiscord"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.value === "ya" && radio.checked) {
      discordField.classList.add("open");
    } else if (radio.value === "tidak" && radio.checked) {
      discordField.classList.remove("open");
      discordUsername.value = "";
      clearError("discordUsername");
    }
  });
});

// ============================================================
//  VALIDASI FORM
// ============================================================
const form = document.getElementById("regForm");

function showError(field, msg) {
  const input = document.getElementById(field);
  const err = document.querySelector(`[data-error-for="${field}"]`);
  if (input) input.classList.add("invalid");
  if (err) { err.textContent = msg; err.classList.add("show"); }
}
function clearError(field) {
  const input = document.getElementById(field);
  const err = document.querySelector(`[data-error-for="${field}"]`);
  if (input) input.classList.remove("invalid");
  if (err) { err.textContent = ""; err.classList.remove("show"); }
}
function clearAllErrors() {
  form.querySelectorAll(".field__error").forEach((e) => { e.textContent = ""; e.classList.remove("show"); });
  form.querySelectorAll("input.invalid, select.invalid").forEach((e) => e.classList.remove("invalid"));
}

["namaLengkap", "nama", "idGame", "level", "usia", "hp", "email", "waktuCN", "discordUsername"].forEach((id) => {
  const el = document.getElementById(id);
  el.addEventListener("input", () => clearError(id));
  el.addEventListener("change", () => clearError(id));
});
document.querySelectorAll('input[name="gender"]').forEach((r) => r.addEventListener("change", () => clearError("gender")));
document.querySelectorAll('input[name="hasDiscord"]').forEach((r) => r.addEventListener("change", () => clearError("hasDiscord")));

function isValidPhone(value) {
  const cleaned = value.replace(/[\s-]/g, "");
  return [/^08[0-9]{8,11}$/, /^\+628[0-9]{8,11}$/, /^628[0-9]{8,11}$/].some((re) => re.test(cleaned));
}

function validateForm() {
  clearAllErrors();
  let ok = true;

  const val = (id) => document.getElementById(id).value.trim();
  const namaLengkap = val("namaLengkap"), nama = val("nama"), idGame = val("idGame");
  const level = val("level"), usia = val("usia"), hp = val("hp"), email = val("email");
  const waktuCN = val("waktuCN");
  const gender = document.querySelector('input[name="gender"]:checked');
  const hasDiscord = document.querySelector('input[name="hasDiscord"]:checked');

  if (!namaLengkap) { showError("namaLengkap", "Nama lengkap wajib diisi."); ok = false; }
  if (!nama) { showError("nama", "Nama in-game wajib diisi."); ok = false; }

  if (!idGame) { showError("idGame", "ID Free Fire wajib diisi."); ok = false; }
  else if (!/^[0-9]{6,12}$/.test(idGame)) { showError("idGame", "ID harus angka 6-12 digit."); ok = false; }

  if (!gender) { showError("gender", "Pilih salah satu."); ok = false; }

  if (!level) { showError("level", "Level akun wajib diisi."); ok = false; }
  else if (Number(level) < 40) { showError("level", "Minimum level akun adalah 40."); ok = false; }

  if (!waktuCN) { showError("waktuCN", "Pilih waktu CN."); ok = false; }

  if (!usia) { showError("usia", "Usia wajib diisi."); ok = false; }
  else if (Number(usia) < 18) { showError("usia", "Usia minimum adalah 18 tahun."); ok = false; }

  if (!hp) { showError("hp", "Nomor HP/WA wajib diisi."); ok = false; }
  else if (!isValidPhone(hp)) { showError("hp", "Format tidak valid. Contoh: 081234567890"); ok = false; }

  if (!email) { showError("email", "Email wajib diisi."); ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError("email", "Format email tidak valid."); ok = false; }

  if (!hasDiscord) { showError("hasDiscord", "Pilih salah satu."); ok = false; }
  else if (hasDiscord.value === "ya" && !val("discordUsername")) {
    showError("discordUsername", "Username Discord wajib diisi."); ok = false;
  }

  return ok;
}

// ============================================================
//  SUBMIT — kirim ke Formspree, lalu tampilkan ringkasan + format CN
// ============================================================
const btnSubmit = document.getElementById("btnSubmit");
const formAlert = document.getElementById("formAlert");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) {
    const firstInvalid = form.querySelector(".invalid, [data-error-for].show");
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  formAlert.classList.remove("show");
  btnSubmit.disabled = true;
  btnSubmit.querySelector("span").textContent = "Mengirim...";

  const data = {
    namaLengkap: document.getElementById("namaLengkap").value.trim(),
    nama: document.getElementById("nama").value.trim(),
    idGame: document.getElementById("idGame").value.trim(),
    gender: document.querySelector('input[name="gender"]:checked').value,
    level: document.getElementById("level").value.trim(),
    waktuCN: document.getElementById("waktuCN").value,
    usia: document.getElementById("usia").value.trim(),
    hp: document.getElementById("hp").value.trim(),
    email: document.getElementById("email").value.trim(),
    hasDiscord: document.querySelector('input[name="hasDiscord"]:checked').value,
    discordUsername: discordUsername.value.trim()
  };

  try {
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error("Gagal mengirim");

    showDone(data);
    form.reset();
    discordField.classList.remove("open");
    toStep2Btn.disabled = true;
  } catch (err) {
    formAlert.textContent = "Gagal mengirim pendaftaran. Cek koneksi internet kamu dan coba lagi.";
    formAlert.classList.add("show");
  }

  btnSubmit.disabled = false;
  btnSubmit.querySelector("span").textContent = "Kirim Pendaftaran";
});

function showDone(data) {
  const rows = [
    ["Nama lengkap", data.namaLengkap], ["Nama in-game", data.nama], ["ID Free Fire", data.idGame],
    ["Gender", data.gender], ["Level akun", data.level], ["Waktu CN", data.waktuCN],
    ["Usia", data.usia], ["No. HP/WA", data.hp], ["Email", data.email],
    ["Discord", data.hasDiscord === "ya" ? data.discordUsername : "Tidak punya"]
  ];
  document.getElementById("summaryBox").innerHTML = rows.map(([l, v]) =>
    `<div class="summary__row"><span>${l}</span><span>${escapeHtml(v || "-")}</span></div>`).join("");

  const prefix = data.gender === "Perempuan" ? "OMA" : "OPA";
  const format = `${prefix} • ${data.nama}`;
  document.getElementById("cnLabel").textContent =
    `Format Change Nickname (${data.gender === "Perempuan" ? "Perempuan" : "Laki-laki"})`;
  document.getElementById("cnValue").textContent = format;

  goStep("done");
}

document.getElementById("btnCopyCN").addEventListener("click", async () => {
  const text = document.getElementById("cnValue").textContent;
  const btn = document.getElementById("btnCopyCN");
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const temp = document.createElement("textarea");
    temp.value = text; temp.style.position = "fixed"; temp.style.opacity = "0";
    document.body.appendChild(temp); temp.select();
    document.execCommand("copy"); document.body.removeChild(temp);
  }
  btn.classList.add("copied");
  btn.querySelector("span").textContent = "Tersalin!";
  setTimeout(() => { btn.classList.remove("copied"); btn.querySelector("span").textContent = "Salin format"; }, 1800);
});

// ============================================================
//  INIT
// ============================================================
renderInfo();
renderStats();
renderMembers();
