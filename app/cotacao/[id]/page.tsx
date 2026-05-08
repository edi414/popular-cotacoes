import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CotacaoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cotacao = await prisma.cotacao.findUnique({
    where: { id },
    include: {
      itens: { include: { produto: true } },
      envios: { include: { fornecedor: true } },
    },
  });
  if (!cotacao) notFound();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/cotacao" className="text-sm text-slate-500">
        &larr; cota&ccedil;&otilde;es
      </Link>
      <h1 className="mt-2 text-2xl font-bold">
        {cotacao.titulo ?? `Cota&ccedil;&atilde;o ${cotacao.id.slice(0, 6)}`}
      </h1>
      <p className="text-sm text-slate-500">
        Status: {cotacao.status} &middot; Prazo: {cotacao.prazo?.toLocaleString("pt-BR") ?? "&mdash;"}
      </p>

      <div className="mt-6 flex gap-2">
        <Link
          href={`/cotacao/${cotacao.id}/enviar`}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Enviar para fornecedores
        </Link>
        <Link
          href={`/cotacao/${cotacao.id}/mapa`}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
        >
          Mapa comparativo
        </Link>
        <Link
          href={`/cotacao/${cotacao.id}/mesa`}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
        >
          Modo presencial
        </Link>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Itens ({cotacao.itens.length})</h2>
      <table className="mt-2 w-full text-sm">
        <thead className="text-left text-xs text-slate-500">
          <tr>
            <th className="py-2">Produto</th>
            <th>EAN</th>
            <th className="text-right">Qtd</th>
          </tr>
        </thead>
        <tbody>
          {cotacao.itens.map((it) => (
            <tr key={it.id} className="border-t border-slate-100">
              <td className="py-2">{it.produto.descricao}</td>
              <td className="text-slate-500">{it.produto.ean ?? "&mdash;"}</td>
              <td className="text-right">{Number(it.quantidade)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8 text-lg font-semibold">Fornecedores ({cotacao.envios.length})</h2>
      <ul className="mt-2 space-y-1">
        {cotacao.envios.map((e) => (
          <li key={e.id} className="flex items-center justify-between text-sm">
            <span>{e.fornecedor.fantasia ?? e.fornecedor.razao}</span>
            <span className="text-xs text-slate-500">{e.status}</span>
          </li>
        ))}
        {cotacao.envios.length === 0 && (
          <li className="text-sm text-slate-500">Nenhum envio ainda.</li>
        )}
      </ul>
    </main>
  );
}
