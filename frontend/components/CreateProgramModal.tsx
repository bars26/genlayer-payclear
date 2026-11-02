"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { MIN_FUND_WEI, MIN_REWARD_WEI, addDays, formatGen, parseGen, todayUtc } from "@/lib/contracts/types";
import { usePayClearWrite } from "@/lib/hooks/usePayClear";
import { useWallet } from "@/lib/genlayer/wallet";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const realDay = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;

/** Fund an audit program: anyone who runs an audit step is paid from its pot. */
export function CreateProgramModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { isConnected } = useWallet();
  const { writeAsync, pending } = usePayClearWrite();
  const [f, setF] = useState({ title: "US pay transparency audits", ends: addDays(todayUtc(), 60), reward: "0.05", perAuditor: "40", fund: "2" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const reward = parseGen(f.reward);
  const fund = parseGen(f.fund);
  const problems = [
    !(f.title.trim().length >= 3 && f.title.trim().length <= 80) && "The title must be 3 to 80 characters.",
    !(realDay(f.ends) && f.ends >= todayUtc()) && "The last day must be a real date, today or later.",
    !(reward && reward >= MIN_REWARD_WEI) && "The reward per step must be at least 0.01 GEN.",
    !(/^\d{1,4}$/.test(f.perAuditor) && Number(f.perAuditor) >= 1 && Number(f.perAuditor) <= 1000) && "Steps per auditor must be 1 to 1000.",
    !(fund && reward && fund >= reward && fund >= MIN_FUND_WEI) && "Fund at least one reward and at least 0.1 GEN.",
  ].filter(Boolean) as string[];
  const steps = reward && fund && reward > 0n ? Number(fund / reward) : 0;

  const submit = async () => {
    if (!reward || !fund) return;
    try {
      await writeAsync({ kind: "create", input: { title: f.title.trim(), ends: f.ends, reward, perAuditor: Number(f.perAuditor) }, fund });
      onOpenChange(false);
    } catch {
      // shown in the toast and the transactions panel
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="display text-2xl">Fund an audit program</DialogTitle>
          <DialogDescription>
            Anyone can audit an employer&apos;s job board; your pot pays them for each step of 25 postings the validators read. What is left after the last day
            comes back to the funders.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={f.title} onChange={set("title")} maxLength={80} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Reward per step (GEN)</Label>
              <Input value={f.reward} onChange={set("reward")} inputMode="decimal" />
            </div>
            <div className="space-y-1">
              <Label>Steps per auditor</Label>
              <Input value={f.perAuditor} onChange={set("perAuditor")} inputMode="numeric" />
            </div>
            <div className="space-y-1">
              <Label>Last day</Label>
              <Input type="date" value={f.ends} onChange={set("ends")} />
            </div>
            <div className="space-y-1">
              <Label>Fund now (GEN)</Label>
              <Input value={f.fund} onChange={set("fund")} inputMode="decimal" />
            </div>
          </div>
          <p className="text-sm rounded-lg bg-[#F3F6F9] p-3">
            Pays for up to <strong>{steps}</strong> steps, about {steps * 25} postings read. Funders are never paid for their own steps.
          </p>
          {problems.length > 0 && (
            <ul className="text-sm text-destructive list-disc pl-5">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          <Button className="w-full" onClick={submit} disabled={!isConnected || problems.length > 0 || pending === "create"}>
            {pending === "create" && <Loader2 className="h-4 w-4 animate-spin" />}
            {isConnected ? `Fund ${fund ? formatGen(fund, 4) : "?"} GEN and open the program` : "Connect a wallet to fund a program"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
