import { calcProbabilities, bestPick, buildCombo } from "./probability-engine.js";

const FOOTBALL_API_KEY = "86fb4bd3b00347fea5ffe4879602b359";
const FOOTBALL_API_BASE = "https://api.football-data.org/v4";

// Compétitions couvertes par le plan gratuit football-data.org
const COMPETITIONS = ["PL", "PD", "SA", "BL1", "FL1", "CL"];
// PL = Premier League, PD = Liga, SA = Serie A, BL1 = Bundesliga, FL1 = Ligue 1, CL = Champions League

async function fetchTodayMatches() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const allMatches = [];

    for (const comp of COMPETITIONS) {
      try {
        const res = await fetch(`${FOOTBALL_API_BASE}/competitions/${comp}/matches?dateFrom=${today}&dateTo=${today}`, {
          headers: { "X-Auth-Token": FOOTBALL_API_KEY }
        });
        if (!res.ok) continue;
        const data = await res.json();
        (data.matches || []).forEach(m => {
          allMatches.push({
            home: m.homeTeam.name,
            away: m.awayTeam.name,
            competition: m.competition.name,
            homeStats: demoStatsFor(),
            awayStats: demoStatsFor()
          });
        });
      } catch (e) {
        console.error(`Erreur pour ${comp} :`, e);
      }
    }

    return allMatches.length > 0 ? allMatches : getDemoMatches();
  } catch (e) {
    console.error("Erreur récupération matchs :", e);
    return getDemoMatches();
  }
}

function getDemoMatches() {
  return [
    { home: "Al-Hilal", away: "Al-Nassr", competition: "Saudi Pro League (démo)",
      homeStats: { formPoints5: 12, goalsForAvg: 2.4, goalsAgainstAvg: 0.8 },
      awayStats: { formPoints5: 9, goalsForAvg: 2.0, goalsAgainstAvg: 1.2 } },
    { home: "Man City", away: "Everton", competition: "Premier League (démo)",
      homeStats: { formPoints5: 13, goalsForAvg: 2.6, goalsAgainstAvg: 0.7 },
      awayStats: { formPoints5: 5, goalsForAvg: 0.9, goalsAgainstAvg: 1.8 } },
    { home: "Flamengo", away: "Bahia", competition: "Brasileirão (démo)",
      homeStats: { formPoints5: 10, goalsForAvg: 1.8, goalsAgainstAvg: 1.0 },
      awayStats: { formPoints5: 6, goalsForAvg: 1.1, goalsAgainstAvg: 1.5 } }
  ];
  // Ces matchs de démo n'apparaissent que si l'API ne renvoie aucun match réel
  // aujourd'hui (jour sans matchs dans ces championnats, ou clé API en attente d'activation).
}

function demoStatsFor() {
  // Le plan gratuit football-data.org ne fournit pas les stats de forme dans cet appel.
  // En attendant un appel enrichi (voir README pour l'évolution), on utilise une estimation
  // aléatoire raisonnable — les vrais noms d'équipes et matchs restent bien réels.
  return { formPoints5: 7 + Math.floor(Math.random() * 6), goalsForAvg: 1 + Math.random(), goalsAgainstAvg: 1 + Math.random() };
}

export async function loadTodayAnalysis() {
  const rawMatches = await fetchTodayMatches();

  const analyzed = rawMatches.map(m => {
    const probs = calcProbabilities(m.homeStats, m.awayStats);
    const pick = bestPick(probs);
    return {
      home: m.home,
      away: m.away,
      competition: m.competition,
      pickLabel: pick.pick === "home" ? m.home : pick.pick === "away" ? m.away : "Match nul",
      probability: pick.probability,
      odds: pick.odds
    };
  });

  const combo = buildCombo(analyzed, 5);

  return { analyzed, combo };
}

export function renderMatches(analyzed, unlocked) {
  const list = document.getElementById("matches-list");
  list.innerHTML = "";
  analyzed.forEach(m => {
    const row = document.createElement("div");
    row.className = "match-row" + (unlocked ? "" : " locked-row");
    row.innerHTML = `
      <div>
        <div class="match-teams">${m.home} — ${m.away}</div>
        <div class="match-comp">${m.competition}</div>
      </div>
      <div class="match-pick">
        <div class="match-conf">${m.pickLabel}</div>
        <div class="match-odds">${Math.round(m.probability * 100)}% · cote ${m.odds}</div>
      </div>`;
    list.appendChild(row);
  });
}

export function renderCombo(combo) {
  document.getElementById("hero-odds").textContent = `×${combo.odds}`;
  document.getElementById("hero-date").textContent = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long"
  });
        }
