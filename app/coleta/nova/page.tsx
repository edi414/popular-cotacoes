import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function criarSessao(formData: FormData) {
  "use server";
  const titulo = String(formData.get("titulo") ?? "").trim() || null;
  const responsavel = String(formData.get("responsavel") ?? "").trim() || null;
  const fornecedorId = String(formData.get("fornecedorId") ?? "").trim() || null;

  const sessao = await prisma.sessaoLevantamento.create({
    data: { titulo, responsavel, fornecedorId },
  });
  redirect(`/coleta/${sessao.id}`);
}

async function listarFornecedores() {
  return prisma.fornecedor
    .findMany({ where: { ativo: true }, orderBy: { razao: "asc" }, take: 200 })
    .catch(() => []);
}

export default async function NovaSessao() {
  const fornecedores = await listarFornecedores();

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-bold">Nova sess&atilde;o</h1>
      <p className="mt-1 text-sm text-slate-600">
        Crie uma sess&atilde;o para come&ccedil;ar a registrar faltas.
      </p>

      <form action={criarSessao} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">T&iacute;tulo (opcional)</span>
          <input
            name="titulo"
            placeholder="Ex.: Cota&ccedil;&atilde;o de quarta"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Respons&aacute;vel</span>
          <input
            name="responsavel"
            placeholder="Seu nome"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Fornecedor (opcional)</span>
          <select
            name="fornecedorId"
            className="mt-1 w-full rounded-lg border border-slate-300 p-3"
          >
            <option value="">&mdash; Geral &mdash;</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.fantasia ?? f.razao}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white"
        >
          Iniciar coleta
        </button>
      </form>
    </main>
  );
}
