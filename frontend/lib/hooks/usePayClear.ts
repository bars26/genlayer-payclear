"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import PayClear, { type CreateProgramInput, type TxProgress, type TxResult } from "../contracts/PayClear";
import { formatGen, sameAddress, todayUtc, type Audit, type Program } from "../contracts/types";
import { isOnGenLayerNetwork, switchToGenLayerNetwork } from "../genlayer/client";
import { useWallet } from "../genlayer/wallet";
import { currentNetwork } from "../network";
import { TxError, classifyError } from "../utils/errors";
import { error, success } from "../utils/toast";
import { startTx, updateTx, type TxKind } from "./useTxLog";

export function usePayClearContract(): PayClear | null {
  const { address } = useWallet();
  const network = currentNetwork();
  return useMemo(() => (/^0x[0-9a-fA-F]{40}$/.test(network.contract) ? new PayClear(network, address) : null), [network, address]);
}

const registryKey = () => ["registry", currentNetwork().id];

type Registry = { programs: Program[]; audits: Audit[]; fetchedAt?: string };

async function fetchJson(url: string, timeoutMs = 25_000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const res = await fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(timer));
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `HTTP ${res.status}`);
  return body;
}

/**
 * Every program and audit, from the CDN-cached server snapshot (app/api/registry), so page
 * loads spend none of the visitor's Studio rate-limit budget. Falls back to two direct reads.
 */
