import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fallback STT via Whisper API (OpenAI). Acionado quando Web Speech nao funciona.
// Cliente envia multipart com campo "audio".

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY nao configurada" },
      { status: 503 },
    );
  }

  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "campo 'audio' ausente" }, { status: 400 });
  }

  const upstream = new FormData();
  upstream.append("file", audio, audio.name || "audio.webm");
  upstream.append("model", "whisper-1");
  upstream.append("language", "pt");
  upstream.append("response_format", "json");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upstream,
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: `Whisper ${res.status}: ${detail}` }, { status: 502 });
  }

  const data = (await res.json()) as { text: string };
  return NextResponse.json({ text: data.text ?? "" });
}
