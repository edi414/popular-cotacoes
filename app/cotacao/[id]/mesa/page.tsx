import Link from "next/link";

export default async function ModoPresencial({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href={`/cotacao/${id}`} className="text-sm text-slate-500">
        &larr; cota&ccedil;&atilde;o
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Modo presencial (mesa de negocia&ccedil;&atilde;o)</h1>
      <p className="mt-2 text-sm text-slate-500">
        Tela otimizada para tablet com filtro por fornecedor presente, item em foco grande, edi&ccedil;&atilde;o
        em tempo real do rebate e bot&atilde;o &quot;fechar com fornecedor X&quot;. Implementa&ccedil;&atilde;o
        prevista para a Fase 3.
      </p>
    </main>
  );
}
