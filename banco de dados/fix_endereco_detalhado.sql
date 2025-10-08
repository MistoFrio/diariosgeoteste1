-- Script de migração para adicionar coluna endereco_detalhado
-- Execute este script no SQL Editor do Supabase

-- Adicionar a coluna endereco_detalhado se não existir
ALTER TABLE public.work_diaries 
ADD COLUMN IF NOT EXISTS endereco_detalhado JSONB;

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.work_diaries.endereco_detalhado IS 'Endereço detalhado com estado, cidade, rua e número em formato JSON';

-- Limpar o cache do schema para refletir as mudanças
NOTIFY pgrst, 'reload schema';

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'work_diaries'
  AND column_name = 'endereco_detalhado';

-- Exemplo de estrutura do JSON que será armazenado:
-- {
--   "estado_id": 13,
--   "estado_nome": "Minas Gerais", 
--   "cidade_id": 1,
--   "cidade_nome": "Belo Horizonte",
--   "rua": "Rua das Flores",
--   "numero": "123"
-- }

