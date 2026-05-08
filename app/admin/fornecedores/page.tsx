import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FornecedoresIndex() {
  const fornecedores = await prisma.fornecedor
    .findMany({ orderBy: { razao: "asc" }, take: 200 })
    .catch(() => []);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <Link
          href="/admin/fornecedores/novo"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        >
          + Novo
        </Link>
      </header>

      <table className="mt-6 w-full text-sm">
        <thead className="text-left text-xs text-slate-500">
          <tr>
            <th className="py-2">Razao</th>
            <th>CNPJ</th>
            <th>WhatsApp</th>
            <th>Categorias</th>
          </tr>
        </thead>
        <tbody>
          {fornecedores.map((f) => (
            <tr key={f.id} className="border-t border-slate-100">
              <td className="py-2">{f.fantasia ?? f.razao}</td>
              <td className="text-slate-500">{f.cnpj ?? "&mdash;"}</td>
              <td className="text-slate-500">{f.whatsapp ?? "&mdash;"}</td>
              <td className="text-slate-500">{f.categorias.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {fornecedores.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          Nenhum fornecedor ainda. Importe NF-e ou cadastre manualmente.
        </p>
      )}
    </main>
  );
}
