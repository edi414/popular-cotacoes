// CLI para importar NF-e em lote a partir de uma pasta.
// Uso:
//   pnpm nfe:import ./data/nfe
//   pnpm nfe:import ./caminho/arquivo.xml

import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { importarNfeXml } from "../lib/nfe-import";

async function listarXmls(input: string): Promise<string[]> {
  const s = await stat(input);
  if (s.isFile()) return [input];
  const entries = await readdir(input, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    const full = join(input, e.name);
    if (e.isDirectory()) {
      out.push(...(await listarXmls(full)));
    } else if (e.isFile() && e.name.toLowerCase().endsWith(".xml")) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error("Uso: tsx scripts/import-nfe.ts <pasta-ou-arquivo>");
    process.exit(1);
  }

  const arquivos = await listarXmls(resolve(input));
  console.log(`Encontrados ${arquivos.length} XMLs.`);

  let criadas = 0;
  let jaExistiam = 0;
  let erros = 0;

  for (const arquivo of arquivos) {
    const xml = await readFile(arquivo, "utf-8");
    const r = await importarNfeXml(xml, arquivo);
    if (r.status === "criada") {
      criadas++;
      console.log(`+ ${r.chave} (${r.itensImportados} itens) ${arquivo}`);
    } else if (r.status === "ja_existia") {
      jaExistiam++;
    } else {
      erros++;
      console.error(`! ${arquivo}: ${r.erro}`);
    }
  }

  console.log(`\nResumo: ${criadas} criadas | ${jaExistiam} ja existiam | ${erros} erros`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../lib/prisma");
    await prisma.$disconnect();
  });
