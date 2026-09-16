import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgq5zyCbJlLrVGjWuQzzrPF0R_1kAxZaw",
  authDomain: "pronostics-ia.firebaseapp.com",
  databaseURL: "https://pronostics-ia-default-rtdb.firebaseio.com",
  projectId: "pronostics-ia",
  storageBucket: "pronostics-ia.firebasestorage.app",
  messagingSenderId: "975795087260",
  appId: "1:975795087260:web:269582273264a9d19e0a59"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
