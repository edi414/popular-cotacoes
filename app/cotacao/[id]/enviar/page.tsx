import Link from "next/link";

export default async function EnviarCotacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href={`/cotacao/${id}`} className="text-sm text-slate-500">
        &larr; cota&ccedil;&atilde;o
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Enviar cota&ccedil;&atilde;o</h1>
      <p className="mt-2 text-sm text-slate-500">
        Sele&ccedil;&atilde;o de fornecedores por categoria, gera&ccedil;&atilde;o de tokens e disparo de mensagens
        WhatsApp via Cloud API. Implementa&ccedil;&atilde;o prevista para a Fase 2.
      </p>
    </main>
  );
}
