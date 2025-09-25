-- Script para otimizar armazenamento de assinaturas usando Supabase Storage
-- Execute este script no SQL Editor do Supabase

-- 1. Criar bucket para assinaturas (execute no Storage do Supabase)
-- Vá em Storage > Create Bucket
-- Nome: signatures
-- Público: Sim
-- File size limit: 1MB
-- Allowed MIME types: image/jpeg, image/png

-- 2. Adicionar coluna para URL da assinatura na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS signature_image_url text;

-- 3. Adicionar coluna para URL da assinatura na tabela work_diaries
ALTER TABLE public.work_diaries 
ADD COLUMN IF NOT EXISTS geotest_signature_url text;

-- 4. Criar política RLS para o bucket de assinaturas
-- (Execute no SQL Editor do Supabase)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'signatures',
  'signatures', 
  true,
  1048576, -- 1MB
  ARRAY['image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- 5. Política para permitir que usuários vejam suas próprias assinaturas
CREATE POLICY "Usuários podem ver suas próprias assinaturas"
ON storage.objects FOR SELECT
USING (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Política para permitir que usuários façam upload de suas assinaturas
CREATE POLICY "Usuários podem fazer upload de suas assinaturas"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'signatures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'png')
);

-- 7. Política para permitir que usuários atualizem suas assinaturas
CREATE POLICY "Usuários podem atualizar suas assinaturas"
ON storage.objects FOR UPDATE
USING (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 8. Política para permitir que usuários deletem suas assinaturas
CREATE POLICY "Usuários podem deletar suas assinaturas"
ON storage.objects FOR DELETE
USING (bucket_id = 'signatures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 9. Verificar estrutura atualizada
SELECT 
  'profiles' as tabela,
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
  AND column_name LIKE '%signature%'
UNION ALL
SELECT 
  'work_diaries' as tabela,
  column_name, 
  data_type, 
  is_nullable 
FROM information_schema.columns 
WHERE table_name = 'work_diaries' AND table_schema = 'public'
  AND column_name LIKE '%signature%'
ORDER BY tabela, column_name;
