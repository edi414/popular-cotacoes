import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">Popular Cotações</h1>
      <p className="mt-2 text-slate-600">
        Plataforma de cota&ccedil;&atilde;o h&iacute;brida (online + presencial) para supermercado.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/coleta"
          className="rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-500"
        >
          <h2 className="text-lg font-semibold">📱 Coleta de faltas</h2>
          <p className="mt-1 text-sm text-slate-600">
            App mobile para o balconista (voz, c&oacute;digo de barras, foto, manual).
          </p>
        </Link>

        <Link
          href="/cotacao"
          className="rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-500"
        >
          <h2 className="text-lg font-semibold">💼 Cota&ccedil;&otilde;es</h2>
          <p className="mt-1 text-sm text-slate-600">
            Comprador cria, envia e fecha cota&ccedil;&otilde;es. Mapa comparativo + modo presencial.
          </p>
        </Link>

        <Link
          href="/admin/fornecedores"
          className="rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-500"
        >
          <h2 className="text-lg font-semibold">🏢 Fornecedores</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cadastro, categorias, WhatsApp, hist&oacute;rico e ranking.
          </p>
        </Link>

        <Link
          href="/admin/nfe"
          className="rounded-xl border border-slate-200 bg-white p-6 hover:border-brand-500"
        >
          <h2 className="text-lg font-semibold">📄 NF-e</h2>
          <p className="mt-1 text-sm text-slate-600">
            Importa&ccedil;&atilde;o de XML, hist&oacute;rico de pre&ccedil;o e concilia&ccedil;&atilde;o.
          </p>
        </Link>
      </div>
    </main>
  );
}
