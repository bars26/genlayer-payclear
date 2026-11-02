// Live end-to-end demo of PayClear on GenLayer Studio, auditing real employers' public job boards.
//
//   node scripts/demo.mjs <contract-address>
//
// The program is a DEMO program funded by test wallets; the auditors are test wallets. The job boards and postings
// are real, read live from Greenhouse and Ashby by every validator.

import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { writeFileSync } from "fs";

const [CONTRACT] = process.argv.slice(2);
if (!CONTRACT) {
  console.error("usage: node scripts/demo.mjs <contract-address>");
  process.exit(1);
}
const RPC = "https://studio.genlayer.com/api";
const GEN = 10n ** 18n;
const WINDOW_MS = 600_000;

function client(account) {
  return createClient({ chain: studionet, endpoint: RPC, account });
}

async function rpc(method, params) {
  // Studio sometimes answers with an HTML error page; these calls are reads or idempotent top-ups, so retry them.
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(RPC, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
      const body = await res.json();
      if (body.error) throw new Error(`${method}: ${body.error.message}`);
      return body.result;
    } catch (err) {
      if (attempt >= 5 || /^\w+: /.test(String(err?.message))) throw err;
      await new Promise((r) => setTimeout(r, 10000 * attempt));
    }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = [];
const TRANSIENT = /rate limit|Unexpected token '<'|not valid JSON|fetch failed|ECONNRESET|socket hang up|50[234]/i;

async function write(c, who, functionName, args, value = 0n, { expectError = false } = {}) {
  const from = c.account.address;
  for (let attempt = 1; ; attempt++) {
    const nonceBefore = BigInt(await rpc("eth_getTransactionCount", [from, "latest"]));
    try {
      let hash;
      try {
        hash = await c.writeContract({ address: CONTRACT, functionName, args, value });
      } catch (err) {
        // The RPC sometimes answers a send with an HTML error page. Only resend if the
        // nonce did not move; otherwise the first send went through and we pick it up.
        if (!TRANSIENT.test(String(err?.message || err))) throw err;
        await sleep(15000);
        const nonceAfter = BigInt(await rpc("eth_getTransactionCount", [from, "latest"]));
        if (nonceAfter === nonceBefore) throw err;
        const txs = await rpc("sim_getTransactionsForAddress", [from]);
        hash = txs.filter((t) => (t.from_address || "").toLowerCase() === from.toLowerCase()).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0].hash;
        console.log(`  send answered with an error page but the tx exists: ${hash}`);
      }
      // Once a hash exists, only the wait is retried; the transaction is never sent twice.
      let receipt;
      for (let wait = 1; ; wait++) {
        try {
          receipt = await c.waitForTransactionReceipt({ hash, status: "ACCEPTED", retries: 60, interval: 5000 });
          break;
        } catch (err) {
          if (!TRANSIENT.test(String(err?.message || err)) || wait >= 6) throw Object.assign(err, { sent: true });
          await sleep(10000 * wait);
        }
      }
      const lr = receipt?.consensus_data?.leader_receipt;
      const first = Array.isArray(lr) ? lr[0] : lr;
      const exec = first?.execution_result ?? "?";
      let returned = first?.result?.payload?.readable;
      try { returned = JSON.parse(returned); } catch {}
      const row = {
        who,
        call: `${functionName}(${args.map((a) => (typeof a === "bigint" ? `${Number(a) / 1e18} GEN` : JSON.stringify(a)).slice(0, 60)).join(", ")})`,
        value: (Number(value) / 1e18).toString(),
        hash,
        status: receipt.statusName ?? receipt.status_name ?? "ACCEPTED",
        exec,
        returned: typeof returned === "string" ? returned : undefined,
      };
      log.push(row);
      console.log(`${row.who.padEnd(11)} ${row.call.padEnd(58)} ${row.status.padEnd(9)} ${row.exec.padEnd(7)} ${hash}${row.returned ? "  -> " + row.returned.slice(0, 160) : ""}`);
      if (expectError) {
        if (exec !== "ERROR") throw new Error(`${functionName} was expected to be refused but executed with ${exec}`);
        const msg = typeof first?.result?.payload === "string" ? first.result.payload : "";
        row.refused = msg;
        console.log(`  -> refused as designed: ${msg}`);
        return row;
      }
      if (exec !== "SUCCESS") throw new Error(`${functionName} executed with ${exec}`);
      return row;
    } catch (err) {
      const msg = String(err?.message || err);
      if (TRANSIENT.test(msg) && attempt < 5 && !err?.sent) {
        console.log(`  transient RPC error (${msg.slice(0, 60)}), waiting ${15 * attempt}s`);
        await sleep(15000 * attempt);
        continue;
      }
      throw err;
    }
  }
}

