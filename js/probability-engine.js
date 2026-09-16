function teamStrength(stats) {
  const { formPoints5, goalsForAvg, goalsAgainstAvg } = stats;
  const formScore = formPoints5 / 15;
  const attackScore = Math.min(goalsForAvg / 3, 1);
  const defenseScore = 1 - Math.min(goalsAgainstAvg / 3, 1);
  return (formScore * 0.5) + (attackScore * 0.3) + (defenseScore * 0.2);
}

const HOME_ADVANTAGE = 0.08;

export function calcProbabilities(homeStats, awayStats) {
  const homeRaw = teamStrength(homeStats) + HOME_ADVANTAGE;
  const awayRaw = teamStrength(awayStats);

  const total = homeRaw + awayRaw;
  let pHome = homeRaw / total;
  let pAway = awayRaw / total;

  const gap = Math.abs(pHome - pAway);
  const pDraw = 0.32 - (gap * 0.2);

  const remaining = 1 - pDraw;
  pHome = pHome * remaining;
  pAway = pAway * remaining;

  return {
    home: round2(pHome),
    draw: round2(pDraw),
    away: round2(pAway)
  };
}

export function impliedOdds(probability) {
  if (probability <= 0) return null;
  return round2(1 / probability);
}

export function bestPick(probs) {
  const entries = Object.entries(probs);
  entries.sort((a, b) => b[1] - a[1]);
  const [pick, probability] = entries[0];
  return { pick, probability, odds: impliedOdds(probability) };
}

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
    probability: round2(comboProbability)
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
