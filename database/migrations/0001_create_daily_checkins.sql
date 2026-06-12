-- ─────────────────────────────────────────────────────────────────────────────
-- 0001_create_daily_checkins.sql
-- Check-ins diários do PACIENTE (única feature em que o paciente ESCREVE).
--
-- Banco compartilhado (mesmo Postgres do sistema do médico):
--   • Paciente ESCREVE  → via app do paciente (pacientes-auton-api, service_role)
--   • Médico LÊ          → aderência/histórico dos seus pacientes
--
-- A escrita do paciente passa pelo backend (service_role, que ignora RLS e escopa
-- por usuario_auth no código). As policies de RLS abaixo são defesa-em-profundidade
-- e habilitam a leitura do médico via JWT.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.daily_checkins (
  id           uuid primary key default gen_random_uuid(),
  paciente_id  uuid not null references public.pacientes(id) on delete cascade,
  medico_id    uuid references public.medicos(id),            -- denormalizado p/ o médico filtrar fácil
  data_checkin date not null,

  sono_qualidade          numeric check (sono_qualidade          between 0 and 10),
  sono_tempo_horas        numeric check (sono_tempo_horas        between 0 and 24),
  atividade_tempo_horas   numeric check (atividade_tempo_horas   between 0 and 24),
  atividade_intensidade   numeric check (atividade_intensidade   between 0 and 100),
  alimentacao_refeicoes   integer check (alimentacao_refeicoes   between 0 and 12),
  alimentacao_agua_litros numeric check (alimentacao_agua_litros between 0 and 20),

  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),

  constraint daily_checkins_um_por_dia unique (paciente_id, data_checkin)  -- 1 check-in por dia
);

comment on table public.daily_checkins is
  'Check-ins diarios do paciente (escrita via app do paciente). 1 por dia. Medico le aderencia dos seus pacientes.';

create index if not exists idx_daily_checkins_paciente_data on public.daily_checkins (paciente_id, data_checkin desc);
create index if not exists idx_daily_checkins_medico        on public.daily_checkins (medico_id);

-- ── Trigger: preenche medico_id a partir do paciente + toca atualizado_em ──
create or replace function public.daily_checkins_before_write()
returns trigger
language plpgsql
as $$
begin
  if new.medico_id is null then
    select medico_id into new.medico_id from public.pacientes where id = new.paciente_id;
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists trg_daily_checkins_before_write on public.daily_checkins;
create trigger trg_daily_checkins_before_write
  before insert or update on public.daily_checkins
  for each row execute function public.daily_checkins_before_write();

-- ── RLS ──
alter table public.daily_checkins enable row level security;

-- Paciente lê os PRÓPRIOS check-ins (via pacientes.usuario_auth)
drop policy if exists "paciente le proprios checkins" on public.daily_checkins;
create policy "paciente le proprios checkins" on public.daily_checkins
  for select
  using (paciente_id in (select id from public.pacientes where usuario_auth = auth.uid()));

-- Paciente insere os PRÓPRIOS check-ins
drop policy if exists "paciente insere proprios checkins" on public.daily_checkins;
create policy "paciente insere proprios checkins" on public.daily_checkins
  for insert
  with check (paciente_id in (select id from public.pacientes where usuario_auth = auth.uid()));

-- Médico lê os check-ins dos PRÓPRIOS pacientes (medicos.user_auth)
drop policy if exists "medico le checkins dos seus pacientes" on public.daily_checkins;
create policy "medico le checkins dos seus pacientes" on public.daily_checkins
  for select
  using (medico_id in (select id from public.medicos where user_auth = auth.uid()));

-- (Sem policy de DELETE: check-in é registro do paciente; não removível via RLS.)
