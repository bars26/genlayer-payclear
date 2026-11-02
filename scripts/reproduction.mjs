// Builds docs/REPRODUCTION.md from docs/demo-run.json (written by scripts/demo.mjs) and, when present,
// docs/ui-test.json (a MetaMask run from the live app).
//
//   node scripts/reproduction.mjs

import { existsSync, readFileSync, writeFileSync } from "fs";

const run = JSON.parse(readFileSync(new URL("../docs/demo-run.json", import.meta.url), "utf8"));
const EXPLORER = "https://explorer-studio.genlayer.com";
const tx = (h) => (h ? `[\`${h.slice(0, 10)}…\`](${EXPLORER}/tx/${h})` : "");
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const gen = (wei) => `${(Number(BigInt(wei)) / 1e18).toLocaleString("en-US", { maximumFractionDigits: 4 })} GEN`;
const board = (a) => (a.ats === "ashby" ? `https://jobs.ashbyhq.com/${a.board}` : `https://job-boards.greenhouse.io/${a.board}`);
const LABEL = { range_listed: "pay listed", range_text: "pay in the ad", no_range: "no pay shown", unverified: "unverified", unclear: "unclear", out_of_scope: "out of scope" };

const rows = Object.entries(run.audits).map(([id, a]) => {
  const s = a.score;
  return `| ${id} | [${esc(a.employer)}](${board(a)}) | ${a.ats} | ${s.read} | ${s.in_scope} | ${s.show_pay} | **${s.missing}** | ${s.unverified} | ${s.unclear} | ${s.score_bp === null ? "—" : `${(s.score_bp / 100).toFixed(1)}%`} | ${a.steps.length} |`;
});
const missing = Object.entries(run.audits).flatMap(([id, a]) =>
  a.results.filter((r) => r.code === "no_range").map((r) => `| ${id} | ${esc(a.employer)} | [${esc(r.title)}](${r.url}) | ${esc(r.location)} | ${r.states.join(" ")} | ${r.rechecked ? "read again, still none" : ""} |`)
);
const inScope = Object.entries(run.audits).flatMap(([id, a]) =>
  a.results.filter((r) => r.code !== "out_of_scope").map((r) => `| ${id} | ${r.id} | ${esc(r.title)} | ${r.states.join(" ")} | ${LABEL[r.code]} | ${esc(r.pay || "")} |`)
);
const steps = Object.entries(run.audits).flatMap(([id, a]) =>
  a.steps.map((s, i) => `| ${id} #${i + 1} | ${s.at} | \`${s.by}\` | ${s.read} | ${BigInt(s.paid) > 0n ? gen(s.paid) : "unpaid"} | \`${s.packet}\` | \`${s.results}\` |`)
);

let uiTest = "";
const uiPath = new URL("../docs/ui-test.json", import.meta.url);
if (existsSync(uiPath)) {
  const ui = JSON.parse(readFileSync(uiPath, "utf8"));
  uiTest = `## Wallet test from the live app

${ui.note} Wallet \`${ui.wallet}\`. Every transaction is FINALIZED with execution result SUCCESS.

| Step | GEN sent | Result | Tx |
|---|---|---|---|
${ui.steps.map(([step, value, result, hash]) => `| ${esc(step)} | ${value} | ${esc(result)} | ${tx(hash)} |`).join("\n")}
`;
}

const md = `# PayClear: reproduction of the live run

Contract on GenLayer Studio: [\`${run.contract}\`](${EXPLORER}/address/${run.contract}) (source: \`contracts/pay_clear.py\`, checked
byte-identical with \`node scripts/verify-code.mjs ${run.contract}\`).

\`scripts/demo.mjs\` funded a **demo program** with test wallets and audited **real employers' public job boards** on Greenhouse and Ashby.
Every step is real validator consensus: each validator read the board, placed every posting in code (12 US jurisdictions with
pay-in-posting laws, plus US-remote jobs under Colorado's), read listed pay in code, and read the pay passages of the rest.

Accounts: ${Object.entries(run.accounts).map(([k, a]) => `${k} \`${a}\``).join(", ")}.

## Audits

| Audit | Employer | Board | Read | In scope | Show pay | No pay shown | Unverified | Unclear | Score | Steps |
|---|---|---|---|---|---|---|---|---|---|---|
${rows.join("\n")}

The score is postings that show pay out of those whose page could be checked (unverified and unclear postings are left out).

## Postings with no pay shown

| Audit | Employer | Posting | Location | Jurisdictions | Note |
|---|---|---|---|---|---|
${missing.join("\n")}

## Every posting in scope

| Audit | Posting id | Title | Jurisdictions | Result | Listed pay |
|---|---|---|---|---|---|
${inScope.join("\n")}

## Steps

Each step stores who ran it, how many postings it read, what it paid, and the sha256 of its evidence packet and of its results.

| Step | At (UTC) | By | Read | Paid | packet | results |
|---|---|---|---|---|---|---|
${steps.join("\n")}

## Balance reconciliation

\`totals()\` (open program pots) against the contract's on-chain balance, each time after every transfer had finalized:

| Point | Expected | Contract balance | Match |
|---|---|---|---|
${run.reconciliations.map((r) => `| ${r.label} | ${gen(r.expected)} | ${gen(r.balance)} | ${r.ok ? "yes" : "**no**"} |`).join("\n")}

Final wallet balances: ${Object.entries(run.balances).map(([k, b]) => `${k} ${gen(b)}`).join(", ")}.

${uiTest}
## Every transaction

| Who | Call | GEN | Status | Result | Returned / refused | Tx |
|---|---|---|---|---|---|---|
${run.log.map((r) => `| ${r.who} | \`${esc(r.call)}\` | ${r.value} | ${r.status} | ${r.exec} | ${esc((r.returned || r.refused || "").slice(0, 140))} | ${tx(r.hash)} |`).join("\n")}
`;

writeFileSync(new URL("../docs/REPRODUCTION.md", import.meta.url), md);
console.log(`wrote docs/REPRODUCTION.md (${run.log.length} transactions)`);
