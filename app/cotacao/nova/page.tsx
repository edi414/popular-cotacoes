import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function criarCotacao(formData: FormData) {
  "use server";
  const sessaoId = String(formData.get("sessaoId") ?? "").trim() || null;
  const titulo = String(formData.get("titulo") ?? "").trim() || null;
  const prazoRaw = String(formData.get("prazo") ?? "").trim();
  const prazo = prazoRaw ? new Date(prazoRaw) : null;

  const cotacao = await prisma.cotacao.create({
    data: { sessaoId, titulo, prazo },
  });

  if (sessaoId) {
    const faltas = await prisma.falta.findMany({ where: { sessaoId } });
    for (const f of faltas) {
      await prisma.cotacaoItem.create({
        data: { cotacaoId: cotacao.id, produtoId: f.produtoId, quantidade: f.quantidade },
      });
    }
  }
  redirect(`/cotacao/${cotacao.id}`);
}

export default async function NovaCotacao({
  searchParams,
}: {
  searchParams: Promise<{ sessao?: string }>;
}) {
  const { sessao } = await searchParams;

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-bold">Nova cota&ccedil;&atilde;o</h1>
      <form action={criarCotacao} className="mt-6 space-y-4">
        <input type="hidden" name="sessaoId" value={sessao ?? ""} />
        <label className="block">
          <span className="text-sm font-medium">T&iacute;tulo</span>
          <input
            name="titulo"
            placeholder="Ex.: Cota&ccedil;&atilde;o quarta 14h"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Prazo de resposta</span>
          <input
            type="datetime-local"
            name="prazo"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </label>
        <button className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white">
          Criar cota&ccedil;&atilde;o
        </button>
      </form>
    </main>
  );
}
