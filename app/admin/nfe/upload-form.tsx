"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ImportResult = {
  chave: string;
  status: "criada" | "ja_existia" | "erro";
  itensImportados?: number;
  erro?: string;
};

export default function UploadForm() {
  const [results, setResults] = useState<ImportResult[]>([]);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setEnviando(true);
    try {
      const res = await fetch("/api/nfe/import", { method: "POST", body: data });
      const json = await res.json();
      setResults(json.results ?? [json]);
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="mt-4 flex items-center gap-3">
        <input
          type="file"
          name="file"
          multiple
          accept=".xml,application/xml,text/xml"
          required
          className="flex-1 text-sm"
        />
        <button
          disabled={enviando}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {enviando ? "Importando…" : "Importar"}
        </button>
      </form>

      {results.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm">
          {results.map((r, i) => (
            <li
              key={i}
              className={
                r.status === "criada"
                  ? "text-green-700"
                  : r.status === "ja_existia"
                    ? "text-slate-500"
                    : "text-red-600"
              }
            >
              {r.status === "criada" && `+ ${r.chave} (${r.itensImportados} itens)`}
              {r.status === "ja_existia" && `= ${r.chave} (j&aacute; importada)`}
              {r.status === "erro" && `! ${r.erro}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
