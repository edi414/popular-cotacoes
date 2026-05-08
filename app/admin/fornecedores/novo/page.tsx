import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizarTelefone } from "@/lib/whatsapp";

async function criar(formData: FormData) {
  "use server";
  const razao = String(formData.get("razao") ?? "").trim();
  if (!razao) return;
  const cnpjRaw = String(formData.get("cnpj") ?? "").replace(/\D/g, "");
  const wpRaw = String(formData.get("whatsapp") ?? "").trim();
  const categorias = String(formData.get("categorias") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.fornecedor.create({
    data: {
      razao,
      cnpj: cnpjRaw || null,
      whatsapp: wpRaw ? normalizarTelefone(wpRaw) : null,
      categorias,
      email: String(formData.get("email") ?? "").trim() || null,
    },
  });
  redirect("/admin/fornecedores");
}

export default function NovoFornecedor() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-bold">Novo fornecedor</h1>
      <form action={criar} className="mt-6 space-y-4">
        <input
          name="razao"
          placeholder="Raz&atilde;o social"
          required
          className="w-full rounded-lg border border-slate-300 p-3"
        />
        <input
          name="cnpj"
          placeholder="CNPJ"
          className="w-full rounded-lg border border-slate-300 p-3"
        />
        <input
          name="whatsapp"
          placeholder="WhatsApp (com DDD)"
          className="w-full rounded-lg border border-slate-300 p-3"
        />
        <input
          name="email"
          type="email"
          placeholder="E-mail (opcional)"
          className="w-full rounded-lg border border-slate-300 p-3"
        />
        <input
          name="categorias"
          placeholder="Categorias (mercearia, hortifruti, ...)"
          className="w-full rounded-lg border border-slate-300 p-3"
        />
        <button className="w-full rounded-full bg-brand-600 py-3 font-semibold text-white">
          Cadastrar
        </button>
      </form>
    </main>
  );
}
