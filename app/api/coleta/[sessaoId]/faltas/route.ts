import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ sessaoId: string }> }) {
  const { sessaoId } = await params;
  const faltas = await prisma.falta.findMany({
    where: { sessaoId },
    include: { produto: true },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json({
    faltas: faltas.map((f) => ({
      id: f.id,
      produtoId: f.produtoId,
      descricao: f.produto.descricao,
      ean: f.produto.ean,
      quantidade: Number(f.quantidade),
      modo: f.modo,
    })),
  });
}
