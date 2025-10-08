-- Adicionar colunas para endereço detalhado na tabela work_diaries
ALTER TABLE work_diaries 
ADD COLUMN IF NOT EXISTS endereco_detalhado JSONB;

-- Comentário para documentação
COMMENT ON COLUMN work_diaries.endereco_detalhado IS 'Endereço detalhado com estado, cidade, rua e número em formato JSON';

-- Exemplo de estrutura do JSON:
-- {
--   "estado_id": 13,
--   "estado_nome": "Minas Gerais", 
--   "cidade_id": 1,
--   "cidade_nome": "Belo Horizonte",
--   "rua": "Rua das Flores",
--   "numero": "123"
-- }

