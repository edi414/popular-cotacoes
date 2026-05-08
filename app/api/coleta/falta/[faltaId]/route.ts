import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Patch = z.object({
  quantidade: z.number().positive().optional(),
  observacao: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ faltaId: string }> }) {
  const { faltaId } = await params;
  const json = await req.json();
  const data = Patch.parse(json);
  const falta = await prisma.falta.update({ where: { id: faltaId }, data });
  return NextResponse.json({ falta });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ faltaId: string }> }) {
  const { faltaId } = await params;
  await prisma.falta.delete({ where: { id: faltaId } });
  return NextResponse.json({ ok: true });
}
