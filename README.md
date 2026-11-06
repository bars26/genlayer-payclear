# PayClear

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/license/mit/)

<img src="assets/payclear-logo.png" alt="PayClear logo" width="96" align="right" />

**Does the job ad show the pay? PayClear audits an employer's public job board on GenLayer: validators read every posting located
where a pay-transparency law applies and record, with the evidence on-chain, which ones show a pay range.**

Twelve US jurisdictions now require a pay range in job postings: California, Colorado, the District of Columbia, Hawaii, Illinois,
Maryland, Massachusetts, Minnesota, New Jersey, New York, Vermont and Washington, and Colorado's law reaches remote jobs open to
its residents. Job seekers cannot check thousands of postings, and a scraper's verdict is only as good as whoever runs it.
PayClear turns the check into a contract anyone can run and anyone can re-run:

1. A **sponsor** (a job-seekers' group, a researcher, a union) funds a **program**: a reward per audit step and a cap per auditor.
2. **Anyone opens an audit** of a public **Greenhouse** or **Ashby** job board by its token (`greenhouse/figma`, `ashby/linear`).
3. The audit runs in **steps of 25 postings**, in id order, each a separate transaction that anyone can send and that the program pays
   for. A board of 700 postings is 28 small steps, never one transaction that could run out of gas.
4. In each step **every validator** reads the board and, for each posting:
   - **places it in code**: the US states its location names (Toronto, Tel Aviv or Bogotá are never mistaken for California, Illinois
     or Colorado), and "Remote, US" counts under Colorado;
   - **reads listed pay in code**: Greenhouse's pay-range field, Ashby's displayed compensation;
   - for the rest, **reads the passages that mention pay** and answers `RANGE`, `NO_RANGE` or `UNCLEAR` for each posting, in one
     prompt per step. "Competitive pay", benefits, equity alone or "$1B raised" are not pay. A posting with no pay words at all is
     decided in code.
5. A posting with no pay on the board's **own page** counts as **no pay shown**. If the public page is the **employer's own site**
   (which may show pay the board API leaves out), it stays **unverified** and is never counted against the employer.
6. The audit's **score** is postings that show pay out of those that could be checked. Every step stores an evidence packet hash;
   **anyone can ask once for a fresh reading of any posting** (an employer who adds a range is re-read and the counts follow).

**Live app:** [payclear-bars26.vercel.app](https://payclear-bars26.vercel.app). Paste a board and see, without a wallet, every posting in
scope and how it will be read. The same contract runs on two networks; switch at the top of the app:

| Network | Contract | Source | Test GEN |
|---|---|---|---|
| **Bradbury testnet** (Phase 2, chain 4221) | [`BRADBURY_ADDRESS`](https://explorer-bradbury.genlayer.com/address/BRADBURY_ADDRESS) | `contracts/pay_clear.bradbury.py` | [testnet faucet](https://testnet-faucet.genlayer.foundation) |
| GenLayer Studio (chain 61999) | [`0x6dEc38B51C07120b910fe6b0a6c07b3Cf92A238D`](https://explorer-studio.genlayer.com/address/0x6dEc38B51C07120b910fe6b0a6c07b3Cf92A238D) | `contracts/pay_clear.py` | **Test GEN** button |

## What is new in v2

v1 ([`0x42E0…dBfc`](https://explorer-studio.genlayer.com/address/0x42E002dc4360752C37408F6755c6E0f94716dBfc), [run](docs/v1/REPRODUCTION.md)) ran
on GenLayer Studio only. v2 is **live on Bradbury testnet**, where five independent validators run the audit, and changes the contract
where Bradbury required it:

1. **One source, two networks.** Bradbury Phase 2 runs a newer py-genlayer runner (`babwp9t37…`) with the `import genlayer as gl` API;
   Studio runs the runner it always did. A short block at the top of `contracts/pay_clear.py` picks the right names on each, and
   `scripts/bradbury_source.py` writes `contracts/pay_clear.bradbury.py`: the same program with the Bradbury header, without comments
   and docstrings, because Bradbury stores the deployed source on-chain at about 0.77M gas per KB in blocks of about 32M gas. The
   script compares the two files' syntax trees and CI fails if they drift. The 42 direct tests run on both files, each under its
   own runner (genlayer-test 0.29 for Studio, 0.30 with GenVM Manager v0.6.0-rc10 for Bradbury).
2. **GEN only leaves through `withdraw`, to the caller.** Step rewards, payments the contract refuses and funders' returned shares
   are credited to an address; `withdraw()` sends that address everything credited to it. On Bradbury every transfer out of a
   contract is a message whose fee the sending transaction prepays: a withdraw prepays exactly one transfer, to its own sender,
   and the app adds that allocation. No call ever pays a third party, so no call can fail or lose GEN on someone else's behalf.
   `totals()` now counts what is credited and not yet withdrawn, and the live runs reconcile it with the contract's balance.
3. **Validators check the reading, not byte equality.** v1 required every validator's whole reading of a step to be byte-identical.
   With five independent validators that stalls on one wavering answer among 25. v2's validator function (`same_reading`) requires
   everything decided in code (which postings, their places, listed pay, the board's size) to match exactly, and the model's
   answers to match on all but at most one posting in ten (none below ten). An unusable model answer is agreed on as such and
   refuses the step instead of storing anything.

## Why GenLayer

- **Reading the ad.** Whether "$160,000 to $190,000" is this job's salary and "nearly $1B annually" is not, is a reading of free text.
  Every validator reads the same passages and must agree on one answer per posting.
- **Rules where rules belong.** Locations, the twelve laws, listed pay fields and the hosted-page test are code, applied by every
  validator to the same board; the model only reads what code cannot.
- **Anyone can audit, nobody can fake it.** The result is consensus over the employer's own public board, step by step, with hashes of
  what was read; there is no operator whose spreadsheet you have to trust.

## Verified live, on real job boards

Every step, packet hash, validator vote and balance reconciliation is in [`docs/REPRODUCTION.md`](docs/REPRODUCTION.md).

### Bradbury testnet

BRADBURY_RUN

### GenLayer Studio (v2, 2026-11-06)

`scripts/demo.mjs` funded a demo program with test wallets and audited the same five boards as the v1 run, three days later.

| Employer (board) | Postings read | In pay-transparency places | Show pay | No pay shown | Score | v1 (11-02) | What changed |
|---|---|---|---|---|---|---|---|
| [Figma](https://job-boards.greenhouse.io/figma) (Greenhouse) | 143 | 93 | 93 | 0 | **100%** | 98.9% | "Brand Designer, Web", the one posting without pay in v1, now lists $127,000-$269,000 in Greenhouse's pay field |
| [Supabase](https://jobs.ashbyhq.com/supabase) (Ashby) | 69 | 5 | 1 | **4** | **20%** | 20% | Unchanged: the US postings still say "Over $1B raised", which validators read as funding, not pay |
| [Linear](https://jobs.ashbyhq.com/linear) (Ashby) | 31 | 18 | 13 | **5** | **72.2%** | 0% | 11 postings now display Ashby compensation and 2 state a range in the text; 5 "North America" postings still show none |
| [Airtable](https://job-boards.greenhouse.io/airtable) (Greenhouse) | 5 | 4 | 4 | 0 | **100%** | 100% | 3 now use Greenhouse's pay field, 1 states it in the ad |
| [Asana](https://www.asana.com/jobs) (Greenhouse, own career site) | 110 | 44 | 44 | 0 | **100%** | 100% | Every US posting states its range in the text |

17 steps of up to 25 postings, run by two test wallets; each paid step credited 0.05 GEN. Refused and credited back: a program ending
on 2026-02-31, a reward below 0.01 GEN, a cap of 0 steps, a pot below 0.1 GEN and a 0.05 GEN top-up; the sponsor withdrew the 6.05 GEN
in one call, and a second withdraw was refused (nothing left). Refused by the contract: a Lever board, a board that does not exist, a
second audit of a board while one is running or within a week, a second fresh reading of a posting, and closing before the last day.
The auditors withdrew 0.40 and 0.50 GEN and their wallets rose by exactly that. `totals()` (pots plus credited GEN) matched the
contract's balance at all four checkpoints.

The v1 run (2026-11-02, with a MetaMask test from the live app) is in [`docs/v1/REPRODUCTION.md`](docs/v1/REPRODUCTION.md).

## Who can do what (and the attacks this blocks)

| Rule | Why |
|---|---|
| An audit measures what postings show, not whether the employer is bound by a law (most laws apply above a headcount) | No employer is called a lawbreaker on facts the contract cannot see |
| No pay on the employer's own career site is **unverified**, never missing | A board API that leaves out pay shown elsewhere (as some do) cannot convict anyone |
| Locations are read in code with guards for country codes that look like states (ON CA, Tel Aviv IL, Bogotá CO, Perth WA) | Foreign postings never count as US ones |
| A posting with no pay words is decided in code; only pay passages go to the validators, all postings of a step in one prompt | Validators read only what code cannot decide, and agree per posting |
| Audits read 25 postings per step, at most 1,500 per audit, resuming after the last id read | No step grows with the board; new postings during an audit are read, removed ones are skipped |
| One running audit per board per program, and a week before the same board is audited again | Nobody farms rewards by auditing one board over and over |
| A step is paid only if it read postings, never to a funder of the program, at most `per_auditor` times per auditor | Sponsors cannot pay themselves; one wallet cannot drain the pot |
| Rewards, refused payments and returned shares are credited; only `withdraw` sends GEN, only to its caller, all of it at once | No call pays a third party, so on Bradbury nobody can make a transfer to someone else fail for lack of a prepaid fee |
| A validator agrees when everything decided in code matches exactly and the model's answers match on all but one posting in ten | One wavering reading cannot stall an audit; a leader cannot change listed pay, places or more than one answer in ten |
| Anyone can ask once for a fresh reading of any posting; the counts follow | A misreading or a range added later is corrected on-chain |
| Funders live in their own maps; closing does a fixed amount of work and each funder's share is credited by its own `refund` (anyone may send it); top-ups are at least 0.1 GEN | No program can grow so large that closing it strands the funders' GEN |
| Payable calls never revert; they credit the GEN back and return `REFUNDED: <reason>`, including dates that do not exist (2026-02-31) | GenLayer keeps the value of a reverted call |

## The app

- **Bradbury or Studio:** a switch in the header reloads the app on the other network (`?network=bradbury|studio`). MetaMask is
  asked to add or switch to that chain when you connect. On Bradbury, page loads read through a GenLayer node RPC
  (`rpc-bradbury.genlayer.com`), writes carry a fee estimate, and a withdraw carries the prepaid fee of its transfer.
- **Your GEN in PayClear:** what is credited to the connected wallet and a Withdraw button.
- **Check a job board:** paste `greenhouse/figma` or a board link: every posting in scope with its jurisdictions and how it will be read
  (pay listed, read by validators, no pay words, employer's own page), and one click to audit it on-chain.
- **Employers:** every audit with its score ring, the split of postings by result, the postings with no pay shown, every posting the
  validators read with a **read again** button, and every step with who ran it, what it paid and its packet hash. A running audit has a
  **Read the next 25** button that pays the program's reward.
- **Programs:** the reward per step, the pot, a fund box, and after the last day each funder's share with a button to return it.
- **Studio's 30 requests per minute:** page loads read the registry server-side (programs, audits, their funders and results), CDN-cached,
  on both networks.

## Run it

```bash
pip install -r requirements.txt
python3 scripts/bradbury_source.py --check  # the Bradbury file is the Studio file with the Bradbury header
genvm-lint check contracts/pay_clear.py && genvm-lint check contracts/pay_clear.bradbury.py
pytest tests/direct/ -v                     # 42 tests under the Studio runner

# the same 42 tests under the Bradbury runner (a separate venv: genlayer-test 0.30 reads GenVM Manager v0.6.0-rc10)
pip install "genlayer-test==0.30.0rc2" && PAYCLEAR_NETWORK=bradbury pytest tests/direct/ -v

npm install                                 # postinstall fixes two fee-policy reads in genlayer-js 2.0.0-rc.2
node scripts/deploy-bradbury.mjs            # keys in ~/.config/genlayer-demos/payclear-bradbury-*.json
node scripts/verify-code-bradbury.mjs <address>
node scripts/demo-bradbury.mjs <address>    # the Bradbury run above
node scripts/deploy.mjs && node scripts/verify-code.mjs <address> && node scripts/demo.mjs <address>   # Studio
node scripts/reproduction.mjs               # regenerate docs/REPRODUCTION.md

cd frontend && npm run dev                  # NEXT_PUBLIC_BRADBURY_CONTRACT / NEXT_PUBLIC_STUDIO_CONTRACT override the addresses
```

## Limits, stated plainly

- PayClear reads Greenhouse and Ashby public boards. Employers on other systems, or whose postings live only on their own site, are not
  covered; postings whose public page is the employer's own site are unverified unless the board's copy shows pay.
- Locations are read from the posting's location text (and Ashby's address). Unusual location strings may be read as out of scope; any
  posting can be read again.
- "Remote, US" and "North America" postings are counted under Colorado's law, which covers remote jobs open to its residents.
- The audit records what postings show, not whether an employer must disclose: the laws' headcount thresholds are shown for context only.
- The demo program is funded by test wallets; the auditors are test wallets.
- Bradbury is a testnet. A round can end without a decision when the leader runs out of time; nothing changes and the app says to
  send it again. Bradbury reports a transaction's decision and execution result but not the contract's return value or message,
  so the app reads results back from the contract (and checks the usual refusals before sending).
- A withdraw sent to Bradbury without the prepaid transfer fee (for example from a script that leaves it out) completes, but the
  transfer is dropped; the app and `scripts/bradbury.mjs` always add it.

MIT licensed.
