# 🚀 Guia de Deploy no Netlify

## Problema Comum
Se o banco de dados para de funcionar após o deploy, é porque as **variáveis de ambiente** não foram configuradas.

## Como Configurar o Netlify

### 1. Acesse as Configurações do Site
1. Vá para https://app.netlify.com
2. Selecione seu site
3. Clique em **Site settings**
4. No menu lateral, clique em **Environment variables**

### 2. Adicione as Variáveis do Supabase
Clique em **Add a variable** e adicione:

#### Variável 1:
- **Key:** `VITE_SUPABASE_URL`
- **Value:** URL do seu projeto Supabase (exemplo: `https://xxxxx.supabase.co`)

#### Variável 2:
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Chave anônima/pública do Supabase (começa com `eyJ...`)

### 3. Onde Encontrar as Credenciais do Supabase

1. Acesse https://supabase.com
2. Entre no seu projeto
3. Clique em **Settings** (engrenagem)
4. Clique em **API** no menu lateral
5. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### 4. Faça um Novo Deploy

Após adicionar as variáveis:
1. No Netlify, vá em **Deploys**
2. Clique em **Trigger deploy**
3. Selecione **Clear cache and deploy site**

## ✅ Verificar se Funcionou

Após o deploy:
1. Abra o site no Netlify
2. Abra o Console do navegador (F12)
3. Tente fazer login
4. Deve aparecer no console: `🔄 Inicializando AuthContext (modo local)` ou mensagens do Supabase

Se aparecer erros de autenticação do Supabase, as variáveis foram configuradas corretamente!
Se continuar em modo local sem funcionar, verifique se as variáveis foram adicionadas corretamente.

## 🔒 Segurança

⚠️ **NUNCA** commite o arquivo `.env` ou `.env.local` no Git!
Esses arquivos contêm credenciais sensíveis e devem estar no `.gitignore`.

