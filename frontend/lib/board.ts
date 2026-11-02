/**
 * The contract's board-reading rules, in TypeScript, for the wallet-free preview: postings, locations, structured
 * pay and pay passages. Whether a passage states pay is left to the validators (marked "to be read").
 */

export const COVERED = new Set(["CA", "CO", "DC", "HI", "IL", "MA", "MD", "MN", "NJ", "NY", "VT", "WA", "US-REMOTE"]);

const STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};
const NAMES: Record<string, string> = Object.fromEntries(Object.entries(STATES).map(([k, v]) => [v.toLowerCase(), k]));
const CITIES: Record<string, string> = {
  "san francisco": "CA", "bay area": "CA", "los angeles": "CA", "san diego": "CA", "san jose": "CA", "palo alto": "CA",
  "mountain view": "CA", seattle: "WA", bellevue: "WA", "new york city": "NY", nyc: "NY", brooklyn: "NY", denver: "CO",
  boulder: "CO", chicago: "IL", boston: "MA", "cambridge, ma": "MA", minneapolis: "MN", baltimore: "MD", honolulu: "HI",
  austin: "TX", atlanta: "GA", miami: "FL", "portland, or": "OR",
};
const FOREIGN = [
  "tel aviv", "tel-aviv", "jerusalem", "haifa", "herzliya", "ramat gan", "petah tikva", "bogota", "bogotá", "medellin", "medellín",
  "cali", "barranquilla", "casablanca", "rabat", "perth", "sydney", "melbourne", "brisbane", "adelaide", "toronto", "vancouver",
  "montreal", "montréal", "ottawa", "calgary", "waterloo", "mumbai", "bengaluru", "bangalore", "hyderabad", "pune", "london",
  "dublin", "berlin", "paris", "amsterdam", "madrid", "lisbon", "tokyo", "singapore",
];
const CA_PROVINCES = new Set(["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"]);
const US_WORDS = /\b(us|u\.s\.|usa|u\.s\.a\.|united states|united states of america|north america|americas)\b/i;
const US_WORDS_FULL = /^(us|u\.s\.|usa|u\.s\.a\.|united states|united states of america|north america|americas)$/i;
const PAY_HINT = /(\$\s?\d|\busd\b|salary|base pay|pay range|pay rate|hourly rate|compensation range|wage|on[- ]target|\bote\b)/gi;
const HOSTED = new Set(["job-boards.greenhouse.io", "boards.greenhouse.io", "job-boards.eu.greenhouse.io", "boards.eu.greenhouse.io", "jobs.ashbyhq.com"]);
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function segmentStates(seg: string): Set<string> {
  const s = seg.trim();
  const low = s.toLowerCase();
  const found = new Set<string>();
  if (!s) return found;
  if (/\b(washington,?\s*d\.?\s?c\.?|district of columbia)\b/.test(low)) return new Set(["DC"]);
  if (FOREIGN.some((c) => new RegExp(`\\b${esc(c)}\\b`).test(low))) return found;
  for (const [city, st] of Object.entries(CITIES)) if (new RegExp(`\\b${esc(city)}\\b`).test(low)) found.add(st);
  const parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    let last = parts[parts.length - 1];
    const before = parts[parts.length - 2];
    if (["canada", "can"].includes(last.toLowerCase()) || (last.toUpperCase() === "CA" && CA_PROVINCES.has(before.toUpperCase()))) return new Set();
    if (US_WORDS_FULL.test(last)) last = before;
    if (last.length === 2 && STATES[last.toUpperCase()]) found.add(last.toUpperCase());
    else if (NAMES[last.toLowerCase()]) found.add(NAMES[last.toLowerCase()]);
  } else if (NAMES[low]) found.add(NAMES[low]);
  if (!found.size && /\bremote\b/.test(low) && US_WORDS.test(low)) found.add("US-REMOTE");
  if (!found.size && US_WORDS_FULL.test(s)) found.add("US-REMOTE");
  return found;
}

export function jurisdictions(location: string): string[] {
  const out = new Set<string>();
  for (const seg of (location || "").split(/[;•|/\n]| or | and /)) segmentStates(seg).forEach((x) => out.add(x));
  return [...out].sort();
}

