# 🚀 Como Hospedar e Gerar APK do Geoteste

## Passo 1: Hospedar o Site (HTTPS obrigatório)

### Opção A: Vercel (Recomendado - Mais Fácil) ⭐

1. **Criar conta gratuita**
   - Acesse: https://vercel.com
   - Clique em "Sign Up"
   - Entre com GitHub

2. **Conectar repositório**
   - Clique em "New Project"
   - Importe: `MistoFrio/Diariosgeoteste`
   - Autorize o Vercel

3. **Configurar build**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - Pronto! URL: `https://geoteste.vercel.app`

5. **Domínio customizado (Opcional)**
   - Settings → Domains
   - Adicione: `geoteste.app` ou similar
   - Configure DNS conforme instruções

---

### Opção B: Netlify

1. **Criar conta**
   - https://netlify.com
   - Sign up com GitHub

2. **Novo site**
   - "New site from Git"
   - Escolha GitHub
   - Selecione repositório

3. **Build settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Deploy**
   - Deploy site
   - URL: `https://geoteste.netlify.app`

---

### Opção C: GitHub Pages

1. **Criar branch gh-pages**
```bash
npm run build
cd dist
git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/MistoFrio/Diariosgeoteste.git main:gh-pages
cd ..
```

2. **Configurar no GitHub**
   - Settings → Pages
   - Source: gh-pages branch
   - Save
   - URL: `https://mistofrio.github.io/Diariosgeoteste`

---

## Passo 2: Configurar Variáveis de Ambiente

### No Vercel/Netlify:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_do_supabase
```

Settings → Environment Variables → Add

---

## Passo 3: Gerar APK

### Método 1: PWABuilder (MAIS FÁCIL) ⭐

1. **Acessar PWABuilder**
   - https://www.pwabuilder.com

2. **Validar PWA**
   - Cole URL: `https://geoteste.vercel.app`
   - Clique em "Start"
   - Aguarde validação

3. **Gerar APK**
   - Clique em "Package for Stores"
   - Escolha "Android"
   - Configure:
     ```
     Package ID: com.geoteste.diarios
     App name: Geoteste
     Version: 1.0.0
     Signing: Generate new signing key
     ```

4. **Download**
   - Clique em "Generate"
   - Aguarde processamento (1-2 min)
   - Download do APK

5. **Testar**
   - Transfira APK para Android
   - Instale (ative fontes desconhecidas)
   - Teste todas funcionalidades

---

### Método 2: Capacitor (Mais Controle)

#### Windows:

```powershell
# Executar script
.\scripts\build-apk.ps1
```

#### Manual:

```bash
# 1. Instalar Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Build do projeto
npm run build

# 3. Adicionar Android
npx cap add android

# 4. Sincronizar
npx cap sync

# 5. Abrir no Android Studio
npx cap open android

# 6. No Android Studio:
# Build → Generate Signed Bundle/APK → APK
```

---

## Passo 4: Publicar na Play Store (Opcional)

### Requisitos:

1. **Conta Google Play Console**
   - https://play.google.com/console
   - Taxa única: 25 USD

2. **Preparar assets**
   - Ícone: 512x512 PNG
   - Feature graphic: 1024x500 PNG
   - Screenshots: pelo menos 2 (phone)
   - Descrição curta: max 80 caracteres
   - Descrição completa: max 4000 caracteres

3. **Política de privacidade**
   - Criar página web com política
   - URL obrigatória

4. **Criar release**
   - Production → Create new release
   - Upload APK/AAB
   - Preencher changelog
   - Review e publicar

5. **Aguardar aprovação**
   - Google revisa em 1-7 dias
   - Pode pedir ajustes
   - App fica público após aprovação

---

## 🔐 Criar Keystore (Para publicar)

```bash
# Gerar keystore
keytool -genkey -v -keystore geoteste.keystore -alias geoteste -keyalg RSA -keysize 2048 -validity 10000

# Informações:
# Senha: [escolha senha forte e ANOTE]
# Nome: Geoteste
# Unidade organizacional: Desenvolvimento
# Organização: Geoteste
# Cidade: [sua cidade]
# Estado: [seu estado]
# País: BR

# IMPORTANTE: Guardar arquivo .keystore e senha em local seguro!
# Se perder, não consegue atualizar o app na Play Store!
```

---

## 📱 Testar APK no Celular

### Opção 1: Via cabo USB

```bash
# Ativar modo desenvolvedor no Android:
# Configurações → Sobre o telefone → Tocar 7x em "Número da versão"

# Ativar depuração USB:
# Configurações → Opções do desenvolvedor → Depuração USB

# Instalar ADB
# Windows: https://developer.android.com/studio/releases/platform-tools

# Conectar celular via USB

# Instalar APK
adb install app-release.apk
```

### Opção 2: Via arquivo

1. Transfira APK para celular (WhatsApp, email, etc.)
2. Ative "Fontes desconhecidas" nas configurações
3. Abra o arquivo APK no celular
4. Clique em "Instalar"

---

## 🔄 Atualizar o App

### PWA (automático):
- Apenas faça deploy da nova versão
- Service Worker atualiza automaticamente

### APK via Play Store:
1. Altere versão em `capacitor.config.ts`:
   ```ts
   version: '1.0.1'
   ```
2. Gere novo APK
3. Upload na Play Console
4. Usuários recebem update automático

---

## 📊 Monitoramento

### Analytics (Opcional):

```bash
npm install @capacitor-community/firebase-analytics
```

### Crashlytics (Opcional):

```bash
npm install @capacitor-community/firebase-crashlytics
```

---

## ✅ Checklist Pré-Launch

- [ ] Site hospedado com HTTPS
- [ ] PWA validado (lighthouse score 90+)
- [ ] Service Worker funcionando
- [ ] Manifest.json configurado
- [ ] Ícones em todas resoluções
- [ ] APK testado em diferentes dispositivos
- [ ] Todas funcionalidades testadas
- [ ] Política de privacidade publicada
- [ ] Screenshots tirados
- [ ] Descrição escrita
- [ ] Keystore guardado em local seguro

---

## 🆘 Problemas Comuns

### "PWA não passa na validação"
- Verificar HTTPS
- Verificar manifest.json
- Verificar service worker registrado
- Lighthouse score mínimo: 90

### "APK não instala"
- Ativar fontes desconhecidas
- Verificar versão Android (mínima: 5.0)
- Verificar espaço disponível

### "App fecha ao abrir"
- Verificar logs: `adb logcat`
- Verificar service worker
- Verificar URLs no manifest

---

## 📞 Próximos Passos

Quer que eu te ajude com algum desses passos?

1. Hospedar no Vercel agora?
2. Configurar variáveis de ambiente?
3. Gerar APK via PWABuilder?
4. Setup do Capacitor?

É só pedir! 🚀

