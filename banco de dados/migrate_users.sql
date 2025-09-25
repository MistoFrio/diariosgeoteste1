-- Script para migrar usuários existentes do auth.users para profiles
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar a estrutura atual da tabela profiles
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Adicionar as colunas se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Inserir perfis para usuários existentes que não têm perfil
INSERT INTO public.profiles (id, name, email, role, created_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Usuário'),
  au.email,
  'user' as role,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Verificar quantos usuários foram migrados
SELECT 
  'Usuários no auth.users' as tabela,
  COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
  'Perfis na tabela profiles' as tabela,
  COUNT(*) as total
FROM public.profiles;
