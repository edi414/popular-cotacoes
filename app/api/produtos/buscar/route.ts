import { NextResponse } from "next/server";
import { matchPorEan, matchPorTexto } from "@/lib/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ candidatos: [] });

  if (/^\d{8,14}$/.test(q)) {
    const c = await matchPorEan(q);
    return NextResponse.json({ candidatos: c ? [c] : [] });
  }

  const candidatos = await matchPorTexto(q, 8);
  return NextResponse.json({ candidatos });
}
