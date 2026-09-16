import { calcProbabilities, bestPick, buildCombo } from "./probability-engine.js";

const FOOTBALL_API_KEY = "REMPLACE_MOI";
const FOOTBALL_API_BASE = "https://api.football-data.org/v4";
const COMPETITIONS = ["SA", "PL", "PD", "SA_BR", "CL"];

async function fetchTodayMatches() {
  if (FOOTBALL_API_KEY === "REMPLACE_MOI") {
    return getDemoMatches();
  }
  try {
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(`${FOOTBALL_API_BASE}/matches?dateFrom=${today}&dateTo=${today}`, {
      headers: { "X-Auth-Token": FOOTBALL_API_KEY }
    });
    const data = await res.json();
    return (data.matches || []).map(m => ({
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      competition: m.competition.name,
      homeStats: demoStatsFor(m.homeTeam.name),
      awayStats: demoStatsFor(m.awayTeam.name)
    }));
  } catch (e) {
    console.error("Erreur récupération matchs :", e);
    return getDemoMatches();
  }
}

function getDemoMatches() {
  return [
    { home: "Al-Hilal", away: "Al-Nassr", competition: "Saudi Pro League",
      homeStats: { formPoints5: 12, goalsForAvg: 2.4, goalsAgainstAvg: 0.8 },
      awayStats: { formPoints5: 9, goalsForAvg: 2.0, goalsAgainstAvg: 1.2 } },
    { home: "Man City", away: "Everton", competition: "Premier League",
      homeStats: { formPoints5: 13, goalsForAvg: 2.6, goalsAgainstAvg: 0.7 },
      awayStats: { formPoints5: 5, goalsForAvg: 0.9, goalsAgainstAvg: 1.8 } },
    { home: "Flamengo", away: "Bahia", competition: "Brasileirão",
      homeStats: { formPoints5: 10, goalsForAvg: 1.8, goalsAgainstAvg: 1.0 },
      awayStats: { formPoints5: 6, goalsForAvg: 1.1, goalsAgainstAvg: 1.5 } },
    { home: "Al Ahly", away: "Zamalek", competition: "Égypte D1",
      homeStats: { formPoints5: 11, goalsForAvg: 1.9, goalsAgainstAvg: 0.9 },
      awayStats: { formPoints5: 8, goalsForAvg: 1.3, goalsAgainstAvg: 1.1 } },
    { home: "Real Madrid", away: "Alavés", competition: "La Liga",
      homeStats: { formPoints5: 12, goalsForAvg: 2.3, goalsAgainstAvg: 0.8 },
      awayStats: { formPoints5: 4, goalsForAvg: 0.8, goalsAgainstAvg: 1.9 } },
    { home: "Inter Miami", away: "Orlando City", competition: "MLS",
      homeStats: { formPoints5: 9, goalsForAvg: 1.9, goalsAgainstAvg: 1.2 },
      awayStats: { formPoints5: 7, goalsForAvg: 1.4, goalsAgainstAvg: 1.4 } }
  ];
}

function demoStatsFor() {
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
