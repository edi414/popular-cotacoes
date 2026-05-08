import { prisma } from "@/lib/prisma";
import UploadForm from "./upload-form";

export const dynamic = "force-dynamic";

export default async function NfeAdmin() {
  const [totalNfe, totalProdutos, totalFornecedores, ultimas] = await Promise.all([
    prisma.nfe.count().catch(() => 0),
    prisma.produto.count().catch(() => 0),
    prisma.fornecedor.count().catch(() => 0),
    prisma.nfe
      .findMany({
        orderBy: { dataEmissao: "desc" },
        take: 20,
        include: { fornecedor: true, _count: { select: { itens: true } } },
      })
      .catch(() => []),
  ]);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">NF-e</h1>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Card label="NF-e importadas" valor={totalNfe} />
        <Card label="Produtos" valor={totalProdutos} />
        <Card label="Fornecedores" valor={totalFornecedores} />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Importar XML</h2>
        <p className="text-sm text-slate-500">
          Aceita um ou v&aacute;rios arquivos. Tamb&eacute;m d&aacute; pra rodar em lote via CLI:{" "}
          <code>pnpm nfe:import ./data/nfe</code>.
        </p>
        <UploadForm />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">&Uacute;ltimas NF-e</h2>
        <table className="mt-2 w-full text-sm">
          <thead className="text-left text-xs text-slate-500">
            <tr>
              <th className="py-2">Data</th>
              <th>Fornecedor</th>
              <th>Numero</th>
              <th className="text-right">Itens</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {ultimas.map((n) => (
              <tr key={n.id} className="border-t border-slate-100">
                <td className="py-2">{n.dataEmissao.toLocaleDateString("pt-BR")}</td>
                <td>{n.fornecedor.fantasia ?? n.fornecedor.razao}</td>
                <td className="text-slate-500">{n.numero}</td>
                <td className="text-right">{n._count.itens}</td>
                <td className="text-right">
                  R$ {Number(n.valorTotal).toFixed(2).replace(".", ",")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function Card({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold">{valor}</div>
    </div>
  );
}
