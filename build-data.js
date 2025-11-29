// Build script to convert CSV to enriched JavaScript data module
const fs = require('fs');

const csv = fs.readFileSync('./all-world-cup-matches.csv', 'utf-8').replace(/\r/g, '');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',');

const matches = lines.slice(1).map((line, idx) => {
  const values = line.split(',');
  const match = {
    id: idx + 1,
    year: parseInt(values[0]),
    host: values[1],
    stage: values[2].trim(),
    home: values[3],
    away: values[4],
    homeScore: parseInt(values[5]),
    awayScore: parseInt(values[6]),
    winner: values[7],
    loser: values[8]
  };

  // Computed fields
  match.totalGoals = match.homeScore + match.awayScore;
  match.goalDiff = Math.abs(match.homeScore - match.awayScore);
  match.isDraw = match.winner === 'Draw';
  match.decade = Math.floor(match.year / 10) * 10;
  match.isKnockout = !match.stage.includes('Group');
  match.isFinal = match.stage === 'Final';

  return match;
});

// Build aggregations
const tournaments = [...new Set(matches.map(m => m.year))].sort();
const allTeams = new Set();
matches.forEach(m => {
  allTeams.add(m.home);
  allTeams.add(m.away);
});

// Tournament stats
const tournamentStats = tournaments.map(year => {
  const yearMatches = matches.filter(m => m.year === year);
  const host = yearMatches[0].host;
  const totalGoals = yearMatches.reduce((sum, m) => sum + m.totalGoals, 0);
  const final = yearMatches.find(m => m.isFinal);

  return {
    year,
    host,
    matchCount: yearMatches.length,
    totalGoals,
    avgGoals: +(totalGoals / yearMatches.length).toFixed(2),
    winner: final ? final.winner : null,
    runnerUp: final ? final.loser : null
  };
});

// Team stats (all-time)
const teamStats = {};
matches.forEach(m => {
  [m.home, m.away].forEach(team => {
    if (!teamStats[team]) {
      teamStats[team] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, tournaments: new Set() };
    }
    teamStats[team].tournaments.add(m.year);
  });

  // Home team
  teamStats[m.home].played++;
  teamStats[m.home].goalsFor += m.homeScore;
  teamStats[m.home].goalsAgainst += m.awayScore;

  // Away team
  teamStats[m.away].played++;
  teamStats[m.away].goalsFor += m.awayScore;
  teamStats[m.away].goalsAgainst += m.homeScore;

  if (m.isDraw) {
    teamStats[m.home].drawn++;
    teamStats[m.away].drawn++;
  } else {
    if (m.winner === m.home) {
      teamStats[m.home].won++;
      teamStats[m.away].lost++;
    } else {
      teamStats[m.away].won++;
      teamStats[m.home].lost++;
    }
  }
});

// Convert Sets to arrays and add win rate
Object.keys(teamStats).forEach(team => {
  const s = teamStats[team];
  s.tournaments = [...s.tournaments].sort();
  s.tournamentCount = s.tournaments.length;
  s.winRate = s.played > 0 ? +(s.won / s.played * 100).toFixed(1) : 0;
  s.goalDiff = s.goalsFor - s.goalsAgainst;
});

// World Cup winners
const winners = tournamentStats.filter(t => t.winner).map(t => t.winner);
const winnerCounts = {};
winners.forEach(w => { winnerCounts[w] = (winnerCounts[w] || 0) + 1; });

// Host performance
const hostPerformance = tournamentStats.map(t => {
  const hostMatches = matches.filter(m => m.year === t.year && (m.home === t.host || m.away === t.host));
  const hostWins = hostMatches.filter(m => m.winner === t.host).length;
  const hostDraws = hostMatches.filter(m => m.isDraw).length;
  const wonTournament = t.winner === t.host;
  const reachedFinal = t.winner === t.host || t.runnerUp === t.host;

  return {
    year: t.year,
    host: t.host,
    matchesPlayed: hostMatches.length,
    wins: hostWins,
    draws: hostDraws,
    losses: hostMatches.length - hostWins - hostDraws,
    wonTournament,
    reachedFinal
  };
});

// Notable upsets (underdog wins against historically stronger teams)
const strongTeams = ['Brazil', 'Germany', 'West Germany', 'Italy', 'Argentina', 'France', 'England', 'Spain', 'Netherlands'];
const upsets = matches.filter(m => {
  if (m.isDraw) return false;
  const loser = m.loser;
  const winner = m.winner;
  const loserStrong = strongTeams.includes(loser);
  const winnerStrong = strongTeams.includes(winner);
  return loserStrong && !winnerStrong && m.goalDiff >= 1;
}).map(m => ({
  ...m,
  description: `${m.winner} ${m.homeScore}-${m.awayScore} ${m.loser}`
}));

// Finals data with enriched fields
const finals = matches.filter(m => m.isFinal).map(m => {
  // Determine winner/loser scores
  const winnerScore = m.winner === m.home ? m.homeScore : m.awayScore;
  const loserScore = m.winner === m.home ? m.awayScore : m.homeScore;
  return {
    ...m,
    winnerScore,
    loserScore,
    margin: winnerScore - loserScore,
    extraTime: false, // Would need additional data to determine
    penalties: winnerScore === loserScore // If scores equal but there's a winner, likely penalties
  };
});

// Output
const output = `// FIFA World Cup Dashboard - Data Module
// Generated from all-world-cup-matches.csv
// ${matches.length} matches from ${tournaments[0]} to ${tournaments[tournaments.length - 1]}

const DATA = {
  matches: ${JSON.stringify(matches, null, 2)},

  tournaments: ${JSON.stringify(tournamentStats, null, 2)},

  teamStats: ${JSON.stringify(teamStats, null, 2)},

  winnerCounts: ${JSON.stringify(winnerCounts, null, 2)},

  hostPerformance: ${JSON.stringify(hostPerformance, null, 2)},

  upsets: ${JSON.stringify(upsets, null, 2)},

  finals: ${JSON.stringify(finals, null, 2)},

  // Quick stats
  summary: {
    totalMatches: ${matches.length},
    totalGoals: ${matches.reduce((s, m) => s + m.totalGoals, 0)},
    totalTournaments: ${tournaments.length},
    totalTeams: ${allTeams.size},
    avgGoalsPerMatch: ${(matches.reduce((s, m) => s + m.totalGoals, 0) / matches.length).toFixed(2)},
    highestScoringMatch: ${JSON.stringify(matches.reduce((max, m) => m.totalGoals > max.totalGoals ? m : max))},
    mostWins: ${JSON.stringify(Object.entries(winnerCounts).sort((a, b) => b[1] - a[1])[0])}
  }
};

// Export for use in other modules
if (typeof module !== 'undefined') module.exports = DATA;
`;

fs.writeFileSync('./js/data.js', output);
console.log('Generated js/data.js with', matches.length, 'matches');
console.log('Tournaments:', tournaments.length);
console.log('Teams:', allTeams.size);
console.log('Total goals:', matches.reduce((s, m) => s + m.totalGoals, 0));
