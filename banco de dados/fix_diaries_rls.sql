-- Script para permitir que todos os usuários vejam todos os diários
-- Execute este script no SQL Editor do Supabase

-- 1. Remover políticas antigas para work_diaries
DROP POLICY IF EXISTS "Users can view their own diaries" ON work_diaries;
DROP POLICY IF EXISTS "Users can insert their own diaries" ON work_diaries;
DROP POLICY IF EXISTS "Users can update their own diaries" ON work_diaries;
DROP POLICY IF EXISTS "Users can delete their own diaries" ON work_diaries;
DROP POLICY IF EXISTS "Admins can view all diaries" ON work_diaries;
DROP POLICY IF EXISTS "Admins can manage all diaries" ON work_diaries;

-- 2. Criar novas políticas que permitem acesso total para usuários autenticados

-- Política para SELECT: Usuários autenticados podem ver todos os diários
CREATE POLICY "authenticated_users_can_view_all_diaries"
  ON work_diaries FOR SELECT
  TO authenticated
  USING (true);

-- Política para INSERT: Usuários autenticados podem criar diários
CREATE POLICY "authenticated_users_can_insert_diaries"
  ON work_diaries FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para UPDATE: Usuários autenticados podem atualizar diários
CREATE POLICY "authenticated_users_can_update_diaries"
  ON work_diaries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para DELETE: Usuários autenticados podem deletar diários
CREATE POLICY "authenticated_users_can_delete_diaries"
  ON work_diaries FOR DELETE
  TO authenticated
  USING (true);

-- 3. Verificar se RLS está habilitado na tabela
ALTER TABLE work_diaries ENABLE ROW LEVEL SECURITY;

-- 4. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'work_diaries';
