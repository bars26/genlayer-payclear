// Live run of PayClear v2 on Bradbury testnet (Phase 2): five independent validators read real job boards.
//
//   node scripts/demo-bradbury.mjs <contract-address>      # writes docs/bradbury/demo-run.json
//
// Test wallets (keys outside the repo, in ~/.config/genlayer-demos/): a sponsor and two auditors, funded from the
// GenLayer testnet faucet. The program is a demo; the boards and postings are real.
//
// Bradbury reports each transaction's decision, execution result and the validators' votes, not the contract's return
// value, so every result below is read back from the contract. A round where the leader ran out of time changes
// nothing and is sent again (up to three times); each attempt is logged.

import { writeFileSync } from "fs";
import { EXPLORER, accountFrom, balance, clientFor, gen, keyFile, read, write } from "./bradbury.mjs";

const [CONTRACT] = process.argv.slice(2);
if (!CONTRACT) {
  console.error("usage: node scripts/demo-bradbury.mjs <contract-address>");
  process.exit(1);
}
const GEN = 10n ** 18n;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const wallets = {
  sponsor: accountFrom(keyFile("payclear-bradbury-sponsor.json")),
  auditorA: accountFrom(keyFile("payclear-bradbury-auditor-a.json")),
  auditorB: accountFrom(keyFile("payclear-bradbury-auditor-b.json")),
};
const C = Object.fromEntries(Object.entries(wallets).map(([k, a]) => [k, clientFor(a)]));
const log = [];

async function send(who, functionName, args = [], opts = {}) {
  const { expect = "ok", ...rest } = opts;
  const extra = functionName === "withdraw" ? { payee: wallets[who].address, leader: 120n, validator: 120n } : {};
  const r = await write(C[who], CONTRACT, functionName, args, { ...extra, ...rest });
  const row = { who, call: `${functionName}(${args.map((a) => JSON.stringify(typeof a === "bigint" ? a.toString() : a)).join(", ")})`, value: gen(rest.value ?? 0n), ...r };
  log.push(row);
  console.log(`${who.padEnd(9)} ${row.call.slice(0, 70).padEnd(70)} ${r.status} ${r.execution} [${r.votes.join("/")}] ${r.seconds}s ${r.hash}`);
  if (expect === "ok" && !r.ok) throw new Error(`${functionName} did not complete: ${r.status} ${r.execution}`);
  if (expect === "refused" && r.execution !== "FINISHED_WITH_ERROR") throw new Error(`${functionName} was expected to be refused, got ${r.status} ${r.execution}`);
  return r;
}

const reconciliations = [];
async function reconcile(label) {
  // A withdraw's transfer leaves the contract about a minute after the withdraw finalizes.
  for (let i = 0; i < 12; i++) {
    const t = JSON.parse(await read(CONTRACT, "totals"));
    const onChain = await balance(C.sponsor, CONTRACT);
    if (BigInt(t.expected_balance) === onChain || i === 11) {
      const ok = BigInt(t.expected_balance) === onChain;
      reconciliations.push({ label, expected: t.expected_balance, owed: t.owed, balance: onChain.toString(), ok });
      console.log(`  reconcile (${label}): pots + credited ${gen(t.expected_balance)} GEN; contract balance ${gen(onChain)} GEN ${ok ? "OK" : "MISMATCH"}`);
      if (!ok) throw new Error("balance mismatch");
      return;
    }
    await sleep(15000);
  }
}

const today = new Date();
const ENDS = new Date(today.getTime() + 60 * 86_400_000).toISOString().slice(0, 10);
const REWARD = GEN / 20n;
const TITLE = "US pay transparency on Bradbury";
const firstProgram = (await read(CONTRACT, "get_programs", [0, 200])).length;
const pid = `program_${firstProgram}`;
console.log("contract", CONTRACT);
for (const [k, a] of Object.entries(wallets)) console.log(k.padEnd(9), a.address, gen(await balance(C.sponsor, a.address)), "GEN");

