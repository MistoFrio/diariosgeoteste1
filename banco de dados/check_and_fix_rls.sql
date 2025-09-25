-- Script para verificar e corrigir políticas RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'work_diaries';

-- 2. Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'work_diaries';

-- 3. Remover TODAS as políticas existentes
DROP POLICY IF EXISTS "Users can view their own diaries" ON work_diaries;
DROP POLICY IF EXISTS "Users can insert their own diaries" ON work_diaries;
DROP POLICY IF EXISTS "Users can update their own diaries" ON work_diaries;
DROP POLICY IF EXISTS "Users can delete their own diaries" ON work_diaries;
DROP POLICY IF EXISTS "Admins can view all diaries" ON work_diaries;
DROP POLICY IF EXISTS "Admins can manage all diaries" ON work_diaries;
DROP POLICY IF EXISTS "authenticated_users_can_view_all_diaries" ON work_diaries;
DROP POLICY IF EXISTS "authenticated_users_can_insert_diaries" ON work_diaries;
DROP POLICY IF EXISTS "authenticated_users_can_update_diaries" ON work_diaries;
DROP POLICY IF EXISTS "authenticated_users_can_delete_diaries" ON work_diaries;

-- 4. Desabilitar RLS temporariamente
ALTER TABLE work_diaries DISABLE ROW LEVEL SECURITY;

-- 5. Verificar se foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'work_diaries';

-- 6. Testar se consegue ver os dados
SELECT COUNT(*) as total_diaries FROM work_diaries;

-- 7. Se quiser reabilitar RLS com políticas corretas, execute:
/*
ALTER TABLE work_diaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_authenticated_users"
  ON work_diaries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
*/
