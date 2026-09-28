import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, addDoc, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;

// Wajib login untuk mendaftar (supaya admin bisa mengirim pesan ke pendaftar)
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }
  currentUser = user;
  const badge = document.getElementById("loggedAs");
  if (badge) badge.textContent = user.email.split("@")[0];
});

// Dipanggil oleh register.js setelah Formspree sukses
window.opaSaveApplication = async (data) => {
  if (!currentUser) return;
  const now = Timestamp.now();
  await addDoc(collection(db, "applications"), {
    ...data,
    uid: currentUser.uid,
    username: currentUser.email.split("@")[0],
    status: "verifikasi",
    // riwayat status: tiap perubahan dicatat dengan waktu (tanggal, bulan, tahun, jam)
    history: [{ status: "verifikasi", at: now }],
    createdAt: serverTimestamp()
  });
};
