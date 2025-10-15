# 🔐 Como Configurar Autenticação no Netlify

## Problema
O login funciona no localhost mas não funciona no Netlify porque as variáveis de ambiente do Supabase não estão configuradas.

## Solução

### 1. Obter Credenciais do Supabase

1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá em **Project Settings** (ícone de engrenagem)
3. Clique em **API**
4. Copie as seguintes informações:
   - **Project URL** (URL do projeto)
   - **anon/public key** (Chave anônima/pública)

### 2. Configurar Variáveis no Netlify

1. Acesse seu site no [Netlify](https://app.netlify.com)
2. Vá em **Site settings** > **Environment variables**
3. Clique em **Add a variable**
4. Adicione as seguintes variáveis:

   **Variável 1:**
   - Key: `VITE_SUPABASE_URL`
   - Value: Cole a URL do projeto Supabase
   - Scopes: Selecione todas

   **Variável 2:**
   - Key: `VITE_SUPABASE_ANON_KEY`
   - Value: Cole a chave anônima do Supabase
   - Scopes: Selecione todas

5. Clique em **Save**

### 3. Configurar URLs Autorizadas no Supabase

1. Volte ao Supabase
2. Vá em **Authentication** > **URL Configuration**
3. Em **Site URL**, adicione a URL do seu site Netlify (ex: `https://seu-site.netlify.app`)
4. Em **Redirect URLs**, adicione:
   - `https://seu-site.netlify.app`
   - `https://seu-site.netlify.app/**`
   - `http://localhost:5173` (para desenvolvimento)
   - `http://localhost:5173/**`

### 4. Fazer Novo Deploy

Após configurar as variáveis de ambiente, faça um novo deploy:

**Opção 1 - Pelo painel do Netlify:**
1. Vá em **Deploys**
2. Clique em **Trigger deploy** > **Deploy site**

**Opção 2 - Por Git:**
```bash
git add .
git commit -m "chore: adiciona configuração Netlify"
git push origin main
```

O Netlify vai detectar o push e fazer o deploy automaticamente.

### 5. Testar

1. Acesse seu site no Netlify
2. Tente fazer login
3. Agora deve funcionar! ✅

## Modo Local (sem Supabase)

Se você não configurar as variáveis de ambiente, o sistema funciona em **modo local** usando localStorage:

- Email padrão: `admin@geoteste.com`
- Senha padrão: `123456`

**Atenção:** Neste modo, os dados ficam apenas no navegador e não são sincronizados entre dispositivos.

## Troubleshooting

### Login ainda não funciona após configurar

1. **Limpe o cache do navegador** e recarregue a página
2. **Verifique as variáveis** no Netlify (Site settings > Environment variables)
3. **Verifique os URLs** no Supabase (Authentication > URL Configuration)
4. **Veja os logs** no Netlify (Deploys > [último deploy] > Deploy log)

### Erro "Invalid login credentials"

- Certifique-se de que o usuário está cadastrado no Supabase
- Verifique se o email foi confirmado
- Tente criar uma nova conta primeiro

### Erro de CORS

- Adicione a URL do Netlify nas configurações de CORS do Supabase
- Verifique se as URLs autorizadas estão corretas

## Variáveis de Ambiente Locais (Desenvolvimento)

Para desenvolvimento local, crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

**Importante:** Nunca commite o arquivo `.env` no Git!