async function read(c, functionName, args = []) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await c.readContract({ address: CONTRACT, functionName, args });
    } catch (err) {
      if (TRANSIENT.test(String(err?.message)) && attempt < 6) {
        await sleep(15000 * attempt);
        continue;
      }
      throw err;
    }
  }
}

const balance = async (addr) => BigInt(await rpc("eth_getBalance", [addr, "latest"]));
const fmt = (wei) => (Number(wei) / 1e18).toFixed(2);
const fund = async (addr, gen) => rpc("sim_fundAccount", [addr, Number(gen * GEN)]);
const field = (obj, name) => (obj instanceof Map ? obj.get(name) : obj[name]);

const keys = { sponsor: generatePrivateKey(), cofunder: generatePrivateKey(), auditor: generatePrivateKey(), bystander: generatePrivateKey() };
const acct = Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, createAccount(v)]));
const A = client(acct.sponsor);
const B = client(acct.cofunder);
const S = client(acct.auditor);
const X = client(acct.bystander);
if (process.env.DEMO_KEYS) writeFileSync(process.env.DEMO_KEYS, JSON.stringify(keys));

console.log("contract  ", CONTRACT);
for (const [k, a] of Object.entries(acct)) console.log(k.padEnd(10), a.address);
await fund(acct.sponsor.address, 20n);
await fund(acct.cofunder.address, 5n);
await fund(acct.auditor.address, 2n);
await fund(acct.bystander.address, 1n);
await sleep(3000);

const firstProgram = (await read(A, "get_programs", [0, 200])).length;
let nextAudit = (await read(A, "get_audits", [0, 200])).length;
const pid = (n) => `program_${firstProgram + n}`;
const audits = [];
const audit = async (who, c, programId, ats, board, label) => {
  await write(c, who, "open_audit", [programId, ats, board]);
  const id = `audit_${nextAudit++}`;
  audits.push(id);
  let state = JSON.parse(await read(A, "score", [id])).state;
  while (state !== "done") {
    const r = await write(c, who, "step", [id]);
    state = r.returned;
  }
  const s = JSON.parse(await read(A, "score", [id]));
  console.log(`  -> ${label} (${ats}/${board}): ${JSON.stringify(s)}`);
  return id;
};

// Transfers out of the contract run as their own transactions once the call that emitted them is
// finalized, so balances are compared only when nothing touching the contract is in flight.
const quiet = async () => {
  let last = -1;
  for (let i = 0; i < 60; i++) {
    const txs = await rpc("sim_getTransactionsForAddress", [CONTRACT]);
    const busy = txs.filter((t) => t.status !== "FINALIZED" && t.status !== "CANCELED" && t.status !== "UNDETERMINED").length;
    if (busy === 0 && txs.length === last) return txs.length;
    last = busy === 0 ? txs.length : -1;
    await sleep(10000);
  }
  throw new Error("transactions did not finalize");
};
const reconciliations = [];
const reconcile = async (label) => {
  await quiet();
  const t = JSON.parse(await read(A, "totals"));
  const onChain = await balance(CONTRACT);
  const ok = BigInt(t.expected_balance) === onChain;
  reconciliations.push({ label, expected: t.expected_balance, balance: onChain.toString(), ok });
  console.log(`  reconcile (${label}): open program pots = ${fmt(t.expected_balance)} GEN; contract balance ${fmt(onChain)} GEN ${ok ? "OK" : "MISMATCH"}`);
  if (!ok) throw new Error("balance mismatch");
};

const ENDS = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10);
const REWARD = GEN / 20n;
const program = (c, who, title, ends, reward, perAuditor, value) => write(c, who, "create_program", [title, ends, reward, perAuditor], value);