// A refused payable call completes (returns "REFUNDED: ...") and credits the GEN back; the sponsor withdraws it.
await send("sponsor", "create_program", [TITLE, "2026-02-31", REWARD, 40], { value: GEN / 2n });
console.log("  credited to sponsor:", gen(await read(CONTRACT, "owed_to", [wallets.sponsor.address])), "GEN");
await reconcile("after a refused program: its GEN is credited to the sponsor");
await send("sponsor", "withdraw");
await send("sponsor", "withdraw", [], { expect: "refused" }); // nothing left
await reconcile("after the sponsor withdrew");

await send("sponsor", "create_program", [TITLE, ENDS, REWARD, 40], { value: 2n * GEN });
await send("auditorB", "fund", [pid], { value: GEN / 20n }); // below the 0.1 GEN minimum: credited back
await send("auditorA", "open_audit", [pid, "lever", "figma"], { expect: "refused" }); // only Greenhouse and Ashby

const audits = [];
async function audit(who, ats, board) {
  await send(who, "open_audit", [pid, ats, board]);
  const id = await read(CONTRACT, "audit_for", [pid, ats, board]);
  audits.push(id);
  while (JSON.parse(await read(CONTRACT, "score", [id])).state !== "done") await send(who, "step", [id]);
  console.log(`  -> ${ats}/${board}: ${await read(CONTRACT, "score", [id])}`);
  return id;
}
await audit("auditorA", "greenhouse", "airtable");
const linear = await audit("auditorB", "ashby", "linear");
await audit("auditorA", "greenhouse", "discord");
await send("auditorB", "open_audit", [pid, "ashby", "linear"], { expect: "refused" }); // a week between audits of a board

const results = JSON.parse(await read(CONTRACT, "get_results", [linear, 0, 200]));
const again = (results.find((r) => r.code === "no_range") ?? results.find((r) => r.code !== "out_of_scope")).id;
await send("auditorA", "recheck", [linear, again]);
await send("auditorB", "recheck", [linear, again], { expect: "refused" }); // once per posting
await reconcile("after the audits: step rewards are credited");

const withdrawals = {};
for (const who of ["auditorA", "auditorB"]) {
  const owed = BigInt(await read(CONTRACT, "owed_to", [wallets[who].address]));
  const before = await balance(C[who], wallets[who].address);
  const r = await send(who, "withdraw");
  // The transfer arrives once the withdraw finalizes; fees are a small fraction of a step reward.
  let after = await balance(C[who], wallets[who].address);
  for (let i = 0; i < 12 && after < before + owed - GEN / 100n; i++) {
    await sleep(15000);
    after = await balance(C[who], wallets[who].address);
  }
  withdrawals[who] = { credited: owed.toString(), wallet_gain: (after - before).toString(), tx: r.hash };
  console.log(`  ${who}: credited ${gen(owed)} GEN; wallet balance rose by ${gen(after - before)} GEN`);
}
await reconcile("end of run, after the auditors withdrew");

const out = { network: "bradbury", chainId: 4221, explorer: EXPLORER, contract: CONTRACT, accounts: Object.fromEntries(Object.entries(wallets).map(([k, a]) => [k, a.address])),
  program: pid, audits: {}, reconciliations, withdrawals, log };
for (const id of audits) {
  const a = await read(CONTRACT, "get_audit", [id]);
  const g = (k) => (a instanceof Map ? a.get(k) : a[k]);
  out.audits[id] = { ats: g("ats"), board: g("board"), employer: g("employer"), state: g("state"), board_size: String(g("board_size")), steps: JSON.parse(g("steps_json")),
    score: JSON.parse(await read(CONTRACT, "score", [id])), missing: JSON.parse(g("missing_json")), results: JSON.parse(await read(CONTRACT, "get_results", [id, 0, 200])) };
}
writeFileSync(new URL("../docs/bradbury/demo-run.json", import.meta.url), JSON.stringify(out, (k, v) => (typeof v === "bigint" ? v.toString() : v), 2));
console.log("\nwrote docs/bradbury/demo-run.json");