export const covered = (states: string[]) => states.filter((s) => COVERED.has(s));

function plain(text: string): string {
  const decode = (t: string) =>
    t.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
  return decode(decode(text || ""))
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function paySnippets(text: string): string[] {
  const out: [number, string][] = [];
  for (const m of text.matchAll(PAY_HINT)) {
    const start = Math.max(0, (m.index ?? 0) - 160);
    if (!out.length || start > out[out.length - 1][0] + 300) out.push([start, text.slice(start, (m.index ?? 0) + 220)]);
    if (out.length === 3) break;
  }
  return out.map(([, s]) => s);
}

export type Preview = {
  id: string;
  title: string;
  location: string;
  states: string[];
  url: string;
  pay: string;
  status: "out_of_scope" | "range_listed" | "no_range" | "to_read" | "unverified_if_none";
  snippets: string[];
};

export function boardApi(ats: string, board: string) {
  return ats === "greenhouse"
    ? `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true&pay_transparency=true`
    : `https://api.ashbyhq.com/posting-api/job-board/${board}?includeCompensation=true`;
}

export function preview(ats: string, data: any): { employer: string; rows: Preview[] } {
  const jobs: any[] = Array.isArray(data?.jobs) ? data.jobs : [];
  const rows: Preview[] = [];
  let employer = "";
  for (const j of jobs) {
    if (!j || !String(j.id ?? "")) continue;
    let location = "", pay = "", text = "", url = "";
    let states: string[] = [];
    if (ats === "greenhouse") {
      employer ||= String(j.company_name || "");
      location = String(j.location?.name || "");
      states = jurisdictions(location);
      const ranges = (j.pay_input_ranges || []).filter((r: any) => Number(r?.max_cents) > 0);
      pay = ranges.map((r: any) => `${Math.floor(Number(r.min_cents || 0) / 100).toLocaleString("en-US")}-${Math.floor(Number(r.max_cents) / 100).toLocaleString("en-US")} ${r.currency_type || ""}`.trim()).join("; ");
      text = plain(String(j.content || ""));
      url = String(j.absolute_url || "");
    } else {
      const addr = j.address?.postalAddress || {};
      const locs = [String(j.location || ""), ...(j.secondaryLocations || []).map((x: any) => String(x?.location || ""))];
      const regions = [[addr.addressRegion, addr.addressCountry], ...(j.secondaryLocations || []).map((x: any) => [x?.address?.postalAddress?.addressRegion, x?.address?.postalAddress?.addressCountry])];
      const set = new Set<string>();
      locs.forEach((l) => jurisdictions(l).forEach((x) => set.add(x)));
      for (const [region, country] of regions) {
        if (["USA", "US", "United States"].includes(String(country || ""))) {
          const r = String(region || "");
          set.add(STATES[r.toUpperCase()] && r.length === 2 ? r.toUpperCase() : NAMES[r.toLowerCase()] || "US-REMOTE");
        }
      }
      if (j.isRemote && regions.some(([, c]) => ["USA", "US", "United States"].includes(String(c || "")))) set.add("US-REMOTE");
      states = [...set].sort();
      location = locs.filter(Boolean).join(" / ");
      const summary = String(j.compensation?.scrapeableCompensationSalarySummary || "");
      pay = j.shouldDisplayCompensationOnJobPostings && /\d/.test(summary) ? summary : "";
      text = plain(String(j.descriptionPlain || j.descriptionHtml || ""));
      url = String(j.jobUrl || "");
    }
    const scope = covered(states);
    const snippets = scope.length && !pay ? paySnippets(text) : [];
    let host = "";
    try {
      host = new URL(url).host.toLowerCase();
    } catch {}
    const hosted = ats === "ashby" || HOSTED.has(host);
    const status: Preview["status"] = !scope.length ? "out_of_scope" : pay ? "range_listed" : snippets.length ? "to_read" : hosted ? "no_range" : "unverified_if_none";
    rows.push({ id: String(j.id), title: String(j.title || "").slice(0, 120), location: location.slice(0, 200), states: scope, url, pay, status, snippets });
  }
  rows.sort((a, b) => a.id.length - b.id.length || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { employer, rows };
}
