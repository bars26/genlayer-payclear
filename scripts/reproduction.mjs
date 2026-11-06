// Builds docs/REPRODUCTION.md from the live runs of PayClear v2: docs/bradbury/demo-run.json (scripts/demo-bradbury.mjs)
// and docs/studio/demo-run.json (scripts/demo.mjs), plus each network's MetaMask run from the live app when present
// (docs/<network>/ui-test.json). The v1 run is kept in docs/v1/.
//
//   node scripts/reproduction.mjs

import { existsSync, readFileSync, writeFileSync } from "fs";

const NETS = {
  bradbury: { title: "Bradbury testnet (Phase 2, chain 4221)", explorer: "https://explorer-bradbury.genlayer.com", source: "contracts/pay_clear.bradbury.py" },
  studio: { title: "GenLayer Studio", explorer: "https://explorer-studio.genlayer.com", source: "contracts/pay_clear.py" },
};
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const gen = (wei) => `${(Number(BigInt(wei)) / 1e18).toLocaleString("en-US", { maximumFractionDigits: 4 })} GEN`;
const board = (a) => (a.ats === "ashby" ? `https://jobs.ashbyhq.com/${a.board}` : `https://job-boards.greenhouse.io/${a.board}`);
const load = (path) => (existsSync(new URL(path, import.meta.url)) ? JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")) : null);

function section(id, run) {
  const net = NETS[id];
  const tx = (h) => (h ? `[\`${h.slice(0, 10)}…\`](${net.explorer}/tx/${h})` : "");
  const audits = Object.entries(run.audits);
  const rows = audits.map(([aid, a]) => {
    const s = a.score;
    return `| ${aid} | [${esc(a.employer)}](${board(a)}) | ${a.ats} | ${s.read} | ${s.in_scope} | ${s.show_pay} | **${s.missing}** | ${s.unverified} | ${s.unclear} | ${s.score_bp === null ? "—" : `${(s.score_bp / 100).toFixed(1)}%`} | ${a.steps.length} |`;
  });
  const missing = audits.flatMap(([aid, a]) =>
    a.results.filter((r) => r.code === "no_range").map((r) => `| ${aid} | ${esc(a.employer)} | [${esc(r.title)}](${r.url}) | ${esc(r.location)} | ${r.states.join(" ")} | ${r.rechecked ? "read again, still none" : ""} |`)
  );
  const steps = audits.flatMap(([aid, a]) =>
    a.steps.map((s, i) => `| ${aid} #${i + 1} | ${s.at} | \`${s.by}\` | ${s.read} | ${BigInt(s.paid) > 0n ? gen(s.paid) : "unpaid"} | \`${s.packet}\` | \`${s.results}\` |`)
  );
  const log =
    id === "bradbury"
      ? `| Who | Call | GEN | Decision | Execution | Validator votes | Seconds | Tx |
|---|---|---|---|---|---|---|---|
${run.log.map((r) => `| ${r.who} | \`${esc(r.call)}\` | ${r.value} | ${r.status} | ${String(r.execution).replace("FINISHED_WITH_", "")} | ${(r.votes || []).join(" / ")} | ${r.seconds} | ${tx(r.hash)} |`).join("\n")}`
      : `| Who | Call | GEN | Status | Result | Returned / refused | Tx |
|---|---|---|---|---|---|---|
${run.log.map((r) => `| ${r.who} | \`${esc(r.call)}\` | ${r.value} | ${r.status} | ${r.exec} | ${esc((r.returned || r.refused || "").slice(0, 140))} | ${tx(r.hash)} |`).join("\n")}`;
  const ui = load(`../docs/${id}/ui-test.json`);
  const uiTest = ui
    ? `### Wallet test from the live app

${ui.note} Wallet \`${ui.wallet}\`.

| Step | GEN sent | Result | Tx |
|---|---|---|---|
${ui.steps.map(([step, value, result, hash]) => `| ${esc(step)} | ${value} | ${esc(result)} | ${tx(hash)} |`).join("\n")}
`
    : "";
  const withdrawals = run.withdrawals
    ? `Withdrawals: ${Object.entries(run.withdrawals).map(([k, w]) => `${k} was credited ${gen(w.credited)}${w.wallet_gain ? ` and its wallet balance rose by ${gen(w.wallet_gain)}` : ""}`).join("; ")}.`
    : "";

  return `## ${net.title}

Contract [\`${run.contract}\`](${net.explorer}/address/${run.contract}), source \`${net.source}\`. Accounts:
${Object.entries(run.accounts).map(([k, a]) => `${k} \`${a}\``).join(", ")}.

### Audits

| Audit | Employer | Board | Read | In scope | Show pay | No pay shown | Unverified | Unclear | Score | Steps |
|---|---|---|---|---|---|---|---|---|---|---|
${rows.join("\n")}

### Postings with no pay shown

| Audit | Employer | Posting | Location | Jurisdictions | Note |
|---|---|---|---|---|---|
${missing.join("\n") || "| | | none | | | |"}

### Steps

| Step | At (UTC) | By | Read | Paid | packet | results |
|---|---|---|---|---|---|---|
${steps.join("\n")}

### Balance reconciliation

\`totals()\` (open program pots plus GEN credited and not yet withdrawn) against the contract's on-chain balance, after every
transfer had finalized:

| Point | Expected | Contract balance | Match |
|---|---|---|---|
${run.reconciliations.map((r) => `| ${r.label} | ${gen(r.expected)} | ${gen(r.balance)} | ${r.ok ? "yes" : "**no**"} |`).join("\n")}

${withdrawals}

${uiTest}
### Every transaction

${log}
`;
}

const runs = Object.keys(NETS).map((id) => [id, load(`../docs/${id}/demo-run.json`)]).filter(([, r]) => r);
const md = `# PayClear v2: reproduction of the live runs

The same contract ran on two GenLayer networks: \`contracts/pay_clear.py\` on GenLayer Studio and
\`contracts/pay_clear.bradbury.py\` on Bradbury testnet (the same program with the Bradbury runner's header, without comments
and docstrings: \`python3 scripts/bradbury_source.py --check\` proves it). Each deployment is checked byte-identical with its file.

A **demo program** funded by test wallets paid audit steps of **real employers' public job boards** on Greenhouse and Ashby.
Every step is validator consensus: each validator read the board, placed every posting in code (12 US jurisdictions with
pay-in-posting laws, plus US-remote jobs under Colorado's), read listed pay in code, and read the pay passages of the rest.
In v2 every GEN that leaves the contract goes through \`withdraw\`, to the caller; rewards, refused payments and returned shares
are credited first. The v1 run is in [docs/v1/REPRODUCTION.md](v1/REPRODUCTION.md).

${runs.map(([id, run]) => section(id, run)).join("\n")}`;

writeFileSync(new URL("../docs/REPRODUCTION.md", import.meta.url), md);
console.log(`wrote docs/REPRODUCTION.md (${runs.map(([id, r]) => `${id}: ${r.log.length} transactions`).join(", ")})`);
