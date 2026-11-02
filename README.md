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
scope and how it will be read. Writes need MetaMask on GenLayer Studio (chain 61999); **Test GEN** funds your wallet.

**Contract:** [`0x42E002dc4360752C37408F6755c6E0f94716dBfc`](https://explorer-studio.genlayer.com/address/0x42E002dc4360752C37408F6755c6E0f94716dBfc) on GenLayer Studio.

## Why GenLayer

- **Reading the ad.** Whether "$160,000 to $190,000" is this job's salary and "nearly $1B annually" is not, is a reading of free text.
  Every validator reads the same passages and must agree on one answer per posting.
- **Rules where rules belong.** Locations, the twelve laws, listed pay fields and the hosted-page test are code, applied by every
  validator to the same board; the model only reads what code cannot.
- **Anyone can audit, nobody can fake it.** The result is consensus over the employer's own public board, step by step, with hashes of
  what was read; there is no operator whose spreadsheet you have to trust.

## Verified live, on real job boards

`scripts/demo.mjs` funded a demo program with test wallets and audited real boards. Every step, packet hash and the balance
reconciliation are in [`docs/REPRODUCTION.md`](docs/REPRODUCTION.md).

| Employer (board) | Postings read | In pay-transparency places | Show pay | No pay shown | Score | What it shows |
|---|---|---|---|---|---|---|
| [Figma](https://job-boards.greenhouse.io/figma) (Greenhouse) | 140 | 94 | 93 | **1** | **98.9%** | 93 postings carry Greenhouse's pay-range field; "Brand Designer, Web" (San Francisco, New York, US remote) has none. Read again on request: still none. Offices abroad are out of scope |
| [Supabase](https://jobs.ashbyhq.com/supabase) (Ashby) | 68 | 5 | 1 | **4** | **20%** | Most postings are outside the US. The US ones mention "Over $1B raised": validators read that as funding, not pay |
| [Linear](https://jobs.ashbyhq.com/linear) (Ashby) | 31 | 17 | 0 | **17** | **0%** | 17 "North America" remote postings, none with pay; remote US jobs fall under Colorado's law |
| [Airtable](https://job-boards.greenhouse.io/airtable) (Greenhouse) | 5 | 4 | 4 | 0 | **100%** | Pay ranges written in the text of each ad, read by the validators |
| [Asana](https://www.asana.com/jobs) (Greenhouse, own career site) | 110 | 47 | 47 | 0 | **100%** | Every US posting states its range in the text; the public pages are Asana's own site, which matters only when no range is found |

The audits ran in 17 steps of up to 25 postings, run by two test wallets and paid 0.05 GEN each from the program's pot. Also refused,
with the GEN sent back: a program ending on 2026-02-31, a reward below 0.01 GEN, a cap of 0 steps, a pot below 0.1 GEN and a 0.05 GEN
top-up. And refused by the contract: a Lever board (only Greenhouse and Ashby), a board that does not exist, a second audit of a board
while one is running, a second audit of the same board within a week, a second fresh reading of the same posting, and closing the
program before its last day. The contract's balance was reconciled with `totals()` at three points of the run, each time after every
transfer had finalized.

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
| Anyone can ask once for a fresh reading of any posting; the counts follow | A misreading or a range added later is corrected on-chain |
| Funders live in their own maps; closing does a fixed amount of work and each funder is repaid by their own `refund`; top-ups are at least 0.1 GEN | No program can grow so large that closing it strands the funders' GEN |
| Payable calls never revert; they refund and return `REFUNDED: <reason>`, including dates that do not exist (2026-02-31) | GenLayer keeps the value of a reverted call |

## The app

- **Check a job board:** paste `greenhouse/figma` or a board link: every posting in scope with its jurisdictions and how it will be read
  (pay listed, read by validators, no pay words, employer's own page), and one click to audit it on-chain.
- **Employers:** every audit with its score ring, the split of postings by result, the postings with no pay shown, every posting the
  validators read with a **read again** button, and every step with who ran it, what it paid and its packet hash. A running audit has a
  **Read the next 25** button that pays the program's reward.
- **Programs:** the reward per step, the pot, a fund box, and after the last day each funder's share with a button to return it.
- **Studio's 30 requests per minute:** page loads read the registry server-side (programs, audits, their funders and results), CDN-cached.

## Run it

```bash
pip install -r requirements.txt
genvm-lint check contracts/pay_clear.py
pytest tests/direct/ -v                     # 39 tests: boards, locations, the model's answers and payouts mocked

npm install
node scripts/deploy.mjs
node scripts/verify-code.mjs <address>
node scripts/demo.mjs <address>             # the live run above
node scripts/reproduction.mjs               # regenerate docs/REPRODUCTION.md

cd frontend && cp .env.example .env.local && npm run dev
```

## Limits, stated plainly

- PayClear reads Greenhouse and Ashby public boards. Employers on other systems, or whose postings live only on their own site, are not
  covered; postings whose public page is the employer's own site are unverified unless the board's copy shows pay.
- Locations are read from the posting's location text (and Ashby's address). Unusual location strings may be read as out of scope; any
  posting can be read again.
- "Remote, US" and "North America" postings are counted under Colorado's law, which covers remote jobs open to its residents.
- The audit records what postings show, not whether an employer must disclose: the laws' headcount thresholds are shown for context only.
- The demo program is funded by test wallets; the auditors are test wallets.

MIT licensed.
