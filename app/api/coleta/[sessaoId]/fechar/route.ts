import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ sessaoId: string }> }) {
  const { sessaoId } = await params;
  const sessao = await prisma.sessaoLevantamento.update({
    where: { id: sessaoId },
    data: { status: "FECHADA", fechadaEm: new Date() },
  });
  return NextResponse.json({ sessao });
}
