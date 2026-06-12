# pacientes-auton-api

Backend **read-only** do App Paciente AUTON Health. Fica entre a SPA React e o
Postgres do Supabase (projeto **APOGEU**), usando **Fastify + Prisma + Zod**.

> O banco é gerenciado pelo sistema do médico (`auton-health-main`). Aqui usamos
> **apenas introspecção** (`prisma db pull`) — **nunca** `prisma migrate`.

## Setup

```bash
cd pacientes-auton-api
cp .env.sample .env
# edite .env e cole a connection string do Supabase em PG_URL
#   (Supabase → Settings → Database → Connection string → Session pooler / Direct)

npm install
npm run db:pull       # introspecciona o schema real → popula prisma/schema.prisma
npm run db:generate   # gera o Prisma Client
npm run db:explore    # imprime colunas + amostras das tabelas de interesse
npm run dev           # sobe a API em http://localhost:3333
```

## Healthcheck

- `GET /health` → liveness
- `GET /health/db` → confirma que o Postgres responde

## Estrutura

```
prisma/schema.prisma   datasource (env PG_URL) — models vêm do db pull
scripts/explore-db.ts  dump de colunas/amostras (SQL cru, independe do client)
src/config/env.ts      validação de env via Zod
src/lib/prisma.ts      singleton do Prisma
src/lib/logger.ts      pino
src/app.ts             bootstrap Fastify (+ zod type provider, cors, helmet)
src/index.ts           listen + graceful shutdown
src/routes/            health (+ paciente/prescrições/check-ins depois)
```

## Segurança (a fazer)

O Prisma conecta como super-user e **ignora RLS**. A API precisa validar o JWT do
paciente (Supabase Auth) e **escopar toda query pelo paciente do token** antes de
expor qualquer endpoint de dados.
