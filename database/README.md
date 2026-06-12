# database/

Migrations do banco **compartilhado** (Supabase) que o app do paciente precisa.

> O schema é gerenciado pelo **sistema do médico** (`auton-health`). Estas migrations
> ficam aqui para alinhamento — o ideal é o time do médico aplicá-las como parte do
> versionamento deles. O app do paciente é read-only, **exceto** check-ins (escrita do paciente).

## Migrations

| Arquivo | O que cria | Por quê |
|---------|-----------|---------|
| `migrations/0001_create_daily_checkins.sql` | Tabela `daily_checkins` + índices + trigger + RLS | Check-in diário: **paciente escreve**, **médico lê** a aderência. Hoje a feature é mock por falta dessa tabela. |

## Como aplicar (`0001`)

Escolha **uma**:

- **Supabase Dashboard** → SQL Editor → cola o conteúdo de `0001_create_daily_checkins.sql` → Run.
- **Supabase CLI** → `supabase db execute -f database/migrations/0001_create_daily_checkins.sql` (ou colar numa migration do projeto).
- **Time do médico** → aplica como migration no pipeline deles (recomendado, p/ manter o histórico de schema num lugar só).

## Quem usa a tabela

- **App do paciente** (`pacientes-auton-api`): **escreve** (`POST /v1/checkins`, escopado pelo JWT) e **lê** o histórico (Dashboard). Usa `service_role` (ignora RLS; escopo no código).
- **Sistema do médico**: **lê** os check-ins dos próprios pacientes (aderência). A linha já traz `medico_id` denormalizado + há policy de RLS pro médico.

> ⚠️ Aplicar `0001` é **DDL** (cria tabela) — precisa de acesso de escrita ao banco. O app do paciente
> **não** aplica isso sozinho; é uma ação manual (dashboard) ou do time do médico.
