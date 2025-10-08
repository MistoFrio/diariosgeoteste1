# 🔐 Variáveis de Ambiente

## Configuração Local

Crie um arquivo `.env.local` na raiz do projeto com:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Onde Encontrar as Credenciais

1. Acesse https://supabase.com
2. Entre no seu projeto
3. Settings > API
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## Configuração no Netlify

⚠️ **Este é o passo CRUCIAL para o banco funcionar em produção!**

1. Vá para https://app.netlify.com
2. Selecione seu site
3. **Site settings** > **Environment variables**
4. Clique em **Add a variable**
5. Adicione as duas variáveis acima
6. **Trigger deploy** > **Clear cache and deploy site**

Sem isso, o banco de dados NÃO funcionará no Netlify! 🚨