export function useRegistry() {
  const contract = usePayClearContract();
  const query = useQuery<Registry, Error>({
    queryKey: registryKey(),
    queryFn: async () => {
      try {
        const body = await fetchJson(`/api/registry?network=${currentNetwork().id}`);
        if (!Array.isArray(body.programs) || !Array.isArray(body.audits)) throw new Error("Malformed snapshot");
        return body as Registry;
      } catch (snapshotErr) {
        if (!contract) throw classifyError(snapshotErr, "read");
        const [programs, audits] = await Promise.all([contract.getPrograms(), contract.getAudits()]);
        return { programs, audits, fetchedAt: new Date().toISOString() };
      }
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (prev) => prev,
  });
  return {
    programs: query.data?.programs ?? [],
    audits: query.data?.audits ?? [],
    fetchedAt: query.data?.fetchedAt,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Re-read what a write touched and merge it into the cached registry. */
async function mergeFresh(qc: ReturnType<typeof useQueryClient>, contract: PayClear, programId?: string, auditId?: string) {
  try {
    const [program, audit] = await Promise.all([
      programId ? contract.getProgramWithFunders(programId) : Promise.resolve(null),
      auditId ? contract.getAuditWithResults(auditId) : Promise.resolve(null),
    ]);
    qc.setQueryData<Registry>(registryKey(), (prev) => {
      let programs = prev?.programs ?? [];
      let audits = prev?.audits ?? [];
      if (program) programs = programs.some((p) => p.id === program.id) ? programs.map((p) => (p.id === program.id ? program : p)) : [...programs, program];
      if (audit) audits = audits.some((a) => a.id === audit.id) ? audits.map((a) => (a.id === audit.id ? audit : a)) : [...audits, audit];
      return { programs, audits, fetchedAt: prev?.fetchedAt };
    });
  } catch {
    // Already confirmed on chain; the next snapshot refresh picks it up.
  }
}

export type WriteVars =
  | { kind: "create"; input: CreateProgramInput; fund: bigint }
  | { kind: "fund"; programId: string; value: bigint }
  | { kind: "open"; programId: string; ats: string; board: string }
  | { kind: "step"; auditId: string }
  | { kind: "recheck"; auditId: string; postingId: string }
  | { kind: "close"; programId: string }
  | { kind: "refund"; programId: string; funder: string }
  | { kind: "withdraw" };

export const WRITE_LABEL: Record<TxKind, string> = {
  create: "Open a program",
  fund: "Add to the pot",
  open: "Open an audit",
  step: "Run an audit step",
  recheck: "Read a posting again",
  close: "Close the program",
  refund: "Credit a funder's share",
  withdraw: "Withdraw your GEN",
};

/** One mutation for every PayClear write, with a transaction log entry and typed errors. */
export function usePayClearWrite() {
  const contract = usePayClearContract();
  const { address } = useWallet();
  const qc = useQueryClient();
  const [pending, setPending] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (vars: WriteVars) => {
      const target =
        vars.kind === "withdraw"
          ? "your credited GEN"
          : vars.kind === "create"
          ? vars.input.title
          : vars.kind === "open"
            ? `${vars.programId} ← ${vars.ats}/${vars.board}`
            : vars.kind === "recheck"
              ? `${vars.auditId} · posting ${vars.postingId}`
              : "auditId" in vars
                ? vars.auditId
                : vars.programId;
      const logId = startTx(vars.kind, target);
      setPending(
        vars.kind === "withdraw"
          ? "withdraw"
          : vars.kind === "create"
          ? "create"
          : vars.kind === "refund"
            ? `refund:${vars.programId}:${vars.funder.toLowerCase()}`
            : vars.kind === "recheck"
              ? `recheck:${vars.auditId}:${vars.postingId}`
              : vars.kind === "open"
                ? `open:${vars.ats}/${vars.board}`
                : `${vars.kind}:${"auditId" in vars ? vars.auditId : vars.programId}`
      );
      const onProgress = (p: TxProgress) =>
        updateTx(logId, {
          state: p.step === "awaiting_wallet" ? "awaiting_wallet" : p.step === "accepted" ? "accepted" : "confirming",
          txHash: p.txHash,
          progress: p.message,
        });
      const refuse = (message: string): never => {
        throw new TxError({ kind: "contract_revert", phase: "estimate", message, hint: "The data was refreshed; nothing was sent." });
      };
      try {
        if (!contract) throw new TxError({ kind: "unknown", phase: "send", message: "The contract address is not configured." });
        if (!address) throw new TxError({ kind: "wallet_missing", phase: "send", message: "No wallet is connected." });
        // A wallet that was already connected keeps whatever chain it was on: ask MetaMask to switch first.
        if (!(await isOnGenLayerNetwork())) {
          try {
            await switchToGenLayerNetwork();
          } catch (err) {
            throw classifyError(err, "send");
          }
        }

        let result: TxResult;
        const bradbury = contract.network.id === "bradbury";
        const owedBefore = vars.kind === "create" || vars.kind === "fund" || vars.kind === "withdraw" ? await contract.owedTo(address) : 0n;
        // Bradbury reports no return values: a refused payable call shows up as GEN credited back to the sender.
        const refusedPayment = async (sent: bigint) => {
          if (bradbury && (await contract.owedTo(address)) >= owedBefore + sent && sent > 0n) {
            throw new TxError({
              kind: "contract_revert",
              phase: "verify",
              txHash: result.txHash,
              message: "The contract refused this call and credited your GEN back.",
              hint: "Withdraw it from “Your GEN in PayClear”. The usual reasons are checked before sending; the program may have changed meanwhile.",
            });
          }
        };
        let programId = "programId" in vars ? vars.programId : undefined;
        let auditId = "auditId" in vars ? vars.auditId : undefined;
        let note = "Done.";
        // Re-read right before sending, so a stale list never sends a call the contract would refuse.
        switch (vars.kind) {
          case "create":
            result = await contract.createProgram(vars.input, vars.fund, onProgress);
            await refusedPayment(vars.fund);
            if (bradbury) {
              const mine = (await contract.getPrograms()).filter((p) => sameAddress(p.sponsor, address) && p.title === vars.input.title.trim());
              result.returned = mine.at(-1)?.id;
            }
            programId = typeof result.returned === "string" ? result.returned : undefined;
            note = programId ? `${programId} pays audit steps until ${vars.input.ends}.` : "Program opened.";
            break;
          case "fund": {
            const p = await contract.getProgram(vars.programId);
            if (p.state !== "open" || todayUtc() > p.ends) refuse("This program no longer takes funding.");
            result = await contract.fund(vars.programId, vars.value, onProgress);
            await refusedPayment(vars.value);
            note = "Added to the pot. Whatever is left when the program closes returns to funders in proportion.";
            break;
          }
          case "open": {
            const p = await contract.getProgram(vars.programId);
            if (p.state !== "open" || todayUtc() > p.ends) refuse(`This program took audits until ${p.ends}.`);
            const prior = await contract.auditFor(vars.programId, vars.ats, vars.board);
            if (prior) {
              const a = await contract.getAudit(prior);
              if (a.state === "running") refuse(`${a.id} is still auditing this board: run its next step instead.`);
            }
            result = await contract.openAudit(vars.programId, vars.ats, vars.board, onProgress);
            if (bradbury) result.returned = (await contract.auditFor(vars.programId, vars.ats, vars.board)) || undefined;
            auditId = typeof result.returned === "string" ? result.returned : undefined;
            note = auditId ? `${auditId} opened and read its first postings.` : "Audit opened.";
            break;
          }
          case "step": {
            const a = await contract.getAudit(vars.auditId);
            programId = a.program_id;
            if (a.state !== "running") refuse(`${a.id} is already done.`);
            result = await contract.step(vars.auditId, onProgress);
            if (bradbury) result.returned = (await contract.getAudit(vars.auditId)).state;
            note = result.returned === "done" ? "The last postings were read: the audit is done." : "The next postings were read.";
            break;
          }
          case "recheck": {
            result = await contract.recheck(vars.auditId, vars.postingId, onProgress);
            if (bradbury) result.returned = (await contract.getAuditWithResults(vars.auditId)).results?.find((r) => r.id === vars.postingId)?.code;
            note = `Read again: ${String(result.returned).replace("_", " ")}.`;
            break;
          }
          case "close": {
            const p = await contract.getProgram(vars.programId);
            if (p.state !== "open") refuse("This program is already closed.");
            if (todayUtc() <= p.ends) refuse(`Audit steps are paid until ${p.ends}.`);
            result = await contract.close(vars.programId, onProgress);
            note = "Closed. Each funder's share can now be returned, one funder per transaction, by anyone.";
            break;
          }
          case "refund": {
            const p = await contract.getProgramWithFunders(vars.programId);
            if (p.state !== "closed") refuse("Close the program first.");
            const row = p.funders?.find((f) => sameAddress(f.address, vars.funder));
            if (!row) refuse("That wallet did not fund this program.");
            if (row?.refunded) refuse("That funder's share has already been returned.");
            result = await contract.refund(vars.programId, vars.funder, onProgress);
            note = `${vars.funder.slice(0, 6)}…${vars.funder.slice(-4)}'s share is credited; they take it out with Withdraw.`;
            break;
          }
          case "withdraw": {
            if (owedBefore === 0n) refuse("Nothing is credited to this wallet.");
            result = await contract.withdraw(onProgress);
            note = `${formatGen(owedBefore, 4)} GEN sent to your wallet${bradbury ? " (it arrives about a minute after the transaction finalizes)" : ""}.`;
            break;
          }
        }
        updateTx(logId, { state: "accepted", txHash: result.txHash, status: result.status, executionResult: result.executionResult, progress: note });
        return { programId, auditId, txHash: result.txHash, kind: vars.kind, note };
      } catch (err) {
        const e = classifyError(err, "send");
        if (contract) mergeFresh(qc, contract, "programId" in vars ? vars.programId : undefined, "auditId" in vars ? vars.auditId : undefined);
        updateTx(logId, {
          state: "failed",
          txHash: e.txHash,
          error: { kind: e.kind, message: e.message, hint: e.hint, detail: e.detail, phase: e.phase },
        });
        error(`${WRITE_LABEL[vars.kind]} failed`, { description: [e.message, e.hint].filter(Boolean).join(" "), duration: 12000 });
        throw err;
      } finally {
        setPending(null);
      }
    },
    onSuccess: ({ programId, auditId, txHash, kind, note }) => {
      if (contract) mergeFresh(qc, contract, programId, auditId);
      qc.invalidateQueries({ queryKey: ["genBalance"] });
      qc.invalidateQueries({ queryKey: ["owed"] });
      success(`${WRITE_LABEL[kind]} confirmed`, {
        description: `${note} Tx ${txHash.slice(0, 10)}... is ACCEPTED by validator consensus.`,
        duration: 10000,
      });
    },
  });

  return { write: mutation.mutate, writeAsync: mutation.mutateAsync, pending, isPending: mutation.isPending };
}
