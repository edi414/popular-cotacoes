"use client";

import { useEffect, useRef, useState } from "react";
import {
  criarReconhecedorNativo,
  nativoDisponivel,
  transcreverViaWhisper,
  type Reconhecedor,
} from "@/lib/client/speech";
import { parseFala } from "@/lib/client/parse-voz";
import { buscarProdutos, type ProdutoCandidato } from "@/lib/client/produtos";

type Props = {
  onSelecionar: (produto: ProdutoCandidato, quantidade: number) => void;
};

type Estado = "idle" | "ouvindo" | "processando" | "escolhendo";

export default function ModoVoz({ onSelecionar }: Props) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [candidatos, setCandidatos] = useState<ProdutoCandidato[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const recRef = useRef<Reconhecedor | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => () => recRef.current?.parar(), []);

  async function onTextoFinal(texto: string) {
    setEstado("processando");
    setTranscript(texto);
    const { quantidade: q, termo } = parseFala(texto);
    setQuantidade(q);
    if (!termo) {
      setErro("Nao consegui identificar o produto. Repita.");
      setEstado("idle");
      return;
    }
    const cand = await buscarProdutos(termo);
    setCandidatos(cand);
    if (cand.length === 1) {
      // auto-selecao quando ha apenas 1 match
      onSelecionar(cand[0], q);
      reset();
    } else if (cand.length === 0) {
      setErro(`Nao encontrei "${termo}".`);
      setEstado("idle");
    } else {
      setEstado("escolhendo");
    }
  }

  function reset() {
    setEstado("idle");
    setTranscript("");
    setInterim("");
    setCandidatos([]);
    setErro(null);
  }

  async function iniciarNativo() {
    setErro(null);
    setInterim("");
    setTranscript("");
    setCandidatos([]);
    try {
      const rec = criarReconhecedorNativo({
        onInterim: setInterim,
        onFinal: (t) => onTextoFinal(t),
        onError: (e) => {
          setErro(e.message);
          setEstado("idle");
        },
        onEnd: () => {
          setInterim("");
          setEstado((s) => (s === "ouvindo" ? "idle" : s));
        },
      });
      recRef.current = rec;
      rec.iniciar();
      setEstado("ouvindo");
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function iniciarWhisper() {
    setErro(null);
    setInterim("");
    setTranscript("");
    setCandidatos([]);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setEstado("processando");
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const texto = await transcreverViaWhisper(blob);
          await onTextoFinal(texto);
        } catch (e) {
          setErro((e as Error).message);
          setEstado("idle");
        }
      };
      mr.start();
      mediaRef.current = mr;
      setEstado("ouvindo");
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  function parar() {
    if (recRef.current) recRef.current.parar();
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
  }

  const usarNativo = nativoDisponivel();

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="text-xs uppercase tracking-wide text-slate-500">
          {usarNativo ? "Web Speech (gratis)" : "Whisper (servidor)"}
        </div>
        <div className="mt-2 min-h-[3rem] text-sm">
          {estado === "ouvindo" && (
            <span className="text-brand-600">
              {interim || "🎤 Pode falar... ex: \"cinco pacotes de arroz tio joao 5kg\""}
            </span>
          )}
          {estado === "processando" && <span className="text-slate-500">Processando...</span>}
          {estado === "idle" && transcript && (
            <span className="text-slate-700">&ldquo;{transcript}&rdquo;</span>
          )}
          {estado === "idle" && !transcript && (
            <span className="text-slate-400">Toque no microfone e diga o produto.</span>
          )}
        </div>
        {erro && <div className="mt-2 text-xs text-red-600">{erro}</div>}
      </div>

      <div className="flex justify-center">
        {estado === "ouvindo" ? (
          <button
            onClick={parar}
            className="h-20 w-20 rounded-full bg-red-600 text-3xl text-white shadow-lg"
          >
            ■
          </button>
        ) : (
          <button
            onClick={() => (usarNativo ? iniciarNativo() : iniciarWhisper())}
            disabled={estado === "processando"}
            className="h-20 w-20 rounded-full bg-brand-600 text-3xl text-white shadow-lg disabled:opacity-50"
          >
            🎤
          </button>
        )}
      </div>

      {estado === "escolhendo" && candidatos.length > 0 && (
        <div>
          <div className="mb-1 text-xs text-slate-500">
            Quantidade: <strong>{quantidade}</strong> &middot; escolha o produto:
          </div>
          <ul className="space-y-1">
            {candidatos.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    onSelecionar(c, quantidade);
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
          <button onClick={reset} className="mt-2 text-xs text-slate-500 underline">
            cancelar
          </button>
        </div>
      )}
    </div>
  );
}
