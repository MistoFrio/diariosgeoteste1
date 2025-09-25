-- Script para desabilitar temporariamente o RLS na tabela work_diaries
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para testar
ALTER TABLE work_diaries DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'work_diaries';

-- 3. Se quiser reabilitar depois com as políticas corretas, execute:
-- ALTER TABLE work_diaries ENABLE ROW LEVEL SECURITY;
