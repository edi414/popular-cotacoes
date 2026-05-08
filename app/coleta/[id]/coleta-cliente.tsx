"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Falta = {
  id: string;
  produtoId: string;
  descricao: string;
  ean: string | null;
  quantidade: number;
  modo: string;
};

type Modo = "VOZ" | "BARCODE" | "FOTO" | "MANUAL";

export default function ColetaCliente({ sessaoId, faltas: faltasInicial }: { sessaoId: string; faltas: Falta[] }) {
  const [modo, setModo] = useState<Modo>("MANUAL");
  const [faltas, setFaltas] = useState<Falta[]>(faltasInicial);
  const [busca, setBusca] = useState("");
  const [candidatos, setCandidatos] = useState<{ id: string; descricao: string; ean: string | null }[]>([]);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function buscar(q: string) {
    setBusca(q);
    if (q.trim().length < 2) {
      setCandidatos([]);
      return;
    }
    const res = await fetch(`/api/produtos/buscar?q=${encodeURIComponent(q)}`);
    if (!res.ok) return;
    const data = await res.json();
    setCandidatos(data.candidatos ?? []);
  }

  async function adicionarFalta(produtoId: string, descricao: string, ean: string | null) {
    const res = await fetch(`/api/coleta/${sessaoId}/falta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId, quantidade: 1, modo }),
    });
    if (!res.ok) return;
    const { falta } = await res.json();
    setFaltas((prev) => [
      { id: falta.id, produtoId, descricao, ean, quantidade: 1, modo },
      ...prev,
    ]);
    setBusca("");
    setCandidatos([]);
  }

  async function ajustarQuantidade(faltaId: string, delta: number) {
    const atual = faltas.find((f) => f.id === faltaId);
    if (!atual) return;
    const nova = Math.max(0.001, atual.quantidade + delta);
    setFaltas((prev) => prev.map((f) => (f.id === faltaId ? { ...f, quantidade: nova } : f)));
    await fetch(`/api/coleta/falta/${faltaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade: nova }),
    });
  }

  async function remover(faltaId: string) {
    setFaltas((prev) => prev.filter((f) => f.id !== faltaId));
    await fetch(`/api/coleta/falta/${faltaId}`, { method: "DELETE" });
  }

  function fechar() {
    startTransition(async () => {
      await fetch(`/api/coleta/${sessaoId}/fechar`, { method: "POST" });
      router.push("/cotacao/nova?sessao=" + sessaoId);
    });
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {(["VOZ", "BARCODE", "FOTO", "MANUAL"] as Modo[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            className={`rounded-lg border p-2 text-xs font-semibold ${
              modo === m
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            {m === "VOZ" && "🎤 Voz"}
            {m === "BARCODE" && "📷 Barcode"}
            {m === "FOTO" && "🖼 Foto"}
            {m === "MANUAL" && "⌨️ Manual"}
          </button>
        ))}
      </div>

      {modo !== "MANUAL" && (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          Modo {modo} sera implementado na Fase 1 (voz: Web Speech API; barcode: BarcodeDetector;
          foto: Tesseract/Vision).
        </div>
      )}

      <div className="relative">
        <input
          value={busca}
          onChange={(e) => buscar(e.target.value)}
          placeholder="Buscar produto por nome ou EAN"
          className="w-full rounded-lg border border-slate-300 p-3"
        />
        {candidatos.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow">
            {candidatos.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => adicionarFalta(c.id, c.descricao, c.ean)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <div className="font-medium">{c.descricao}</div>
                  {c.ean && <div className="text-xs text-slate-500">EAN {c.ean}</div>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="space-y-2">
        {faltas.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className="min-w-0 flex-1 pr-2">
              <div className="truncate text-sm font-medium">{f.descricao}</div>
              {f.ean && <div className="text-xs text-slate-400">EAN {f.ean}</div>}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => ajustarQuantidade(f.id, -1)}
                className="h-8 w-8 rounded-full bg-slate-100 text-lg"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-semibold">{f.quantidade}</span>
              <button
                onClick={() => ajustarQuantidade(f.id, 1)}
                className="h-8 w-8 rounded-full bg-slate-100 text-lg"
              >
                +
              </button>
              <button
                onClick={() => remover(f.id)}
                className="ml-2 h-8 w-8 rounded-full bg-red-50 text-red-600"
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>

      {faltas.length > 0 && (
        <button
          onClick={fechar}
          disabled={pending}
          className="fixed bottom-4 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-full bg-brand-600 py-4 text-center font-semibold text-white shadow-lg disabled:opacity-50"
        >
          {pending ? "Fechando…" : `Fechar e cotar (${faltas.length})`}
        </button>
      )}
    </div>
  );
}
