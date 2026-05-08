"use client";

import { useEffect, useRef, useState } from "react";
import { startScanner, type ScannerStop } from "@/lib/client/scanner";
import { buscarProdutos, type ProdutoCandidato } from "@/lib/client/produtos";

type Props = {
  onSelecionar: (produto: ProdutoCandidato, quantidade: number) => void;
};

type StatusBipe =
  | { tipo: "encontrado"; produto: ProdutoCandidato; ean: string }
  | { tipo: "nao-encontrado"; ean: string }
  | null;

export default function ModoBarcode({ onSelecionar }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ativo, setAtivo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimo, setUltimo] = useState<StatusBipe>(null);
  const stopRef = useRef<ScannerStop | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  async function iniciar() {
    setErro(null);
    setUltimo(null);
    if (!videoRef.current) return;
    try {
      const stop = await startScanner({
        video: videoRef.current,
        onScan: async (ean) => {
          const cand = await buscarProdutos(ean);
          if (cand[0]) {
            const produto = cand[0];
            setUltimo({ tipo: "encontrado", produto, ean });
            onSelecionar(produto, 1);
            beep(880, 100);
          } else {
            setUltimo({ tipo: "nao-encontrado", ean });
            beep(220, 200);
          }
        },
        onError: (e) => setErro(e.message),
      });
      stopRef.current = stop;
      setAtivo(true);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  function parar() {
    stopRef.current?.();
    stopRef.current = null;
    setAtivo(false);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
        <video
          ref={videoRef}
          className={`aspect-video w-full ${ativo ? "" : "opacity-30"}`}
          muted
          playsInline
        />
      </div>

      {erro && <div className="text-xs text-red-600">{erro}</div>}

      {ultimo && (
        <div
          className={`rounded-lg p-3 text-sm ${
            ultimo.tipo === "encontrado"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {ultimo.tipo === "encontrado" ? (
            <>
              ✔ <strong>{ultimo.produto.descricao}</strong> (+1)
            </>
          ) : (
            <>! EAN {ultimo.ean} nao cadastrado</>
          )}
        </div>
      )}

      <div className="flex justify-center">
        {ativo ? (
          <button
            onClick={parar}
            className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white"
          >
            ■ Parar c&acirc;mera
          </button>
        ) : (
          <button
            onClick={iniciar}
            className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white"
          >
            📷 Iniciar leitura
          </button>
        )}
      </div>
      <p className="text-center text-xs text-slate-500">
        Aponte para o c&oacute;digo de barras &mdash; leitura cont&iacute;nua, +1 a cada bipe.
      </p>
    </div>
  );
}

let audioCtx: AudioContext | null = null;
function beep(freq: number, ms: number) {
  if (typeof window === "undefined") return;
  try {
    audioCtx ??= new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    setTimeout(() => osc.stop(), ms);
  } catch {
    // ignore
  }
}