// Refused at creation: the GEN comes straight back.
await program(A, "sponsor", "US pay transparency, fall 2026", "2026-02-31", REWARD, 40, 2n * GEN); // no such calendar date
await program(A, "sponsor", "US pay transparency, fall 2026", ENDS, GEN / 1000n, 40, 2n * GEN); // reward below 0.01 GEN
await program(A, "sponsor", "US pay transparency, fall 2026", ENDS, REWARD, 0, 2n * GEN); // per_auditor must be 1 to 1000
await program(A, "sponsor", "US pay transparency, fall 2026", ENDS, REWARD, 40, GEN / 20n); // pot below 0.1 GEN
await reconcile("after the refused programs: the contract kept nothing");

console.log("");
await program(A, "sponsor", "US pay transparency, fall 2026", ENDS, REWARD, 40, 2n * GEN);
await write(B, "cofunder", "fund", [pid(0)], GEN);
await write(X, "bystander", "fund", [pid(0)], GEN / 20n); // below the 0.1 GEN minimum top-up: sent back
await write(S, "auditor", "open_audit", [pid(0), "lever", "figma"], 0n, { expectError: true }); // only greenhouse and ashby
await write(S, "auditor", "open_audit", [pid(0), "greenhouse", "no-such-board-payclear"], 0n, { expectError: true }); // the board does not exist

await write(S, "auditor", "open_audit", [pid(0), "greenhouse", "figma"]);
const figma = `audit_${nextAudit++}`;
audits.push(figma);
await write(X, "bystander", "open_audit", [pid(0), "greenhouse", "figma"], 0n, { expectError: true }); // already running
let state = JSON.parse(await read(A, "score", [figma])).state;
for (let turn = 0; state !== "done"; turn++) state = (await write(turn % 2 ? X : S, turn % 2 ? "bystander" : "auditor", "step", [figma])).returned;
console.log(`  -> Figma (greenhouse/figma): ${await read(A, "score", [figma])}`);
await write(S, "auditor", "recheck", [figma, "6216211004"]); // a fresh reading of the posting without pay
await write(X, "bystander", "recheck", [figma, "6216211004"], 0n, { expectError: true }); // once per posting
await write(S, "auditor", "open_audit", [pid(0), "greenhouse", "figma"], 0n, { expectError: true }); // a week between audits
await reconcile("after the Figma audit");

await audit("auditor", S, pid(0), "ashby", "supabase", "Supabase");
await audit("bystander", X, pid(0), "ashby", "linear", "Linear");
await audit("auditor", S, pid(0), "greenhouse", "airtable", "Airtable");
await audit("bystander", X, pid(0), "greenhouse", "asana", "Asana");
await write(X, "bystander", "close", [pid(0)], 0n, { expectError: true }); // steps are paid until the program ends
await reconcile("end of run");

console.log("\nfinal program:");
const pots = { [pid(0)]: await read(A, "get_program", [pid(0)]) };
const out = {
  contract: CONTRACT, accounts: Object.fromEntries(Object.entries(acct).map(([k, a]) => [k, a.address])), programs: [pid(0)],
  program: Object.fromEntries(Object.entries(pots[pid(0)] instanceof Map ? Object.fromEntries(pots[pid(0)]) : pots[pid(0)]).map(([k, v]) => [k, typeof v === "bigint" ? v.toString() : v])),
  audits: {}, reconciliations, balances: {}, log,
};
for (const id of audits) {
  const a = await read(A, "get_audit", [id]);
  const g = (k) => (a instanceof Map ? a.get(k) : a[k]);
  out.audits[id] = {
    ats: g("ats"), board: g("board"), employer: g("employer"), state: g("state"), board_size: String(g("board_size")), steps: JSON.parse(g("steps_json")),
    score: JSON.parse(await read(A, "score", [id])), missing: JSON.parse(g("missing_json")),
    results: JSON.parse(await read(A, "get_results", [id, 0, 200])),
  };
  console.log(`  ${id} ${g("employer")} ${JSON.stringify(out.audits[id].score)}`);
}
for (const [k, a] of Object.entries(acct)) out.balances[k] = (await balance(a.address)).toString();
writeFileSync(new URL("../docs/demo-run.json", import.meta.url), JSON.stringify(out, null, 2));
console.log("\nwrote docs/demo-run.json");
