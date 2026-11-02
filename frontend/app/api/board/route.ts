import { boardApi, preview } from "@/lib/board";

/**
 * Wallet-free board preview: reads a public Greenhouse or Ashby board server-side (their APIs are not all open to
 * browsers) and applies the contract's rules in code. Pay passages are returned for the validators to read.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const ats = (q.get("ats") || "").toLowerCase();
  const board = (q.get("board") || "").toLowerCase();
  if (!["greenhouse", "ashby"].includes(ats) || !/^[a-z0-9][a-z0-9._-]{1,60}$/.test(board))
    return Response.json({ error: "Give a Greenhouse or Ashby board, like greenhouse/figma or ashby/linear." }, { status: 400 });
  try {
    const res = await fetch(boardApi(ats, board), { headers: { accept: "application/json", "user-agent": "PayClear/1.0 (preview)" }, next: { revalidate: 600 } });
    if (res.status === 404) return Response.json({ error: `${ats} has no public job board named ${board}.` }, { status: 404 });
    if (!res.ok) return Response.json({ error: `The board answered ${res.status}; try again in a minute.` }, { status: 502 });
    const data = await res.json();
    const { employer, rows } = preview(ats, data);
    return Response.json({ ats, board, employer: employer || board, total: rows.length, rows }, { headers: { "Cache-Control": "public, s-maxage=600" } });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
}
