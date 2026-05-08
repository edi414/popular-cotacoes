"use client";

import { useState } from "react";
import { buscarProdutos, type ProdutoCandidato } from "@/lib/client/produtos";

type Props = {
  onSelecionar: (produto: ProdutoCandidato, quantidade: number) => void;
};

export default function ModoManual({ onSelecionar }: Props) {
  const [busca, setBusca] = useState("");
  const [candidatos, setCandidatos] = useState<ProdutoCandidato[]>([]);
  const [quantidade, setQuantidade] = useState(1);

  async function onBuscar(q: string) {
    setBusca(q);
    if (q.trim().length < 2) {
      setCandidatos([]);
      return;
    }
    setCandidatos(await buscarProdutos(q));
  }

  function escolher(p: ProdutoCandidato) {
    onSelecionar(p, quantidade);
    setBusca("");
    setCandidatos([]);
    setQuantidade(1);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          value={busca}
          onChange={(e) => onBuscar(e.target.value)}
          placeholder="Buscar produto por nome ou EAN"
          className="flex-1 rounded-lg border border-slate-300 p-3"
          autoFocus
        />
        <input
          type="number"
          min={1}
          value={quantidade}
          onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
          className="w-20 rounded-lg border border-slate-300 p-3 text-center"
        />
      </div>
      {candidatos.length > 0 && (
        <ul className="rounded-lg border border-slate-200 bg-white shadow">
          {candidatos.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => escolher(c)}
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
  );
}
