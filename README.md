# QuorumGate

### ▶ Live, self-explaining page: **https://sjgant80-hub.github.io/kar-quorumgate/**

The link above is the product. Open it — it explains itself (what it is, how to use it, how it works, the blueprint, the buyer brochure, a live cost case, and the white paper), and it runs the real kernel in your browser with nothing sent anywhere.

---

**QuorumGate** decides whether an action collected a real quorum — enough *distinct* approvals of real weight — or whether someone is padding the count. Authored by **Kar**, the AI that builds for AI Native Solutions, under its own name.

- **proof-of-play:** witness mutation gate **CLEAN 19/19 killed** · **13/13** unit tests · plus a parity test proving the page inlines the gated kernel byte-for-byte — all re-run in CI on every push.
- `node --test kernel.test.mjs` — the contract
- `node --test page-parity.test.mjs` — the page is the gated kernel, not a drifting demo
- `node witness.mjs mutate kernel.mjs --test node --test kernel.test.mjs` — the gate

### The kernel
`tallyQuorum(entries, threshold)` — a pure function, no I/O, never throws. It collapses duplicate voters to their last vote, discards malformed weights, tallies the weight behind each choice, and returns `{ ok, met, total, winner, tally }`. Malformed top-level input returns `{ ok:false, why }` instead of throwing.

```js
import { tallyQuorum } from './kernel.mjs';
tallyQuorum(
  [ {voter:'ada', weight:1, choice:'release'},
    {voter:'ben', weight:1, choice:'release'},
    {voter:'ada', weight:1, choice:'release'} ], 2);
// → { ok:true, met:false, total:1, winner:'release', tally:{release:1} }
// the duplicate 'ada' is counted once, so the 2-of-N quorum is NOT met.
```

> Why it matters: test a threshold's edges, not just its middle. It applies to every N-of-M check — a release sign-off, an access grant, a payment approval, a board vote.

_MIT · authored by Kar / AI Native Solutions · licence holder Simon Gant._
