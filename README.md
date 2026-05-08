# popular-cotacoes

Plataforma de cotação para supermercado — modelo híbrido (online + presencial).

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind**
- **Prisma** + **Postgres** (Supabase ou Neon recomendado)
- **PWA** offline-first para o app de coleta de faltas
- **WhatsApp Cloud API** (Meta) para envio de cotação aos fornecedores
- Importador de **NF-e XML** (layout 4.00) — alimenta catálogo, fornecedores e histórico de preço

## Setup

```bash
# 1. Dependências
pnpm install   # ou: npm install / yarn

# 2. Variáveis de ambiente
cp .env.example .env
# preencha DATABASE_URL e DIRECT_URL apontando para um Postgres

# 3. Banco de dados
pnpm db:push       # cria o schema no banco (dev rápido)
# ou: pnpm db:migrate  para criar migration

# 4. Dev server
pnpm dev
```

## Importar NF-e em lote

```bash
# CLI - aceita pasta ou arquivo único
pnpm nfe:import ./data/nfe

# ou via API (multipart):
curl -F "file=@nfe1.xml" -F "file=@nfe2.xml" \
  http://localhost:3000/api/nfe/import
```

A pasta `data/nfe/` está no `.gitignore` — coloque os XMLs ali à vontade.

## Mapa de rotas

| Rota | Quem usa | O que faz |
|---|---|---|
| `/` | qualquer | Hub de navegação |
| `/coleta` | balconista (mobile) | Lista de sessões de levantamento |
| `/coleta/nova` | balconista | Cria sessão |
| `/coleta/[id]` | balconista | Adiciona faltas (voz/barcode/foto/manual) |
| `/cotacao` | comprador | Lista de cotações |
| `/cotacao/nova` | comprador | Cria cotação a partir de uma sessão |
| `/cotacao/[id]` | comprador | Detalhe da cotação |
| `/cotacao/[id]/enviar` | comprador | Envia para fornecedores via WhatsApp _(Fase 2)_ |
| `/cotacao/[id]/mapa` | comprador | Mapa comparativo lado-a-lado _(Fase 3)_ |
| `/cotacao/[id]/mesa` | comprador | Modo presencial (tablet na mesa) _(Fase 3)_ |
| `/f/[token]` | **fornecedor** | Portal sem login para responder a cotação |
| `/admin/fornecedores` | admin | CRUD de fornecedores |
| `/admin/nfe` | admin | Importar XML, dashboard e histórico |

## Roadmap

Implementado nesta primeira leva (Fase 0):

- [x] Schema completo (produto, fornecedor, NF-e, sessão, falta, cotação, envio, resposta, pedido, usuário)
- [x] Importador NF-e (CLI + API)
- [x] Coleta de faltas com modo MANUAL funcional
- [x] Estrutura de cotação (criar a partir de sessão)
- [x] Portal do fornecedor (read-only com formulário renderizado)
- [x] PWA + service worker básico

Próximas fases (ver `/Users/edivaldo/.claude/plans/preciso-que-voc-fa-a-peaceful-key.md`):

- **Fase 1** — Modos VOZ (Web Speech / Whisper), BARCODE (BarcodeDetector) e FOTO (OCR) na coleta + offline IndexedDB
- **Fase 2** — Envio via WhatsApp Cloud API + salvamento automático no portal do fornecedor
- **Fase 3** — Mapa comparativo + modo presencial
- **Fase 4** — Pedido PDF + conciliação NF-e ↔ pedido
- **Fase 5** — Ranking de fornecedor, alertas de outlier, dashboard de saving
