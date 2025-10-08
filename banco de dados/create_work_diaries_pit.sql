-- ============================================
-- Tabela específica: Diários PIT
-- Estrutura: work_diaries (cabeçalho comum)
--          + work_diaries_pit (dados PIT)
--          + work_diaries_pit_piles (N estacas por PIT)
-- ============================================

-- (Opcional) Função updated_at, reutilizada por triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Tabela principal PIT
create table if not exists public.work_diaries_pit (
  id uuid primary key default gen_random_uuid(),
  diary_id uuid not null references public.work_diaries(id) on delete cascade,

  -- Equipamento selecionado
  equipamento text check (equipamento in ('PIT 1','PIT 2','PIT 3','PIT 4','PIT 5')),

  -- Ocorrências gerais do dia
  ocorrencias text,

  -- Número total de estacas produzidas
  total_estacas integer,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_work_diaries_pit_diary_id on public.work_diaries_pit(diary_id);

alter table public.work_diaries_pit enable row level security;

-- Políticas simples para usuários autenticados (ajuste se desejar owner/admin)
drop policy if exists "pit_select_all_auth" on public.work_diaries_pit;
create policy "pit_select_all_auth"
  on public.work_diaries_pit for select
  to authenticated
  using (true);

drop policy if exists "pit_insert_auth" on public.work_diaries_pit;
create policy "pit_insert_auth"
  on public.work_diaries_pit for insert
  to authenticated
  with check (true);

drop policy if exists "pit_update_auth" on public.work_diaries_pit;
create policy "pit_update_auth"
  on public.work_diaries_pit for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "pit_delete_auth" on public.work_diaries_pit;
create policy "pit_delete_auth"
  on public.work_diaries_pit for delete
  to authenticated
  using (true);

drop trigger if exists trg_work_diaries_pit_updated on public.work_diaries_pit;
create trigger trg_work_diaries_pit_updated
before update on public.work_diaries_pit
for each row execute procedure public.set_updated_at();

-- ============================
-- Estacas do PIT (1:N)
-- ============================
create table if not exists public.work_diaries_pit_piles (
  id uuid primary key default gen_random_uuid(),
  pit_id uuid not null references public.work_diaries_pit(id) on delete cascade,
  ordem integer,

  estaca_nome text,
  estaca_tipo text,
  diametro_cm numeric(10,2),
  profundidade_cm numeric(10,2),
  arrasamento_m numeric(10,2),
  comprimento_util_m numeric(10,2),

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_work_diaries_pit_piles_pit_id on public.work_diaries_pit_piles(pit_id);

alter table public.work_diaries_pit_piles enable row level security;

drop policy if exists "pit_piles_select_auth" on public.work_diaries_pit_piles;
create policy "pit_piles_select_auth"
  on public.work_diaries_pit_piles for select
  to authenticated
  using (true);

drop policy if exists "pit_piles_insert_auth" on public.work_diaries_pit_piles;
create policy "pit_piles_insert_auth"
  on public.work_diaries_pit_piles for insert
  to authenticated
  with check (true);

drop policy if exists "pit_piles_update_auth" on public.work_diaries_pit_piles;
create policy "pit_piles_update_auth"
  on public.work_diaries_pit_piles for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "pit_piles_delete_auth" on public.work_diaries_pit_piles;
create policy "pit_piles_delete_auth"
  on public.work_diaries_pit_piles for delete
  to authenticated
  using (true);

drop trigger if exists trg_work_diaries_pit_piles_updated on public.work_diaries_pit_piles;
create trigger trg_work_diaries_pit_piles_updated
before update on public.work_diaries_pit_piles
for each row execute procedure public.set_updated_at();


