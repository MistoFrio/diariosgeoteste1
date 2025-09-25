-- Script para corrigir políticas do Supabase Storage
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar se o bucket existe
SELECT * FROM storage.buckets WHERE id = 'signatures';

-- 2. Se não existir, criar o bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signatures',
  'signatures', 
  true,
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 1048576,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png'];

-- 3. Deletar políticas existentes se houver
DROP POLICY IF EXISTS "Usuários podem ver suas próprias assinaturas" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem fazer upload de suas assinaturas" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem atualizar suas assinaturas" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar suas assinaturas" ON storage.objects;

-- 4. Criar políticas mais simples e permissivas
CREATE POLICY "Permitir acesso público às assinaturas"
ON storage.objects FOR SELECT
USING (bucket_id = 'signatures');

CREATE POLICY "Permitir upload de assinaturas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Permitir atualização de assinaturas"
ON storage.objects FOR UPDATE
USING (bucket_id = 'signatures')
WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Permitir exclusão de assinaturas"
ON storage.objects FOR DELETE
USING (bucket_id = 'signatures');

-- 5. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
