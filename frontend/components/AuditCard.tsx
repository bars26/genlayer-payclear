"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Play, RotateCcw } from "lucide-react";
import {
  CODE_STYLE,
  LAWS,
  boardUrl,
  formatGen,
  missingOf,
  scoreOf,
  short,
  stepsOf,
  wei,
  type Audit,
  type Code,
  type Program,
} from "@/lib/contracts/types";
import { usePayClearWrite } from "@/lib/hooks/usePayClear";
import { useWallet } from "@/lib/genlayer/wallet";
import { Button } from "./ui/button";

function Ring({ value }: { value: number | null }) {
  const pct = value === null ? 0 : Math.round(value * 100);
  const r = 30;
  const c = 2 * Math.PI * r;
  const color = value === null ? "#8A94A3" : pct >= 90 ? "#1E9E6A" : pct >= 60 ? "#B7791F" : "#D94A38";
  return (
    <svg width="78" height="78" viewBox="0 0 78 78" role="img" aria-label={value === null ? "no score yet" : `${pct}% show pay`}>
      <circle cx="39" cy="39" r={r} fill="none" stroke="#E2E8EF" strokeWidth="8" />
      <circle cx="39" cy="39" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 39 39)" />
      <text x="39" y="44" textAnchor="middle" fontSize="17" fontWeight="700" fill="#0E1E33" fontFamily="var(--font-sora)">
        {value === null ? "—" : `${pct}%`}
      </text>
    </svg>
  );
}

const ORDER: Code[] = ["no_range", "unverified", "unclear", "range_text", "range_listed", "out_of_scope"];

