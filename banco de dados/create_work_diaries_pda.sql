-- ============================================
-- Tabela específica: Ficha técnica de PDA (fichapda)
-- Modelo: uma linha em work_diaries (dados gerais)
--         + uma linha em work_diaries_pda (dados PDA)
-- ============================================

-- Se a tabela antiga existir, renomeia para o novo nome
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'work_diaries_pda') then
    execute 'alter table public.work_diaries_pda rename to fichapda';
  end if;
end $$;

create table if not exists public.fichapda (
  id uuid primary key default gen_random_uuid(),
  diary_id uuid not null references public.work_diaries(id) on delete cascade,

  -- Identificação do Equipamento
  computador text[] check (
    computador is null or computador <@ array['PDA1','PDA2','PDA3','PDA4']::text[]
  ),
  equipamento text[] check (
    equipamento is null or equipamento <@ array['Hammer I','Hammer II','Torre','Equipamento do Cliente']::text[]
  ),

  -- Características da Estaca - Dados Básicos
  bloco_nome text,
  estaca_nome text,
  estaca_tipo text,
  diametro_cm numeric(10,2),
  carga_trabalho_tf numeric(10,2),
  carga_ensaio_tf numeric(10,2),

  -- Geometria da Estaca
  peso_martelo_kg numeric(10,2),
  hq numeric(10,3)[],     -- até 5 valores em metros
  nega numeric(10,3)[],   -- até 5 valores em milímetros
  emx numeric(10,3)[],
  rmx numeric(10,3)[],
  dmx numeric(10,3)[],

  -- Caso estaca cravada
  secao_cravada numeric(10,3)[],

  -- Geometria adicional (diagrama)
  altura_bloco_m numeric(10,3),
  altura_sensores_m numeric(10,3),
  lp_m numeric(10,3),
  le_m numeric(10,3),
  lt_m numeric(10,3)
);

-- Trigger de updated_at na work_diaries já existente cobre a sincronização do pai


-- Colunas de auditoria (idempotente)
alter table if exists public.fichapda
  add column if not exists created_at timestamp with time zone default now();
alter table if exists public.fichapda
  add column if not exists updated_at timestamp with time zone default now();

-- Índices
create index if not exists idx_fichapda_diary_id on public.fichapda(diary_id);

-- Habilitar RLS
alter table public.fichapda enable row level security;

-- Políticas baseadas no proprietário do diário pai
drop policy if exists "pda_select_owner" on public.fichapda;
create policy "pda_select_owner"
  on public.fichapda for select
  using (
    exists (
      select 1 from public.work_diaries wd
      where wd.id = fichapda.diary_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "pda_insert_owner" on public.fichapda;
create policy "pda_insert_owner"
  on public.fichapda for insert
  with check (
    exists (
      select 1 from public.work_diaries wd
      where wd.id = fichapda.diary_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "pda_update_owner" on public.fichapda;
create policy "pda_update_owner"
  on public.fichapda for update
  using (
    exists (
      select 1 from public.work_diaries wd
      where wd.id = fichapda.diary_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.work_diaries wd
      where wd.id = fichapda.diary_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "pda_delete_owner" on public.fichapda;
create policy "pda_delete_owner"
  on public.fichapda for delete
  using (
    exists (
      select 1 from public.work_diaries wd
      where wd.id = fichapda.diary_id
      and (wd.user_id = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- Trigger updated_at
drop trigger if exists trg_work_diaries_pda_updated on public.fichapda;
create trigger trg_work_diaries_pda_updated
before update on public.fichapda
for each row execute procedure public.set_updated_at();


