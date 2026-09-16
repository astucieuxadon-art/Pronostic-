import { initAuthUI } from "./auth.js";
import { loadTodayAnalysis, renderMatches, renderCombo } from "./matches.js";
import { initPaymentButtons } from "./payment.js";

let currentUser = { loggedIn: false, subscriptionActive: false, uid: null };
let cachedAnalysis = null;

function applyAccessState() {
  const paywall = document.getElementById("paywall");
  if (currentUser.subscriptionActive) {
    paywall.classList.add("hidden");
  } else {
    paywall.classList.remove("hidden");
  }
  if (cachedAnalysis) {
    renderMatches(cachedAnalysis.analyzed, currentUser.subscriptionActive);
  }
}

initAuthUI((state) => {
  currentUser = state;
  applyAccessState();
});

initPaymentButtons(() => currentUser);

loadTodayAnalysis().then(({ analyzed, combo }) => {
  cachedAnalysis = { analyzed, combo };
  renderCombo(combo);
  applyAccessState();
});

// Fiabilité du modèle — à connecter à Firestore une fois l'historique de résultats accumulé
// (voir README.md, section "Suivi de fiabilité"). Valeurs de démonstration en attendant.
document.getElementById("stat-hitrate").textContent = "—";
document.getElementById("stat-combo").textContent = "—";
document.getElementById("stat-count").textContent = "0";
