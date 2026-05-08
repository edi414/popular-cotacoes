import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PortalFornecedor({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const envio = await prisma.cotacaoEnvio.findUnique({
    where: { token },
    include: {
      fornecedor: true,
      cotacao: { include: { itens: { include: { produto: true } } } },
      respostas: true,
    },
  });
  if (!envio) notFound();

  // Marca como aberta na primeira visita
  if (!envio.abertaEm) {
    await prisma.cotacaoEnvio.update({
      where: { id: envio.id },
      data: { status: "ABERTA", abertaEm: new Date() },
    });
  }

  const respostasPorItem = new Map(envio.respostas.map((r) => [r.itemId, r]));

  return (
    <main className="mx-auto max-w-md p-4">
      <header className="rounded-xl bg-brand-50 p-4">
        <div className="text-xs text-brand-700">Cota&ccedil;&atilde;o</div>
        <div className="text-lg font-bold">
          {envio.cotacao.titulo ?? `Cota&ccedil;&atilde;o ${envio.cotacao.id.slice(0, 6)}`}
        </div>
        <div className="mt-1 text-sm text-slate-600">
          Para: <strong>{envio.fornecedor.fantasia ?? envio.fornecedor.razao}</strong>
        </div>
        {envio.cotacao.prazo && (
          <div className="mt-1 text-xs text-slate-500">
            Prazo: {envio.cotacao.prazo.toLocaleString("pt-BR")}
          </div>
        )}
      </header>

      <ol className="mt-4 space-y-3">
        {envio.cotacao.itens.map((item) => {
          const r = respostasPorItem.get(item.id);
          return (
            <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="font-semibold">{item.produto.descricao}</div>
              <div className="text-xs text-slate-500">
                Qtd: {Number(item.quantidade)} {item.produto.unidade ?? ""}
                {item.produto.ean && ` &middot; EAN ${item.produto.ean}`}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.01"
                  defaultValue={r?.preco ? Number(r.preco) : ""}
                  placeholder="Pre&ccedil;o unit."
                  className="rounded border border-slate-300 p-2 text-sm"
                  data-item={item.id}
                  data-campo="preco"
                />
                <input
                  defaultValue={r?.marca ?? ""}
                  placeholder="Marca"
                  className="rounded border border-slate-300 p-2 text-sm"
                  data-item={item.id}
                  data-campo="marca"
                />
                <input
                  defaultValue={r?.embalagem ?? ""}
                  placeholder="Embalagem"
                  className="rounded border border-slate-300 p-2 text-sm"
                  data-item={item.id}
                  data-campo="embalagem"
                />
                <input
                  type="number"
                  defaultValue={r?.prazoEntregaDias ?? ""}
                  placeholder="Prazo (dias)"
                  className="rounded border border-slate-300 p-2 text-sm"
                  data-item={item.id}
                  data-campo="prazoEntregaDias"
                />
              </div>
              <input
                defaultValue={r?.condicaoPagamento ?? ""}
                placeholder="Condi&ccedil;&atilde;o de pagamento"
                className="mt-2 w-full rounded border border-slate-300 p-2 text-sm"
                data-item={item.id}
                data-campo="condicaoPagamento"
              />
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-center text-xs text-slate-500">
        Salvamento autom&aacute;tico (a ser ligado na Fase 2). Token: <code>{token.slice(0, 8)}…</code>
      </p>
    </main>
  );
}
