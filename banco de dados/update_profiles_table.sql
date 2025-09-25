-- Script para atualizar a tabela profiles existente
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna email se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Renomear coluna name para full_name temporariamente (se existir)
-- (Isso é para evitar conflito se já existir uma coluna name)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'name' AND table_schema = 'public') THEN
        ALTER TABLE public.profiles RENAME COLUMN name TO full_name_temp;
    END IF;
END $$;

-- 3. Criar nova coluna name (se não existir)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS name text;

-- 4. Copiar dados de full_name_temp para name (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'profiles' AND column_name = 'full_name_temp' AND table_schema = 'public') THEN
        UPDATE public.profiles SET name = full_name_temp WHERE name IS NULL;
        ALTER TABLE public.profiles DROP COLUMN full_name_temp;
    END IF;
END $$;

-- 5. Tornar a coluna name obrigatória (NOT NULL)
ALTER TABLE public.profiles 
ALTER COLUMN name SET NOT NULL;

-- 6. Atualizar registros que ainda têm name NULL
UPDATE public.profiles 
SET name = 'Usuário' 
WHERE name IS NULL OR name = '';

-- 7. Recriar o trigger para usar a coluna name
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'),
    new.email,
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Verificar a estrutura final da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Verificar quantos registros existem
SELECT 
  'Total de perfis' as info,
  COUNT(*) as total
FROM public.profiles;
