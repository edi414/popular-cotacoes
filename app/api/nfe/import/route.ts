import { NextResponse } from "next/server";
import { importarNfeXml } from "@/lib/nfe-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Aceita:
// - POST com Content-Type: application/xml -> XML cru no body
// - POST com Content-Type: multipart/form-data -> campo "file" (XML)
export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";

  try {
    if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const files = form.getAll("file");
      const results = [];
      for (const f of files) {
        if (!(f instanceof File)) continue;
        const xml = await f.text();
        results.push(await importarNfeXml(xml, f.name));
      }
      return NextResponse.json({ results });
    }

    const xml = await req.text();
    if (!xml) return NextResponse.json({ error: "body vazio" }, { status: 400 });
    const result = await importarNfeXml(xml);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
