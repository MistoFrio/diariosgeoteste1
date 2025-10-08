-- ============================================
-- Tabela específica: Diários PCE
-- Modelo: uma linha em work_diaries (dados gerais)
--         + uma linha em work_diaries_pce (dados PCE)
-- ============================================

-- (Opcional) Função de updated_at, se ainda não existir
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Tabela PCE
create table if not exists public.work_diaries_pce (
  id uuid primary key default gen_random_uuid(),
  diary_id uuid not null references public.work_diaries(id) on delete cascade,

  -- Tipo de ensaio
  ensaio_tipo text not null check (ensaio_tipo in ('PCE CONVENCIONAL','PCE HELICOIDAL')),

  -- Características da Estaca
  estaca_nome text,
  estaca_profundidade_m numeric(10,2),
  estaca_tipo text,
  estaca_carga_trabalho_tf numeric(10,2),
  estaca_diametro_cm numeric(10,2),

  -- Tipo de carregamento (múltiplos)
  carregamento_tipos text[] check (
    carregamento_tipos is null
    or carregamento_tipos <@ array['Lento','Rápido','Misto','Cíclico']::text[]
  ),

  -- Equipamentos utilizados
  equipamentos_macaco text,
  equipamentos_celula text,
  equipamentos_manometro text,
  equipamentos_relogios text,
  equipamentos_conjunto_vigas text,

  -- Ocorrências
  ocorrencias text,

  -- Equipamento de cravação
  cravacao_equipamento text check (cravacao_equipamento in ('Fusion (JCB)','T10','Equipamento do cliente')),
  cravacao_horimetro text,

  -- Abastecimento
  abastecimento_mobilizacao_litros_tanque numeric(10,2),
  abastecimento_mobilizacao_litros_galao numeric(10,2),
  abastecimento_finaldia_litros_tanque numeric(10,2),
  abastecimento_finaldia_litros_galao numeric(10,2),
  abastecimento_chegou_diesel boolean,
  abastecimento_fornecido_por text check (abastecimento_fornecido_por in ('Cliente','Geoteste')),
  abastecimento_quantidade_litros numeric(10,2),
  abastecimento_horario_chegada time,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índices
create index if not exists idx_work_diaries_pce_diary_id on public.work_diaries_pce(diary_id);

-- RLS
alter table public.work_diaries_pce enable row level security;

-- Políticas (modelo simples: usuários autenticados podem tudo)
drop policy if exists "pce_select_all_auth" on public.work_diaries_pce;
create policy "pce_select_all_auth"
  on public.work_diaries_pce for select
  to authenticated
  using (true);

drop policy if exists "pce_insert_auth" on public.work_diaries_pce;
create policy "pce_insert_auth"
  on public.work_diaries_pce for insert
  to authenticated
  with check (true);

drop policy if exists "pce_update_auth" on public.work_diaries_pce;
create policy "pce_update_auth"
  on public.work_diaries_pce for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "pce_delete_auth" on public.work_diaries_pce;
create policy "pce_delete_auth"
  on public.work_diaries_pce for delete
  to authenticated
  using (true);

-- Trigger updated_at
drop trigger if exists trg_work_diaries_pce_updated on public.work_diaries_pce;
create trigger trg_work_diaries_pce_updated
before update on public.work_diaries_pce
for each row execute procedure public.set_updated_at();


