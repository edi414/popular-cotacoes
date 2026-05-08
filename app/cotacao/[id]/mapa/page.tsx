import Link from "next/link";

export default async function MapaComparativo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href={`/cotacao/${id}`} className="text-sm text-slate-500">
        &larr; cota&ccedil;&atilde;o
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Mapa comparativo</h1>
      <p className="mt-2 text-sm text-slate-500">
        Grid pivot (linhas = produto, colunas = fornecedor) com best-price highlight, total por
        fornecedor, hist&oacute;rico inline e saving autom&aacute;tico. Implementa&ccedil;&atilde;o
        prevista para a Fase 3.
      </p>
    </main>
  );
}
