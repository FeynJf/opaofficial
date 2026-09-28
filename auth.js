import { auth, db, isConfigured, usernameToEmail } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const alertError = $("alertError");
const alertOk = $("alertOk");
const alertConfig = $("alertConfig");

// ---------- helpers ----------
function showError(msg) {
  alertOk.classList.remove("show");
  alertError.textContent = msg;
  alertError.classList.add("show");
}
function showOk(msg) {
  alertError.classList.remove("show");
  alertOk.textContent = msg;
  alertOk.classList.add("show");
}
function clearAlerts() {
  alertError.classList.remove("show");
  alertOk.classList.remove("show");
}
function setLoading(btn, loading, label) {
  btn.disabled = loading;
  btn.querySelector("span").textContent = loading ? "Memproses..." : label;
}

function friendlyError(err) {
  switch (err.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Username atau password salah.";
    case "auth/email-already-in-use":
      return "Username sudah dipakai. Coba username lain.";
    case "auth/weak-password":
      return "Password terlalu lemah. Minimal 6 karakter.";
    case "auth/too-many-requests":
      return "Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.";
    case "auth/network-request-failed":
      return "Koneksi bermasalah. Cek internet kamu.";
    case "auth/operation-not-allowed":
      return "Login Email/Password belum diaktifkan di Firebase Console.";
    default:
      return "Terjadi kesalahan. Coba lagi. (" + (err.code || err.message) + ")";
  }
}

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,20}$/;

// ---------- tabs ----------
function switchTab(name) {
  clearAlerts();
  document.querySelectorAll(".tabs__btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".login__form").forEach((f) =>
    f.classList.toggle("active", f.dataset.panel === name));
}
document.querySelectorAll(".tabs__btn").forEach((b) =>
  b.addEventListener("click", () => switchTab(b.dataset.tab)));
document.querySelectorAll("[data-goto]").forEach((a) =>
  a.addEventListener("click", (e) => { e.preventDefault(); switchTab(a.dataset.goto); }));

// ---------- show/hide password ----------
document.querySelectorAll(".pass-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = $(btn.dataset.toggle);
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.textContent = show ? "Sembunyi" : "Lihat";
  });
});

// ---------- config guard ----------
if (!isConfigured) {
  alertConfig.classList.add("show");
}

// ---------- redirect if already logged in ----------
onAuthStateChanged(auth, (user) => {
  if (user) window.location.replace("app.html");
});

// ---------- LOGIN ----------
$("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAlerts();
  if (!isConfigured) return showError("Firebase belum dikonfigurasi.");

  const username = $("loginUser").value.trim();
  const password = $("loginPass").value;
  if (!username || !password) return showError("Username dan password wajib diisi.");

  const btn = $("btnLogin");
  setLoading(btn, true, "Login");
  try {
    await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
    window.location.replace("app.html");
  } catch (err) {
    showError(friendlyError(err));
    setLoading(btn, false, "Login");
  }
});

// ---------- CREATE ACCOUNT ----------
$("formSignup").addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAlerts();
  if (!isConfigured) return showError("Firebase belum dikonfigurasi.");

  const username = $("signUser").value.trim();
  const pass = $("signPass").value;
  const pass2 = $("signPass2").value;

  if (!USERNAME_RE.test(username))
    return showError("Username 3-20 karakter, hanya huruf, angka, titik, atau underscore.");
  if (pass.length < 6) return showError("Password minimal 6 karakter.");
  if (pass !== pass2) return showError("Konfirmasi password tidak cocok.");

  const btn = $("btnSignup");
  setLoading(btn, true, "Buat Akun");
  try {
    const cred = await createUserWithEmailAndPassword(auth, usernameToEmail(username), pass);

    // Profil baru SELALU role "guest". Role admin hanya bisa diberikan
    // lewat Firebase Console, dan aturan Firestore menolak upaya mengubahnya dari web.
    await setDoc(doc(db, "users", cred.user.uid), {
      username,
      usernameLower: username.toLowerCase(),
      role: "guest",
      createdAt: serverTimestamp()
    });

    window.location.replace("app.html");
  } catch (err) {
    showError(friendlyError(err));
    setLoading(btn, false, "Buat Akun");
  }
});
