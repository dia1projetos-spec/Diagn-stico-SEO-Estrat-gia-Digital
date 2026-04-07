// js/firebase-config.js
// Cole aqui suas credenciais do Firebase

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seoestrategia.firebaseapp.com",
  projectId: "seoestrategia",
  storageBucket: "seoestrategia.firebasestorage.app",
  messagingSenderId: "775902232954",
  appId: "SUA_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
