const PAYMENT_ENDPOINT = "https://REGION-TON_PROJET.cloudfunctions.net/initiatePayment";

export function initPaymentButtons(getCurrentUser) {
  document.querySelectorAll(".btn-pay").forEach(btn => {
    btn.addEventListener("click", async () => {
      const user = getCurrentUser();
      if (!user || !user.loggedIn) {
        document.getElementById("btn-login").click();
        return;
      }

      const method = btn.dataset.method;
      const phone = window.prompt(
        method === "orange"
          ? "Numéro Orange Money (ex: 6XXXXXXXX) :"
          : "Numéro MTN Mobile Money (ex: 6XXXXXXXX) :"
      );
      if (!phone) return;

      const statusEl = document.getElementById("pay-status");
      statusEl.textContent = "Demande de paiement envoyée — valide sur ton téléphone…";

      try {
        const res = await fetch(PAYMENT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, method, phone, amount: 2000 })
        });
        const data = await res.json();

        if (data.success) {
          statusEl.textContent = "Paiement confirmé — abonnement activé ✅";
          setTimeout(() => window.location.reload(), 1500);
        } else {
          statusEl.textContent = "Paiement non confirmé : " + (data.message || "réessaie.");
        }
      } catch (e) {
        statusEl.textContent = "Erreur de connexion au service de paiement. Réessaie.";
      }
    });
  });
}
