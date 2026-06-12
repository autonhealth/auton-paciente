# pacientes-auton-api

Backend **read-only** do App Paciente AUTON Health. Fica entre a SPA React e o
banco Supabase (compartilhado com o sistema do médico), usando **Fastify + supabase-js + Zod**.

> Lê o banco com a **service_role** (server-side, ignora RLS) e escopa tudo pelo
> paciente do JWT (segurança no código — "GSD"). **Nunca escreve dado clínico.**

## Setup (local)

```bash
cd pacientes-auton-api
cp .env.sample .env          # preencher SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev                  # http://localhost:3333
```

## Variáveis de ambiente

| Var | Obrigatória | Descrição |
|-----|:---:|---|
| `SUPABASE_URL` | ✅ | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | service_role — **secreta**, só server-side |
| `SUPABASE_JWT_SECRET` | — | fallback HS256 p/ validar o JWT (senão usa JWKS via SUPABASE_URL) |
| `PORT` / `SERVER_PORT` | — | porta HTTP (Cloud Run injeta `PORT`; default 3333) |
| `CORS_ORIGIN` | — | origem(ns) do front, separadas por vírgula. Vazio = libera tudo (dev) |
| `DEV_AUTH_BYPASS` | — | **dev only**: identidade via header `x-dev-usuario-auth` |

## Endpoints

- `GET /health` · `GET /health/db` — liveness / conexão com o Supabase
- `GET /v1/paciente/me` — perfil + visibilidade dos módulos (`itens_visiveis`)
- `GET /v1/alimentacao` · `/v1/suplementos` · `/v1/livro-da-vida` · `/v1/exercicio` · `/v1/metas`

## Deploy — GCP Cloud Run

Há um `Dockerfile` (multi-stage). O app escuta em `0.0.0.0:$PORT` (Cloud Run injeta `PORT`).

```bash
gcloud run deploy auton-paciente-api \
  --source . \
  --region <REGIAO> \
  --allow-unauthenticated \
  --set-env-vars "SUPABASE_URL=https://<projeto>.supabase.co,CORS_ORIGIN=https://<url-do-front-vercel>" \
  --set-secrets  "SUPABASE_SERVICE_ROLE_KEY=<NOME_DO_SECRET>:latest"
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` é **secreta** — usar **Secret Manager** (`--set-secrets`),
> nunca `--set-env-vars` nem embutida na imagem. Depois do deploy, pegar a URL do serviço
> e colocar em `REACT_APP_API_URL` no Vercel.

Build local (opcional, p/ testar a imagem):
```bash
docker build -t auton-paciente-api .
docker run -p 8080:8080 --env-file .env auton-paciente-api
```

## Estrutura

```
src/config/env.ts        validação de env (Zod)
src/lib/supabase.ts      cliente supabase-js (service_role)
src/lib/jwt.ts           verificação do JWT do paciente (JWKS / HS256)
src/lib/adapters.ts      domínios JSONB de `solucao` → shape que o front lê
src/middlewares/auth.ts  GSD: resolve o paciente do token e escopa tudo por ele
src/services/            acesso a dados (solucao, diagnostico, pacientes)
src/routes/              health · paciente · estilo-vida (+ metas)
src/index.ts             listen 0.0.0.0:$PORT + graceful shutdown
Dockerfile               build p/ Cloud Run
scripts/smoke.ts         smoke test do pipeline (npm run smoke)
scripts/test-contrato.ts self-test dos shapes do contrato
```
