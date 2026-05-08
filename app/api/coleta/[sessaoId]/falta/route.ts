import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  produtoId: z.string(),
  quantidade: z.number().positive(),
  modo: z.enum(["VOZ", "BARCODE", "FOTO", "MANUAL"]),
  observacao: z.string().optional(),
  origem: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ sessaoId: string }> }) {
  const { sessaoId } = await params;
  const json = await req.json();
  const data = Body.parse(json);

  const falta = await prisma.falta.create({
    data: {
      sessaoId,
      produtoId: data.produtoId,
      quantidade: data.quantidade,
      modo: data.modo,
      observacao: data.observacao,
      origem: data.origem,
    },
  });

  return NextResponse.json({ falta });
}
