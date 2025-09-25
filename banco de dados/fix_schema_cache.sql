-- Script para corrigir relacionamentos e limpar schema cache
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar foreign key constraint de work_diaries para profiles
DO $$
BEGIN
    -- Verificar se a constraint já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'work_diaries_user_id_fkey_profiles'
        AND table_name = 'work_diaries'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Adicionar a foreign key constraint
        ALTER TABLE public.work_diaries
        ADD CONSTRAINT work_diaries_user_id_fkey_profiles
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key constraint adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Foreign key constraint já existe';
    END IF;
END $$;

-- 2. Limpar schema cache do PostgREST
NOTIFY pgrst, 'reload schema';

-- 3. Verificar se a constraint foi criada
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name = 'work_diaries'
    AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.constraint_name;

-- 4. Testar se o relacionamento funciona
SELECT 
    wd.id,
    wd.client_name,
    wd.created_at,
    p.name as user_name
FROM public.work_diaries wd
LEFT JOIN public.profiles p ON wd.user_id = p.id
LIMIT 5;
