// QuorumGate — pure weighted-vote quorum tally.
// No I/O. Never throws: malformed top-level input returns {ok:false, why}.

export function tallyQuorum(entries, threshold) {
  if (!Array.isArray(entries)) {
    return { ok: false, why: 'entries must be an array' };
  }
  if (typeof threshold !== 'number' || !Number.isFinite(threshold) || threshold < 0) {
    return { ok: false, why: 'threshold must be a non-negative finite number' };
  }

  // Collapse duplicate voters to their LAST vote (later entries overwrite earlier ones).
  const byVoter = new Map();
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const { voter, weight, choice } = entry;
    if (voter === undefined || voter === null) continue;
    if (choice === undefined || choice === null) continue;
    // Discard malformed weights: non-finite (NaN/Infinity) or negative. Zero is valid.
    if (typeof weight !== 'number' || !Number.isFinite(weight) || weight < 0) continue;
    byVoter.set(voter, { weight, choice });
  }

  const tally = {};
  let total = 0;
  for (const { weight, choice } of byVoter.values()) {
    tally[choice] = (tally[choice] || 0) + weight;
    total += weight;
  }

  let winner = null;
  let winnerWeight = -1;
  for (const choice of Object.keys(tally)) {
    if (tally[choice] > winnerWeight) {
      winnerWeight = tally[choice];
      winner = choice;
    }
  }

  const met = total >= threshold;

  return { ok: true, met, total, winner, tally };
}
