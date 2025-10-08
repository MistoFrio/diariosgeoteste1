-- =====================================================
-- Script de criação de tabelas para diários PLACA
-- Pode ser executado múltiplas vezes sem erros
-- =====================================================

-- Tabela principal para diários do tipo PLACA
CREATE TABLE IF NOT EXISTS work_diaries_placa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diary_id UUID NOT NULL REFERENCES work_diaries(id) ON DELETE CASCADE,
  
  -- Equipamentos utilizados
  equipamentos_macaco TEXT,
  equipamentos_celula_carga TEXT,
  equipamentos_manometro TEXT,
  equipamentos_placa_dimensoes TEXT,
  equipamentos_equipamento_reacao TEXT,
  equipamentos_relogios TEXT,
  
  -- Ocorrências
  ocorrencias TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_diary_placa UNIQUE(diary_id)
);

-- Tabela para pontos de ensaio (múltiplos por diário PLACA)
CREATE TABLE IF NOT EXISTS work_diaries_placa_piles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  placa_id UUID NOT NULL REFERENCES work_diaries_placa(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL DEFAULT 1,
  
  -- Dados do ponto de ensaio
  nome TEXT,
  carga_trabalho_1_kgf_cm2 TEXT,
  carga_trabalho_2_kgf_cm2 TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_work_diaries_placa_diary_id ON work_diaries_placa(diary_id);
CREATE INDEX IF NOT EXISTS idx_work_diaries_placa_piles_placa_id ON work_diaries_placa_piles(placa_id);
CREATE INDEX IF NOT EXISTS idx_work_diaries_placa_piles_ordem ON work_diaries_placa_piles(placa_id, ordem);

-- Habilitar RLS (Row Level Security)
ALTER TABLE work_diaries_placa ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_diaries_placa_piles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Remover policies antigas (se existirem)
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own PLACA diaries" ON work_diaries_placa;
DROP POLICY IF EXISTS "Users can insert their own PLACA diaries" ON work_diaries_placa;
DROP POLICY IF EXISTS "Users can update their own PLACA diaries" ON work_diaries_placa;
DROP POLICY IF EXISTS "Users can delete their own PLACA diaries" ON work_diaries_placa;

DROP POLICY IF EXISTS "Users can view their own PLACA piles" ON work_diaries_placa_piles;
DROP POLICY IF EXISTS "Users can insert their own PLACA piles" ON work_diaries_placa_piles;
DROP POLICY IF EXISTS "Users can update their own PLACA piles" ON work_diaries_placa_piles;
DROP POLICY IF EXISTS "Users can delete their own PLACA piles" ON work_diaries_placa_piles;

-- =====================================================
-- Criar policies para work_diaries_placa
-- =====================================================
CREATE POLICY "Users can view their own PLACA diaries"
  ON work_diaries_placa
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM work_diaries wd
      WHERE wd.id = work_diaries_placa.diary_id
      AND wd.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own PLACA diaries"
  ON work_diaries_placa
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_diaries wd
      WHERE wd.id = work_diaries_placa.diary_id
      AND wd.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own PLACA diaries"
  ON work_diaries_placa
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM work_diaries wd
      WHERE wd.id = work_diaries_placa.diary_id
      AND wd.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own PLACA diaries"
  ON work_diaries_placa
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM work_diaries wd
      WHERE wd.id = work_diaries_placa.diary_id
      AND wd.user_id = auth.uid()
    )
  );

-- =====================================================
-- Criar policies para work_diaries_placa_piles
-- =====================================================
CREATE POLICY "Users can view their own PLACA piles"
  ON work_diaries_placa_piles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM work_diaries_placa wp
      JOIN work_diaries wd ON wd.id = wp.diary_id
      WHERE wp.id = work_diaries_placa_piles.placa_id
      AND wd.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own PLACA piles"
  ON work_diaries_placa_piles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_diaries_placa wp
      JOIN work_diaries wd ON wd.id = wp.diary_id
      WHERE wp.id = work_diaries_placa_piles.placa_id
      AND wd.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own PLACA piles"
  ON work_diaries_placa_piles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM work_diaries_placa wp
      JOIN work_diaries wd ON wd.id = wp.diary_id
      WHERE wp.id = work_diaries_placa_piles.placa_id
      AND wd.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own PLACA piles"
  ON work_diaries_placa_piles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM work_diaries_placa wp
      JOIN work_diaries wd ON wd.id = wp.diary_id
      WHERE wp.id = work_diaries_placa_piles.placa_id
      AND wd.user_id = auth.uid()
    )
  );

-- =====================================================
-- Criar ou substituir função de trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_work_diaries_placa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers antigos se existirem
DROP TRIGGER IF EXISTS trigger_update_work_diaries_placa_updated_at ON work_diaries_placa;
DROP TRIGGER IF EXISTS trigger_update_work_diaries_placa_piles_updated_at ON work_diaries_placa_piles;

-- Criar novos triggers
CREATE TRIGGER trigger_update_work_diaries_placa_updated_at
  BEFORE UPDATE ON work_diaries_placa
  FOR EACH ROW
  EXECUTE FUNCTION update_work_diaries_placa_updated_at();

CREATE TRIGGER trigger_update_work_diaries_placa_piles_updated_at
  BEFORE UPDATE ON work_diaries_placa_piles
  FOR EACH ROW
  EXECUTE FUNCTION update_work_diaries_placa_updated_at();

-- =====================================================
-- Comentários para documentação
-- =====================================================
COMMENT ON TABLE work_diaries_placa IS 'Dados específicos de diários do tipo PLACA';
COMMENT ON TABLE work_diaries_placa_piles IS 'Pontos de ensaio para diários PLACA (relação 1:N)';
COMMENT ON COLUMN work_diaries_placa.diary_id IS 'Referência ao diário principal';
COMMENT ON COLUMN work_diaries_placa_piles.placa_id IS 'Referência ao registro PLACA';
COMMENT ON COLUMN work_diaries_placa_piles.ordem IS 'Ordem de exibição dos pontos de ensaio';
