-- Script para adicionar campo de assinatura na tabela profiles
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna de assinatura na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS signature text;

-- Atualizar registros existentes com assinatura padrão se estiver vazio
UPDATE public.profiles 
SET signature = 'Assinatura Digital'
WHERE signature IS NULL OR signature = '';

-- Verificar a estrutura atualizada da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;
