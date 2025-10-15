-- ============================================
-- Diário PDA (cabeçalho + estacas do dia)
-- ============================================

create table if not exists public.work_diaries_pda_diario (
  id uuid primary key default gen_random_uuid(),
  diary_id uuid not null references public.work_diaries(id) on delete cascade,

  -- Equipamento PDA selecionado
  pda_computadores text[] check (
    pda_computadores is null or pda_computadores <@ array['PDA 1','PDA 2','PDA 3','PDA 4']::text[]
  ),

  -- Ocorrências do dia
  ocorrencias text,

  -- Abastecimento (dados agregados do dia)
  abastec_equipamentos text[] check (
    abastec_equipamentos is null or abastec_equipamentos <@ array['Hammer 1','Hammer 2','Torre','Equipamento do Cliente']::text[]
  ),
  horimetro_horas numeric(10,2),
  mobilizacao_litros_tanque numeric(10,2),
  mobilizacao_litros_galao numeric(10,2),
  finaldia_litros_tanque numeric(10,2),
  finaldia_litros_galao numeric(10,2),
  entrega_chegou_diesel boolean,
  entrega_fornecido_por text check (entrega_fornecido_por in ('Cliente','Geoteste')),
  entrega_quantidade_litros numeric(10,2),
  entrega_horario_chegada time,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_work_diaries_pda_diario_diary_id on public.work_diaries_pda_diario(diary_id);

alter table public.work_diaries_pda_diario enable row level security;

drop policy if exists "pda_diario_select_owner" on public.work_diaries_pda_diario;
create policy "pda_diario_select_owner"
  on public.work_diaries_pda_diario for select
  using (
    exists (
      select 1 from public.work_diaries wd
      where wd.id = work_diaries_pda_diario.diary_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "pda_diario_insert_owner" on public.work_diaries_pda_diario;
create policy "pda_diario_insert_owner"
  on public.work_diaries_pda_diario for insert
  with check (
    exists (
      select 1 from public.work_diaries wd
      where wd.id = work_diaries_pda_diario.diary_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "pda_diario_update_owner" on public.work_diaries_pda_diario;
create policy "pda_diario_update_owner"
  on public.work_diaries_pda_diario for update
  using (
    exists (
      select 1 from public.work_diaries wd
      where wd.id = work_diaries_pda_diario.diary_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.work_diaries wd
      where wd.id = work_diaries_pda_diario.diary_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "pda_diario_delete_owner" on public.work_diaries_pda_diario;
create policy "pda_diario_delete_owner"
  on public.work_diaries_pda_diario for delete
  using (
    exists (
      select 1 from public.work_diaries wd
      where wd.id = work_diaries_pda_diario.diary_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop trigger if exists trg_work_diaries_pda_diario_updated on public.work_diaries_pda_diario;
create trigger trg_work_diaries_pda_diario_updated
before update on public.work_diaries_pda_diario
for each row execute procedure public.set_updated_at();

-- ============================
-- Estacas do dia (1:N)
-- ============================
create table if not exists public.work_diaries_pda_diario_piles (
  id uuid primary key default gen_random_uuid(),
  pda_diario_id uuid not null references public.work_diaries_pda_diario(id) on delete cascade,
  ordem integer,

  nome text,
  tipo text,
  diametro_cm numeric(10,2),
  profundidade_m numeric(10,2),
  carga_trabalho_tf numeric(10,2),
  carga_ensaio_tf numeric(10,2),

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_work_diaries_pda_diario_piles_parent on public.work_diaries_pda_diario_piles(pda_diario_id);

alter table public.work_diaries_pda_diario_piles enable row level security;

drop policy if exists "pda_diario_piles_select_owner" on public.work_diaries_pda_diario_piles;
create policy "pda_diario_piles_select_owner"
  on public.work_diaries_pda_diario_piles for select
  using (
    exists (
      select 1 from public.work_diaries_pda_diario pd
      join public.work_diaries wd on wd.id = pd.diary_id
      where pd.id = work_diaries_pda_diario_piles.pda_diario_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "pda_diario_piles_insert_owner" on public.work_diaries_pda_diario_piles;
create policy "pda_diario_piles_insert_owner"
  on public.work_diaries_pda_diario_piles for insert
  with check (
    exists (
      select 1 from public.work_diaries_pda_diario pd
      join public.work_diaries wd on wd.id = pd.diary_id
      where pd.id = work_diaries_pda_diario_piles.pda_diario_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "pda_diario_piles_update_owner" on public.work_diaries_pda_diario_piles;
create policy "pda_diario_piles_update_owner"
  on public.work_diaries_pda_diario_piles for update
  using (
    exists (
      select 1 from public.work_diaries_pda_diario pd
      join public.work_diaries wd on wd.id = pd.diary_id
      where pd.id = work_diaries_pda_diario_piles.pda_diario_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.work_diaries_pda_diario pd
      join public.work_diaries wd on wd.id = pd.diary_id
      where pd.id = work_diaries_pda_diario_piles.pda_diario_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "pda_diario_piles_delete_owner" on public.work_diaries_pda_diario_piles;
create policy "pda_diario_piles_delete_owner"
  on public.work_diaries_pda_diario_piles for delete
  using (
    exists (
      select 1 from public.work_diaries_pda_diario pd
      join public.work_diaries wd on wd.id = pd.diary_id
      where pd.id = work_diaries_pda_diario_piles.pda_diario_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop trigger if exists trg_work_diaries_pda_diario_piles_updated on public.work_diaries_pda_diario_piles;
create trigger trg_work_diaries_pda_diario_piles_updated
before update on public.work_diaries_pda_diario_piles
for each row execute procedure public.set_updated_at();


