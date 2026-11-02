"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, Loader2, Search } from "lucide-react";
import { boardFrom, boardUrl, formatGen, scoreOf, todayUtc, type Audit, type Program } from "@/lib/contracts/types";
import type { Preview } from "@/lib/board";
import { usePayClearWrite } from "@/lib/hooks/usePayClear";
import { useWallet } from "@/lib/genlayer/wallet";
import { Button } from "./ui/button";

const SAMPLES = ["greenhouse/figma", "ashby/linear", "ashby/supabase", "greenhouse/airtable"];

const STATUS: Record<Preview["status"], { label: string; cls: string }> = {
  range_listed: { label: "Pay listed", cls: "tag-ok" },
  to_read: { label: "Validators read", cls: "tag-maybe" },
  no_range: { label: "No pay shown", cls: "tag-no" },
  unverified_if_none: { label: "Employer's own page", cls: "tag-maybe" },
  out_of_scope: { label: "Out of scope", cls: "tag-out" },
};

type BoardPreview = { ats: string; board: string; employer: string; total: number; rows: Preview[] };

export function BoardChecker({ programs, audits }: { programs: Program[]; audits: Audit[] }) {
  const [input, setInput] = useState("");
  const [target, setTarget] = useState<{ ats: string; board: string } | null>(null);
  const q = useQuery<BoardPreview, Error>({
    queryKey: ["board", target?.ats, target?.board],
    enabled: !!target,
    staleTime: 600_000,
    queryFn: async () => {
      const res = await fetch(`/api/board?ats=${target!.ats}&board=${target!.board}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      return body;
    },
  });
  const { isConnected } = useWallet();
  const { writeAsync, pending } = usePayClearWrite();
  const open = programs.filter((p) => p.state === "open" && todayUtc() <= p.ends);
  const program = open[0];
  const go = (v: string) => {
    setInput(v);
    setTarget(boardFrom(v));
  };
  const d = q.data;
  const scope = d?.rows.filter((r) => r.status !== "out_of_scope") ?? [];
  const count = (s: Preview["status"]) => scope.filter((r) => r.status === s).length;
  const existing = d ? [...audits].reverse().find((a) => a.ats === d.ats && a.board === d.board) : undefined;
  const score = existing ? scoreOf(existing) : null;

  return (
    <div className="brand-card overflow-hidden">
      <div className="stub-head px-5 sm:px-6 py-3 flex items-center justify-between">
        <span className="display text-lg font-semibold">Check a job board</span>
        <span className="label-tag !text-[#9FB0C4]">no wallet needed</span>
      </div>
      <div className="p-5 sm:p-6 space-y-4">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            go(input);
          }}
        >
          <input className="field h-10 mono text-[13px]" placeholder="greenhouse/figma or jobs.ashbyhq.com/linear" value={input} onChange={(e) => setInput(e.target.value)} />
          <Button type="submit" className="h-10" disabled={!boardFrom(input)}>
            <Search className="h-4 w-4" />
            Read
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Try:{" "}
          {SAMPLES.map((s, i) => (
            <span key={s}>
              {i > 0 && " · "}
              <button type="button" className="mono underline decoration-dotted hover:text-foreground" onClick={() => go(s)}>
                {s}
              </button>
            </span>
          ))}
        </p>

        {q.isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Reading the board…
          </p>
        )}
        {q.isError && <p className="text-sm text-destructive">{q.error.message}</p>}

        {d && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="label-tag">
                  {d.ats} · {d.board}
                </p>
                <a href={boardUrl(d.ats, d.board)} target="_blank" rel="noreferrer" className="display text-2xl font-bold hover:underline inline-flex items-center gap-1.5">
                  {d.employer} <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
              {existing && (
                <a href={`#${existing.id}`} className="text-sm">
                  {existing.id} · {existing.state}
                  {score !== null && <span className="tape ml-2">{Math.round(score * 100)}% show pay</span>}
                </a>
              )}
            </div>
            <dl className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              {[
                ["postings", d.total, ""],
                ["in scope", scope.length, ""],
                ["pay listed", count("range_listed"), "text-[#0F6B47]"],
                ["validators read", count("to_read") + count("unverified_if_none"), "text-[#7A520F]"],
                ["no pay words", count("no_range"), "text-[#A33525]"],
              ].map(([k, v, cls]) => (
                <div key={k as string} className="rounded-lg bg-[#F3F6F9] px-2 py-2">
                  <dt className="label-tag">{k}</dt>
                  <dd className={`display text-2xl font-bold ${cls}`}>{v}</dd>
                </div>
              ))}
            </dl>
            {scope.length > 0 && (
              <ul className="divide-y divide-border max-h-56 overflow-auto rounded-lg border border-border">
                {scope.slice(0, 40).map((r) => (
                  <li key={r.id} className="flex items-center gap-2 px-3 py-1.5 text-sm">
                    <span className={STATUS[r.status].cls}>{STATUS[r.status].label}</span>
                    <a href={r.url} target="_blank" rel="noreferrer" className="truncate hover:underline">
                      {r.title}
                    </a>
                    <span className="ml-auto mono text-[11px] text-muted-foreground whitespace-nowrap">{r.states.join(" ")}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="perf pt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground max-w-sm">
                Code decides location and listed pay; validators read the pay passages. On a board&apos;s own page no pay is counted as missing; on an
                employer&apos;s own site it stays unverified.
              </p>
              {program ? (
                <Button
                  size="sm"
                  disabled={!isConnected || !!pending || existing?.state === "running"}
                  onClick={() => writeAsync({ kind: "open", programId: program.id, ats: d.ats, board: d.board }).catch(() => {})}
                >
                  {pending === `open:${d.ats}/${d.board}` && <Loader2 className="h-4 w-4 animate-spin" />}
                  Audit on-chain · earn {formatGen(program.reward, 4)} GEN a step
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">No program is open to pay audit steps.</span>
              )}
            </div>
            {existing?.state === "running" && <p className="text-xs text-muted-foreground">{existing.id} is auditing this board: run its next step below.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