export function AuditCard({ audit, program }: { audit: Audit; program?: Program }) {
  const { isConnected } = useWallet();
  const { writeAsync, pending } = usePayClearWrite();
  const [showAll, setShowAll] = useState(false);
  const score = scoreOf(audit);
  const steps = stepsOf(audit);
  const missing = missingOf(audit);
  const read = Number(audit.n_read);
  const size = Math.max(Number(audit.board_size), read);
  const results = (audit.results ?? []).filter((r) => showAll || r.code !== "out_of_scope").sort((a, b) => ORDER.indexOf(a.code) - ORDER.indexOf(b.code));
  const paidTotal = steps.reduce((t, s) => t + wei(s.paid), 0n);
  const bars: [Code, number][] = [
    ["range_listed", Number(audit.n_listed)],
    ["range_text", Number(audit.n_text)],
    ["no_range", Number(audit.n_missing)],
    ["unverified", Number(audit.n_unverified)],
    ["unclear", Number(audit.n_unclear)],
  ];
  const scope = Math.max(Number(audit.n_scope), 1);
  const colors: Record<string, string> = { range_listed: "#1E9E6A", range_text: "#6FCB9F", no_range: "#D94A38", unverified: "#E0B25C", unclear: "#C9B98E" };

  return (
    <section id={audit.id} className="brand-card overflow-hidden animate-fade-in">
      <div className="p-5 sm:p-6 flex flex-wrap items-start gap-4">
        <Ring value={score} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="label-tag">
            {audit.id} · {audit.ats} · {audit.state === "running" ? `running · ${read} of ~${size} read` : `done ${audit.finished_at.slice(0, 10)}`}
          </p>
          <a href={boardUrl(audit.ats, audit.board)} target="_blank" rel="noreferrer" className="display text-[28px] font-bold leading-tight hover:underline inline-flex items-center gap-2">
            {audit.employer} <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
          <p className="text-sm text-muted-foreground">
            {Number(audit.n_listed) + Number(audit.n_text)} of {Number(audit.n_listed) + Number(audit.n_text) + Number(audit.n_missing)} checkable postings in
            pay-transparency states show pay · {read} postings read in {String(audit.n_steps)} step{Number(audit.n_steps) === 1 ? "" : "s"}
            {paidTotal > 0n && <> · {formatGen(paidTotal, 4)} GEN paid to auditors</>}
          </p>
        </div>
        {audit.state === "running" && (
          <Button size="sm" disabled={!isConnected || !!pending} onClick={() => writeAsync({ kind: "step", auditId: audit.id }).catch(() => {})}>
            {pending === `step:${audit.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Read the next 25{program && wei(program.pot) >= wei(program.reward) ? ` · +${formatGen(program.reward, 4)} GEN` : ""}
          </Button>
        )}
      </div>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4">
        <div>
          <div className="flex h-3 overflow-hidden rounded-full bg-[#E2E8EF]" role="img" aria-label="postings in scope by result">
            {bars.map(([code, n]) => n > 0 && <div key={code} style={{ width: `${(n * 100) / scope}%`, background: colors[code] }} />)}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {bars.map(([code, n]) => (
              <span key={code} className={CODE_STYLE[code].cls} title={CODE_STYLE[code].help}>
                {CODE_STYLE[code].label} {n}
              </span>
            ))}
            <span className="tag-out">Out of scope {read - Number(audit.n_scope)}</span>
          </div>
        </div>

        {missing.length > 0 && (
          <div className="space-y-1.5">
            <p className="label-tag">postings with no pay shown</p>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {missing.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center gap-2 px-3 py-1.5 text-sm">
                  <a href={m.url} target="_blank" rel="noreferrer" className="truncate hover:underline">
                    {m.title}
                  </a>
                  <span className="ml-auto text-xs text-muted-foreground truncate max-w-[40%]">{m.location}</span>
                </li>
              ))}
              {missing.length > 6 && <li className="px-3 py-1.5 text-xs text-muted-foreground">and {missing.length - 6} more below</li>}
            </ul>
          </div>
        )}

        <details className="text-sm perf pt-3">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Every posting the validators read, and how</summary>
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" className="accent-[#0E1E33]" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> include postings out of scope
            </label>
            <ul className="divide-y divide-border rounded-lg border border-border max-h-80 overflow-auto">
              {results.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-2 px-3 py-1.5">
                  <span className={CODE_STYLE[r.code].cls} title={CODE_STYLE[r.code].help}>
                    {CODE_STYLE[r.code].label}
                  </span>
                  <a href={r.url} target="_blank" rel="noreferrer" className="truncate max-w-[50%] hover:underline">
                    {r.title}
                  </a>
                  <span className="mono text-[11px] text-muted-foreground" title={r.states.map((s) => LAWS[s] ?? s).join("\n")}>
                    {r.states.join(" ") || r.location.slice(0, 30)}
                  </span>
                  {r.pay && <span className="mono text-[11px] text-[#0F6B47]">{r.pay}</span>}
                  {r.rechecked && <span className="text-[11px] text-muted-foreground">read again{r.before ? ` (was ${CODE_STYLE[r.before]?.label ?? r.before})` : ""}</span>}
                  {!r.rechecked && r.code !== "out_of_scope" && (
                    <button
                      type="button"
                      className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40"
                      disabled={!isConnected || !!pending}
                      onClick={() => writeAsync({ kind: "recheck", auditId: audit.id, postingId: r.id }).catch(() => {})}
                      title="Ask the validators to read this posting again (once)"
                    >
                      {pending === `recheck:${audit.id}:${r.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />} read again
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div>
              <p className="label-tag mb-1">steps (each stored on-chain with a packet hash)</p>
              {steps.map((s, i) => (
                <p key={i} className="mono text-[11px] text-muted-foreground break-all">
                  #{i + 1} {s.at} UTC · {s.read} read · by {short(s.by)} · {wei(s.paid) > 0n ? `paid ${formatGen(s.paid, 4)} GEN` : "unpaid"} · packet {s.packet.slice(0, 12)}… · results{" "}
                  {s.results.slice(0, 12)}…
                </p>
              ))}
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
