import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function listarSessoes() {
  return prisma.sessaoLevantamento.findMany({
    orderBy: { iniciadaEm: "desc" },
    take: 20,
    include: { fornecedor: true, _count: { select: { faltas: true } } },
  }).catch(() => []);
}

export default async function ColetaIndex() {
  const sessoes = await listarSessoes();

  return (
    <main className="mx-auto max-w-md p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Coleta de faltas</h1>
        <Link
          href="/coleta/nova"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Nova sess&atilde;o
        </Link>
      </header>

      <ul className="mt-4 space-y-2">
        {sessoes.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Nenhuma sess&atilde;o ainda. Crie uma para come&ccedil;ar.
          </li>
        )}
        {sessoes.map((s) => (
          <li key={s.id}>
            <Link
              href={`/coleta/${s.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <div className="font-semibold">
                  {s.titulo ?? s.fornecedor?.razao ?? "Sess&atilde;o"}
                </div>
                <div className="text-xs text-slate-500">
                  {s.iniciadaEm.toLocaleString("pt-BR")} &middot; {s._count.faltas} itens
                </div>
              </div>
              <span
                className={`text-xs font-semibold ${
                  s.status === "ABERTA" ? "text-brand-600" : "text-slate-400"
                }`}
              >
                {s.status}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
