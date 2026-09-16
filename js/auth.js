import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let modalMode = "login";

const modal = document.getElementById("modal-auth");
const modalTitle = document.getElementById("modal-title");
const modalError = document.getElementById("modal-error");
const emailInput = document.getElementById("input-email");
const passwordInput = document.getElementById("input-password");

export function initAuthUI(onStateChange) {
  document.getElementById("btn-login").onclick = () => openModal("login");
  document.getElementById("btn-signup").onclick = () => openModal("signup");
  document.getElementById("modal-close").onclick = closeModal;
  document.getElementById("btn-logout").onclick = () => signOut(auth);

  document.getElementById("modal-submit").onclick = async () => {
    modalError.textContent = "";
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      modalError.textContent = "Renseigne ton email et ton mot de passe.";
      return;
    }
    try {
      if (modalMode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          subscriptionActive: false,
          subscriptionExpiresAt: null,
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      closeModal();
    } catch (e) {
      modalError.textContent = translateAuthError(e.code);
    }
  };

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      document.getElementById("btn-login").classList.add("hidden");
      document.getElementById("btn-signup").classList.add("hidden");
      document.getElementById("user-box").classList.remove("hidden");
      document.getElementById("user-email").textContent = user.email;

      const snap = await getDoc(doc(db, "users", user.uid));
      const subscriptionActive = snap.exists() && isSubscriptionActive(snap.data());
      onStateChange({ loggedIn: true, subscriptionActive, uid: user.uid });
    } else {
      document.getElementById("btn-login").classList.remove("hidden");
      document.getElementById("btn-signup").classList.remove("hidden");
      document.getElementById("user-box").classList.add("hidden");
      onStateChange({ loggedIn: false, subscriptionActive: false, uid: null });
    }
  });
}

function isSubscriptionActive(userData) {
  if (!userData.subscriptionActive || !userData.subscriptionExpiresAt) return false;
  return new Date(userData.subscriptionExpiresAt) > new Date();
}

function openModal(mode) {
  modalMode = mode;
  modalTitle.textContent = mode === "login" ? "Se connecter" : "Créer un compte";
  modalError.textContent = "";
  modal.classList.remove("hidden");
}
function closeModal() {
  modal.classList.add("hidden");
  emailInput.value = "";
  passwordInput.value = "";
}

function translateAuthError(code) {
  const map = {
    "auth/email-already-in-use": "Cet email est déjà utilisé.",
    "auth/invalid-email": "Adresse email invalide.",
    "auth/weak-password": "Mot de passe trop court (6 caractères minimum).",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/user-not-found": "Aucun compte avec cet email."
  };
  return map[code] || "Une erreur est survenue. Réessaie.";
}
