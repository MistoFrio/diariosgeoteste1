-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients USING gin (to_tsvector('portuguese', name));
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at);

-- Políticas de acesso: usuários autenticados podem ler todos os clientes
DROP POLICY IF EXISTS "clients_select_authenticated" ON public.clients;
CREATE POLICY "clients_select_authenticated"
  ON public.clients
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Apenas admins podem inserir novos clientes
DROP POLICY IF EXISTS "clients_insert_admin" ON public.clients;
CREATE POLICY "clients_insert_admin"
  ON public.clients
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Apenas admins podem atualizar clientes
DROP POLICY IF EXISTS "clients_update_admin" ON public.clients;
CREATE POLICY "clients_update_admin"
  ON public.clients
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Apenas admins podem deletar clientes
DROP POLICY IF EXISTS "clients_delete_admin" ON public.clients;
CREATE POLICY "clients_delete_admin"
  ON public.clients
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trg_clients_updated ON public.clients;
CREATE TRIGGER trg_clients_updated
  BEFORE UPDATE ON public.clients
  FOR EACH ROW 
  EXECUTE PROCEDURE public.set_updated_at();

-- Inserir clientes de exemplo
INSERT INTO public.clients (name, email, phone, address) VALUES
  ('Construtora ABC Ltda', 'contato@abc.com.br', '(11) 3333-4444', 'Av. Paulista, 1000 - São Paulo, SP'),
  ('Incorporadora XYZ', 'projetos@xyz.com.br', '(21) 5555-6666', 'Rua Copacabana, 200 - Rio de Janeiro, RJ')
ON CONFLICT DO NOTHING;

-- Verificar se a tabela foi criada
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'clients'
ORDER BY ordinal_position;

