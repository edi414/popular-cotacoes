"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ModoVoz from "./modo-voz";
import ModoBarcode from "./modo-barcode";
import ModoFoto from "./modo-foto";
import ModoManual from "./modo-manual";
import type { ProdutoCandidato } from "@/lib/client/produtos";
import {
  enfileirar,
  novoLocalId,
  sincronizar,
  listarPendentes,
} from "@/lib/client/queue";

type Falta = {
  id: string;
  produtoId: string;
  descricao: string;
  ean: string | null;
  quantidade: number;
  modo: string;
  pendente?: boolean;
};

type Modo = "VOZ" | "BARCODE" | "FOTO" | "MANUAL";

const POLL_MS = 5000;

export default function ColetaCliente({
  sessaoId,
  faltas: faltasInicial,
}: {
  sessaoId: string;
  faltas: Falta[];
}) {
  const [modo, setModo] = useState<Modo>("MANUAL");
  const [faltas, setFaltas] = useState<Falta[]>(faltasInicial);
  const [online, setOnline] = useState(true);
  const [pendentes, setPendentes] = useState(0);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // status online + sincronizacao
  useEffect(() => {
    const atualizarOnline = () => setOnline(navigator.onLine);
    atualizarOnline();
    window.addEventListener("online", atualizarOnline);
    window.addEventListener("offline", atualizarOnline);
    return () => {
      window.removeEventListener("online", atualizarOnline);
      window.removeEventListener("offline", atualizarOnline);
    };
  }, []);

  // contador de pendentes da fila offline
  const refreshPendentes = useCallback(async () => {
    try {
      const lista = await listarPendentes(sessaoId);
      setPendentes(lista.length);
    } catch {
      setPendentes(0);
    }
  }, [sessaoId]);

  // polling do servidor (ignora quando offline)
  const recarregarServidor = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const res = await fetch(`/api/coleta/${sessaoId}/faltas`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { faltas: Falta[] };
      setFaltas(data.faltas);
    } catch {
      // ignora
    }
  }, [sessaoId]);

  useEffect(() => {
    refreshPendentes();
    refreshTimer.current = setInterval(() => {
      sincronizar().then((r) => {
        if (r.ok > 0) {
          recarregarServidor();
        }
        refreshPendentes();
      });
      recarregarServidor();
    }, POLL_MS);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [refreshPendentes, recarregarServidor]);

  // Sincroniza assim que volta online
  useEffect(() => {
    if (online) {
      sincronizar().then(() => {
        refreshPendentes();
        recarregarServidor();
      });
    }
  }, [online, refreshPendentes, recarregarServidor]);

  async function adicionar(produto: ProdutoCandidato, quantidade: number) {
    const localId = novoLocalId();
    const novaFalta: Falta = {
      id: localId,
      produtoId: produto.id,
      descricao: produto.descricao,
      ean: produto.ean,
      quantidade,
      modo,
      pendente: true,
    };
    // Otimista
    setFaltas((prev) => [novaFalta, ...prev]);

    try {
      const res = await fetch(`/api/coleta/${sessaoId}/falta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produtoId: produto.id,
          quantidade,
          modo,
        }),
      });
      if (!res.ok) throw new Error("falha");
      const { falta } = (await res.json()) as { falta: { id: string } };
      setFaltas((prev) =>
        prev.map((f) =>
          f.id === localId ? { ...f, id: falta.id, pendente: false } : f,
        ),
      );
    } catch {
      // Falhou - vai para a fila offline
      await enfileirar({
        localId,
        sessaoId,
        produtoId: produto.id,
        quantidade,
        modo,
        criadoEm: Date.now(),
      });
      refreshPendentes();
    }
  }

  async function ajustarQuantidade(faltaId: string, delta: number) {
    const atual = faltas.find((f) => f.id === faltaId);
    if (!atual || atual.pendente) return;
    const nova = Math.max(0.001, atual.quantidade + delta);
    setFaltas((prev) =>
      prev.map((f) => (f.id === faltaId ? { ...f, quantidade: nova } : f)),
    );
    try {
      await fetch(`/api/coleta/falta/${faltaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade: nova }),
      });
    } catch {
      // ajuste fica local; ser-server-sourced no proximo polling
    }
  }

  async function remover(faltaId: string) {
    setFaltas((prev) => prev.filter((f) => f.id !== faltaId));
    try {
      await fetch(`/api/coleta/falta/${faltaId}`, { method: "DELETE" });
    } catch {
      // proximo polling re-adiciona se necessario
    }
  }

  function fechar() {
    startTransition(async () => {
      await fetch(`/api/coleta/${sessaoId}/fechar`, { method: "POST" });
      router.push(`/cotacao/nova?sessao=${sessaoId}`);
    });
  }

  const totalItens = faltas.reduce((s, f) => s + Number(f.quantidade), 0);

  return (
    <div className="mt-4 space-y-4 pb-24">
      <div className="flex items-center gap-2 text-xs">
        <span
          className={`inline-flex h-2 w-2 rounded-full ${online ? "bg-green-500" : "bg-amber-500"}`}
        />
        <span className="text-slate-500">
          {online ? "online" : "offline"}
          {pendentes > 0 && ` &middot; ${pendentes} na fila`}
        </span>
        <span className="ml-auto text-slate-400">
          {faltas.length} itens distintos &middot; {totalItens.toFixed(0)} unidades
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(["MANUAL", "VOZ", "BARCODE", "FOTO"] as Modo[]).map((m) => (
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

      {modo === "MANUAL" && <ModoManual onSelecionar={adicionar} />}
      {modo === "VOZ" && <ModoVoz onSelecionar={adicionar} />}
      {modo === "BARCODE" && <ModoBarcode onSelecionar={adicionar} />}
      {modo === "FOTO" && <ModoFoto onSelecionar={adicionar} />}

      <ul className="space-y-2">
        {faltas.map((f) => (
          <li
            key={f.id}
            className={`flex items-center justify-between rounded-lg border p-3 ${
              f.pendente ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"
            }`}
          >
            <div className="min-w-0 flex-1 pr-2">
              <div className="truncate text-sm font-medium">{f.descricao}</div>
              <div className="text-xs text-slate-400">
                {f.ean && `EAN ${f.ean} · `}
                {f.modo}
                {f.pendente && " · pendente"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => ajustarQuantidade(f.id, -1)}
                disabled={f.pendente}
                className="h-8 w-8 rounded-full bg-slate-100 text-lg disabled:opacity-30"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-semibold">{f.quantidade}</span>
              <button
                onClick={() => ajustarQuantidade(f.id, 1)}
                disabled={f.pendente}
                className="h-8 w-8 rounded-full bg-slate-100 text-lg disabled:opacity-30"
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
