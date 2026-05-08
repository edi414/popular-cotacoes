"use client";

import { useState } from "react";
import { ocrPortugues } from "@/lib/client/ocr";
import { buscarProdutos, type ProdutoCandidato } from "@/lib/client/produtos";

type Props = {
  onSelecionar: (produto: ProdutoCandidato, quantidade: number) => void;
};

type Estado = "idle" | "ocr" | "buscando" | "escolhendo";

export default function ModoFoto({ onSelecionar }: Props) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textoExtraido, setTextoExtraido] = useState("");
  const [editado, setEditado] = useState("");
  const [candidatos, setCandidatos] = useState<ProdutoCandidato[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  async function processar(file: File) {
    setErro(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setEstado("ocr");
    try {
      const texto = await ocrPortugues(file);
      const limpo = texto.replace(/\s+/g, " ").trim().slice(0, 80);
      setTextoExtraido(limpo);
      setEditado(limpo);
      await buscar(limpo);
    } catch (e) {
      setErro(`OCR falhou: ${(e as Error).message}`);
      setEstado("idle");
    }
  }

  async function buscar(q: string) {
    setEstado("buscando");
    const cand = await buscarProdutos(q);
    setCandidatos(cand);
    setEstado("escolhendo");
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTextoExtraido("");
    setEditado("");
    setCandidatos([]);
    setErro(null);
    setEstado("idle");
  }

  return (
    <div className="space-y-3">
      {!previewUrl && (
        <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white">
          <span className="text-3xl">🖼</span>
          <span className="mt-1 text-sm text-slate-600">Tirar foto da prateleira / etiqueta</span>
          <span className="text-xs text-slate-400">OCR roda no aparelho (Tesseract pt-BR)</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processar(f);
            }}
          />
        </label>
      )}

      {previewUrl && (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="prateleira" className="w-full object-contain" />
        </div>
      )}

      {erro && <div className="text-xs text-red-600">{erro}</div>}

      {estado === "ocr" && (
        <div className="text-sm text-slate-500">Lendo texto da imagem...</div>
      )}

      {(estado === "buscando" || estado === "escolhendo") && (
        <div>
          <label className="block text-xs text-slate-500">Texto extra&iacute;do (edite se precisar)</label>
          <div className="mt-1 flex gap-2">
            <input
              value={editado}
              onChange={(e) => setEditado(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 p-2 text-sm"
            />
            <button
              onClick={() => buscar(editado)}
              className="rounded-lg bg-brand-600 px-3 text-sm font-semibold text-white"
            >
              buscar
            </button>
          </div>

          {estado === "escolhendo" && (
            <ul className="mt-2 space-y-1">
              {candidatos.length === 0 && (
                <li className="text-sm text-slate-500">Nenhum candidato. Ajuste o texto.</li>
              )}
              {candidatos.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      onSelecionar(c, 1);
                      reset();
                    }}
                    className="block w-full rounded-lg border border-slate-200 bg-white p-3 text-left"
                  >
                    <div className="text-sm font-medium">{c.descricao}</div>
                    {c.ean && <div className="text-xs text-slate-500">EAN {c.ean}</div>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {previewUrl && (
        <button
          onClick={reset}
          className="w-full rounded-lg border border-slate-300 py-2 text-sm"
        >
          Tirar outra foto
        </button>
      )}

      {textoExtraido && estado === "escolhendo" && (
        <p className="text-center text-[10px] text-slate-400">
          OCR bruto: <em>{textoExtraido.slice(0, 60)}…</em>
        </p>
      )}
    </div>
  );
}
