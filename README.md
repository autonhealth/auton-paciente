# AUTON Health — App do Paciente

Monorepo do app do paciente da AUTON Health. **Somente leitura** sobre o banco
compartilhado do sistema do médico (`auton-health`) — exibe ao paciente o plano
de saúde prescrito (alimentação, suplementos, livro da vida, exercício).

## Estrutura

```
pacientes-auton-web/    Frontend — React (CRA) + MUI         → deploy: Vercel
pacientes-auton-api/    Backend  — Fastify + supabase-js     → deploy: GCP
docs/                   Contrato de dados + handoffs com o sistema do médico
```

## Arquitetura

- Banco único Supabase (compartilhado com o sistema do médico).
- **Frontend** autentica via Supabase Auth e chama a API.
- **Backend** lê o banco com a **service_role** (server-side, ignora RLS) e
  escopa tudo pelo paciente do JWT (segurança no código). Nunca escreve dado clínico.
- Fonte de verdade por paciente: última `solucao`/`diagnostico` por `criado_em`.

Detalhes completos do contrato de leitura em [`docs/CONTRATO_DADOS_APP_PACIENTE.md`](docs/CONTRATO_DADOS_APP_PACIENTE.md).

## Rodar localmente

```bash
# Backend (porta 3333)
cd pacientes-auton-api
cp .env.sample .env          # preencher SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev

# Frontend (porta 3000)
cd pacientes-auton-web
cp .env.sample .env          # REACT_APP_SUPABASE_URL/ANON_KEY/API_URL
npm install
npm start
```

## Deploy

- **Frontend → Vercel:** Root Directory = `pacientes-auton-web` (CRA). Variáveis `REACT_APP_*`.
- **Backend → GCP:** `pacientes-auton-api` (Node/Fastify). Variáveis `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (secret), `CORS_ORIGIN`.

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` é **secreta** — nunca commitar; configurar via secret manager no deploy.
