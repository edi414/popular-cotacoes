import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ColetaCliente from "./coleta-cliente";

export const dynamic = "force-dynamic";

export default async function SessaoColeta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessao = await prisma.sessaoLevantamento.findUnique({
    where: { id },
    include: {
      fornecedor: true,
      faltas: { include: { produto: true }, orderBy: { criadoEm: "desc" } },
    },
  });
  if (!sessao) notFound();

  return (
    <main className="mx-auto max-w-md p-4">
      <Link href="/coleta" className="text-sm text-slate-500">
        &larr; sess&otilde;es
      </Link>
      <h1 className="mt-2 text-xl font-bold">
        {sessao.titulo ?? sessao.fornecedor?.razao ?? "Sess&atilde;o"}
      </h1>
      <p className="text-xs text-slate-500">
        {sessao.iniciadaEm.toLocaleString("pt-BR")} &middot; {sessao.responsavel ?? "&mdash;"}
      </p>

      <ColetaCliente
        sessaoId={sessao.id}
        faltas={sessao.faltas.map((f) => ({
          id: f.id,
          produtoId: f.produtoId,
          descricao: f.produto.descricao,
          ean: f.produto.ean,
          quantidade: Number(f.quantidade),
          modo: f.modo,
        }))}
      />
    </main>
  );
}
