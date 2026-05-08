import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CotacaoIndex() {
  const cotacoes = await prisma.cotacao
    .findMany({
      orderBy: { criadaEm: "desc" },
      take: 30,
      include: { _count: { select: { itens: true, envios: true } } },
    })
    .catch(() => []);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cota&ccedil;&otilde;es</h1>
      </header>

      <ul className="mt-6 space-y-2">
        {cotacoes.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Nenhuma cota&ccedil;&atilde;o ainda. Feche uma sess&atilde;o de coleta para criar a primeira.
          </li>
        )}
        {cotacoes.map((c) => (
          <li key={c.id}>
            <Link
              href={`/cotacao/${c.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <div className="font-semibold">{c.titulo ?? `Cota&ccedil;&atilde;o ${c.id.slice(0, 6)}`}</div>
                <div className="text-xs text-slate-500">
                  {c.criadaEm.toLocaleString("pt-BR")} &middot; {c._count.itens} itens &middot;{" "}
                  {c._count.envios} fornecedores
                </div>
              </div>
              <span className="text-xs font-semibold text-brand-600">{c.status}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
