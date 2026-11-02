/** Types and display helpers for the PayClear contract. */

type Num = string | number | bigint;

export type Code = "out_of_scope" | "range_listed" | "range_text" | "no_range" | "unverified" | "unclear";

export interface Program {
  id: string;
  sponsor: string;
  title: string;
  ends: string;
  reward: Num;
  per_auditor: Num;
  state: "open" | "closed";
  pot: Num;
  funded_total: Num;
  paid_total: Num;
  returnable: Num;
  returned_total: Num;
  n_funders: Num;
  n_refunded: Num;
  n_audits: Num;
  n_steps: Num;
  created_at: string;
  history_json: string;
  /** Not stored on the program: attached by the registry snapshot from get_funders. */
  funders?: FunderRow[];
}

export interface FunderRow {
  address: string;
  amount: string;
  refunded: boolean;
}

export interface Audit {
  id: string;
  program_id: string;
  ats: "greenhouse" | "ashby";
  board: string;
  employer: string;
  opener: string;
  opened_at: string;
  state: "running" | "done";
  last_key: string;
  board_size: Num;
  n_steps: Num;
  n_read: Num;
  n_scope: Num;
  n_listed: Num;
  n_text: Num;
  n_missing: Num;
  n_unverified: Num;
  n_unclear: Num;
  finished_at: string;
  missing_json: string;
  steps_json: string;
  /** Not stored on the audit: attached by the registry snapshot from get_results. */
  results?: Result[];
}

export interface Result {
  id: string;
  title: string;
  location: string;
  states: string[];
  url: string;
  code: Code;
  pay?: string;
  snippets_sha256?: string;
  rechecked?: boolean;
  before?: Code;
  removed?: boolean;
}

export interface Step {
  at: string;
  by: string;
  read: number;
  packet: string;
  results: string;
  paid: string;
}

export const RESPONSE_STEP = 25;
export const MIN_FUND_WEI = 10n ** 17n;
export const MIN_REWARD_WEI = 10n ** 16n;

/** US jurisdictions with pay-in-posting laws, as the contract encodes them. */
export const LAWS: Record<string, string> = {
  CA: "California · Labor Code 432.3 · 15+ employees",
  CO: "Colorado · Equal Pay for Equal Work Act · 1+ employee, incl. remote jobs open to Colorado",
  DC: "District of Columbia · Wage Transparency Act · all employers",
  HI: "Hawaii · HRS 378-2.4 · 50+ employees",
  IL: "Illinois · Equal Pay Act amendment · 15+ employees",
  MA: "Massachusetts · Frances Perkins Workplace Equity Act · 25+ employees",
  MD: "Maryland · Wage Range Transparency Act · all employers",
  MN: "Minnesota · Statute 181.173 · 30+ employees",
  NJ: "New Jersey · Pay Transparency Act · 10+ employees",
  NY: "New York · Labor Law 194-b · 4+ employees",
  VT: "Vermont · Act 155 · 5+ employees",
  WA: "Washington · Equal Pay and Opportunities Act · 15+ employees",
  "US-REMOTE": "US remote · open to Colorado residents, so inside Colorado's law",
};

export const CODE_STYLE: Record<Code, { label: string; cls: string; help: string }> = {
  range_listed: { label: "Pay listed", cls: "tag-ok", help: "The job board's own pay field holds a range." },
  range_text: { label: "Pay in the ad", cls: "tag-ok", help: "Validators read a pay range in the posting's text." },
  no_range: { label: "No pay shown", cls: "tag-no", help: "The posting is on the board's own page and shows no pay." },
  unverified: { label: "Unverified", cls: "tag-maybe", help: "No pay in the board's copy, but the public page is the employer's own site: not counted." },
  unclear: { label: "Unclear", cls: "tag-maybe", help: "Validators could not tell from the pay passages." },
  out_of_scope: { label: "Out of scope", cls: "tag-out", help: "Not located in a jurisdiction with a pay-in-posting law." },
};

export function wei(v: Num | undefined): bigint {
  try {
    return BigInt(String(v ?? "0").split(".")[0]);
  } catch {
    return 0n;
  }
}

export function formatGen(v: Num | undefined, digits = 2): string {
  const n = Number(wei(v)) / 1e18;
  return n.toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: 0 });
}

export function parseGen(input: string): bigint | null {
  const t = input.trim();
  if (!/^\d+(\.\d{1,18})?$/.test(t)) return null;
  const [whole, frac = ""] = t.split(".");
  return BigInt(whole) * 10n ** 18n + BigInt((frac + "0".repeat(18)).slice(0, 18));
}

export function parseJson<T>(json: string | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export const sameAddress = (a?: string | null, b?: string | null) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
export const short = (a: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
export const todayUtc = () => new Date().toISOString().slice(0, 10);
export const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
export const stepsOf = (a: Audit) => parseJson<Step[]>(a.steps_json, []);
export const missingOf = (a: Audit) => parseJson<{ id: string; title: string; location: string; url: string }[]>(a.missing_json, []);
export const fundersOf = (p: Program): FunderRow[] => p.funders ?? [];
export const isFunder = (p: Program, a?: string | null) => !!a && fundersOf(p).some((f) => sameAddress(f.address, a));
export const funderRow = (p: Program, a?: string | null) => (a ? fundersOf(p).find((f) => sameAddress(f.address, a)) : undefined);
export const boardUrl = (ats: string, board: string) => (ats === "ashby" ? `https://jobs.ashbyhq.com/${board}` : `https://job-boards.greenhouse.io/${board}`);

/** Postings that show pay, out of those whose public page could be checked (unverified and unclear are left out). */
export function scoreOf(a: Audit): number | null {
  const shown = Number(a.n_listed) + Number(a.n_text);
  const decided = shown + Number(a.n_missing);
  return decided ? shown / decided : null;
}

/** Accepts "greenhouse/figma", "ashby/linear", or a public board link. */
export function boardFrom(input: string): { ats: "greenhouse" | "ashby"; board: string } | null {
  const t = input.trim().toLowerCase();
  let m = t.match(/(?:job-boards|boards)(?:\.eu)?\.greenhouse\.io\/([a-z0-9][a-z0-9._-]{1,60})/);
  if (m) return { ats: "greenhouse", board: m[1] };
  m = t.match(/jobs\.ashbyhq\.com\/([a-z0-9][a-z0-9._-]{1,60})/);
  if (m) return { ats: "ashby", board: m[1] };
  m = t.match(/^(greenhouse|ashby)[\/: ]([a-z0-9][a-z0-9._-]{1,60})$/);
  if (m) return { ats: m[1] as "greenhouse" | "ashby", board: m[2] };
  return null;
}
