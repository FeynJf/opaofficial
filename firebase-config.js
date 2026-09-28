// ============================================================
//  FIREBASE CONFIG
//  Ganti nilai di bawah dengan config dari Firebase Console:
//  Project settings → General → Your apps → Web app → SDK setup
//  (Config ini AMAN ditaruh di kode web, bukan rahasia.
//   Yang menjaga data adalah firestore.rules.)
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "GANTI_API_KEY",
  authDomain: "GANTI_PROJECT_ID.firebaseapp.com",
  projectId: "GANTI_PROJECT_ID",
  storageBucket: "GANTI_PROJECT_ID.appspot.com",
  messagingSenderId: "GANTI_SENDER_ID",
  appId: "GANTI_APP_ID"
};

export const isConfigured = !firebaseConfig.apiKey.startsWith("GANTI");

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firebase Auth butuh format email; username diubah otomatis di belakang layar
export const USERNAME_DOMAIN = "opaofficial.app";
export const usernameToEmail = (username) =>
  `${username.trim().toLowerCase()}@${USERNAME_DOMAIN}`;
