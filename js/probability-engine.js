/**
 * Moteur de probabilités.
 *
 * Ce module calcule une probabilité de résultat (victoire domicile / nul / victoire extérieur)
 * à partir de statistiques réelles d'équipes (forme récente, buts marqués/encaissés, avantage du terrain).
 * C'est un modèle statistique transparent — pas une "boîte noire" qui devine.
 * Il ne prétend jamais à la certitude : chaque pronostic est accompagné de sa probabilité réelle.
 *
 * Pour l'améliorer plus tard : on peut remplacer calcProbabilities() par un appel à un vrai
 * modèle entraîné (ex. régression logistique sur historique), tant que la sortie reste
 * des probabilités honnêtes et calibrées (vérifiées via le suivi de fiabilité, voir app.js).
 */

// Force relative simple, basée sur des stats normalisées entre 0 et 1
function teamStrength(stats) {
  const { formPoints5, goalsForAvg, goalsAgainstAvg } = stats;
  // formPoints5 : points pris sur les 5 derniers matchs (0 à 15)
  const formScore = formPoints5 / 15;
  const attackScore = Math.min(goalsForAvg / 3, 1);
  const defenseScore = 1 - Math.min(goalsAgainstAvg / 3, 1);
  return (formScore * 0.5) + (attackScore * 0.3) + (defenseScore * 0.2);
}

const HOME_ADVANTAGE = 0.08; // avantage historique moyen du terrain, toutes ligues confondues

export function calcProbabilities(homeStats, awayStats) {
  const homeRaw = teamStrength(homeStats) + HOME_ADVANTAGE;
  const awayRaw = teamStrength(awayStats);

  const total = homeRaw + awayRaw;
  let pHome = homeRaw / total;
  let pAway = awayRaw / total;

  // Probabilité de nul : plus les deux équipes sont proches en force, plus elle augmente
  const gap = Math.abs(pHome - pAway);
  const pDraw = 0.32 - (gap * 0.2); // entre ~0.12 et 0.32

  // Renormalisation pour que la somme fasse 1
  const remaining = 1 - pDraw;
  pHome = pHome * remaining;
  pAway = pAway * remaining;

  return {
    home: round2(pHome),
    draw: round2(pDraw),
    away: round2(pAway)
  };
}

// Cote "juste" implicite à partir d'une probabilité (sans marge bookmaker)
export function impliedOdds(probability) {
  if (probability <= 0) return null;
  return round2(1 / probability);
}

// Sélectionne le résultat le plus probable + son niveau de confiance
export function bestPick(probs) {
  const entries = Object.entries(probs); // [["home",0.55],["draw",0.25],["away",0.20]]
  entries.sort((a, b) => b[1] - a[1]);
  const [pick, probability] = entries[0];
  return { pick, probability, odds: impliedOdds(probability) };
}

// Construit un combiné à partir d'une liste de picks, en ne gardant que les plus fiables,
// jusqu'à atteindre (ou dépasser légèrement) la cote cible.
export function buildCombo(matchPicks, targetOdds = 5) {
  const sorted = [...matchPicks].sort((a, b) => b.probability - a.probability);
  const combo = [];
  let comboOdds = 1;
  for (const m of sorted) {
    if (comboOdds >= targetOdds) break;
    combo.push(m);
    comboOdds *= m.odds;
  }
  const comboProbability = combo.reduce((acc, m) => acc * m.probability, 1);
  return {
    matches: combo,
    odds: round2(comboOdds),
    // probabilité réelle que TOUT le combiné passe — souvent basse, et c'est normal et honnête
    probability: round2(comboProbability)
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
    }
