"use client";

import { useState } from "react";
import { BookOpenCheck, Coins, Loader2, MapPin, RefreshCw, ScanSearch } from "lucide-react";
import { AuditCard } from "@/components/AuditCard";
import { BoardChecker } from "@/components/BoardChecker";
import { CreateProgramModal } from "@/components/CreateProgramModal";
import { Navbar } from "@/components/Navbar";
import { OwedCard } from "@/components/OwedCard";
import { ProgramCard } from "@/components/ProgramCard";
import { TransactionPanel } from "@/components/TransactionPanel";
import { Button } from "@/components/ui/button";
import { LAWS, scoreOf } from "@/lib/contracts/types";
import { useRegistry } from "@/lib/hooks/usePayClear";
import { addressUrl } from "@/lib/network";
import { useNetwork } from "@/lib/useNetwork";

const STEPS = [
  { icon: ScanSearch, title: "Pick a board", body: "Any employer's public Greenhouse or Ashby job board. Anyone opens an audit; no employer sign-up." },
  { icon: MapPin, title: "Where the law applies", body: "Code reads each posting's location: 12 US jurisdictions require pay in job ads, and US-remote jobs fall under Colorado's." },
  { icon: BookOpenCheck, title: "Validators read the ad", body: "Listed pay is read in code; the pay passages of the rest are read by validators. “Competitive pay” and “$1B raised” are not pay." },
  { icon: Coins, title: "A public score", body: "Steps of 25 postings, paid from a program's pot. The result: which postings show pay, kept on-chain with every reading." },
];

export default function HomePage() {
  const { programs, audits, isLoading, isError, error, isFetching, refetch, fetchedAt } = useRegistry();
  const [creating, setCreating] = useState(false);
  const net = useNetwork();
  const ranked = [...audits].sort((a, b) => (scoreOf(a) ?? 2) - (scoreOf(b) ?? 2) || Number(b.id.split("_")[1]) - Number(a.id.split("_")[1]));
  const read = audits.reduce((t, a) => t + Number(a.n_read), 0);
  const missing = audits.reduce((t, a) => t + Number(a.n_missing), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onCreate={() => setCreating(true)} />
      <main className="flex-grow pt-24 pb-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-5 lg:pt-3">
              <p className="label-tag">pay transparency · 12 US jurisdictions · greenhouse + ashby</p>
              <h1 className="display text-[48px] md:text-[64px] font-bold leading-[0.95]">
                Does the job ad
                <br />
                show the <span className="text-[#1E9E6A]">pay</span>?
              </h1>
              <p className="text-lg text-muted-foreground">
                California, Colorado, New York and nine more require a pay range in job postings. PayClear audits an employer&apos;s public job board on
                GenLayer: validators read every posting in those places and record which ones show the pay, with the evidence on-chain.
              </p>
              <dl className="grid grid-cols-3 gap-2">
                {[
                  ["employers audited", audits.length],
                  ["postings read", read],
                  ["no pay shown", missing],
                ].map(([k, v]) => (
                  <div key={k as string} className="brand-card px-3 py-2.5">
                    <dt className="label-tag">{k}</dt>
                    <dd className="display text-3xl font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="lg:col-span-7">
              <BoardChecker programs={programs} audits={audits} />
            </div>
          </section>

          <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-xl border border-border bg-white/70 p-4">
                <p className="flex items-center gap-2">
                  <span className="mono text-xs text-muted-foreground">0{i + 1}</span>
                  <s.icon className="h-4 w-4 text-[#1E9E6A]" />
                  <strong className="display text-base">{s.title}</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-1.5">{s.body}</p>
              </div>
            ))}
          </section>
          <p className="text-xs text-muted-foreground -mt-6">
            An audit measures what postings show, not whether an employer is legally bound (most laws apply above a headcount). Checking a board needs no wallet;
            to run steps, connect MetaMask and get test GEN ({net.id === "studio" ? "Test GEN button" : "Faucet link"}). The program below is a demo funded by test
            wallets; the boards are real. The same contract runs on Bradbury testnet and on GenLayer Studio: switch at the top.
          </p>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-end justify-between gap-3">
                <h2 className="display text-3xl font-bold">Employers</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {fetchedAt && <span>updated {new Date(fetchedAt).toLocaleTimeString()}</span>}
                  <Button size="sm" variant="ghost" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh">
                    <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
              {isLoading && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Reading the audits from {net.label}…
                </p>
              )}
              {isError && <p className="text-destructive text-sm">Could not read the contract: {error?.message}</p>}
              {!isLoading && ranked.length === 0 && <div className="brand-card p-6 text-center text-muted-foreground">No audits yet: check a board above and audit it.</div>}
              {ranked.map((a) => (
                <AuditCard key={a.id} audit={a} program={programs.find((p) => p.id === a.program_id)} />
              ))}
            </div>
            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              <OwedCard />
              {[...programs].reverse().map((p) => (
                <ProgramCard key={p.id} program={p} />
              ))}
              {programs.length === 0 && !isLoading && (
                <div className="brand-card p-5 text-sm space-y-3">
                  <p>No program funds audit steps yet.</p>
                  <Button size="sm" onClick={() => setCreating(true)}>
                    Fund a program
                  </Button>
                </div>
              )}
              <div className="brand-card p-5 space-y-2 text-sm">
                <h3 className="display text-lg font-bold">Where postings must show pay</h3>
                <ul className="space-y-1">
                  {Object.entries(LAWS).map(([k, v]) => (
                    <li key={k} className="flex gap-2">
                      <span className="mono text-xs font-bold w-16 shrink-0 pt-0.5">{k}</span>
                      <span className="text-muted-foreground text-xs">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <TransactionPanel />
            </aside>
          </section>
        </div>
      </main>
      <footer className="border-t border-border py-6 px-4 text-center text-xs text-muted-foreground space-y-1">
        <p>
          PayClear on {net.label} ·{" "}
          <a className="underline mono" href={addressUrl(net, net.contract)} target="_blank" rel="noreferrer">
            {net.contract.slice(0, 6)}…{net.contract.slice(-4)}
          </a>{" "}
          · postings read from the public Greenhouse and Ashby job board APIs. An audit is a record of what postings show, not legal advice.
        </p>
        <p>
          <a className="underline" href="https://github.com/bars26/genlayer-payclear" target="_blank" rel="noreferrer">
            Source and reproduction on GitHub
          </a>
        </p>
      </footer>
      <CreateProgramModal open={creating} onOpenChange={setCreating} />
    </div>
  );
}
