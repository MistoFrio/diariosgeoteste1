# Script para gerar APK do Geoteste
# Execute: .\scripts\build-apk.ps1

Write-Host "🚀 Iniciando build do APK Geoteste..." -ForegroundColor Green
Write-Host ""

# Verificar se Node.js está instalado
Write-Host "📦 Verificando Node.js..." -ForegroundColor Cyan
node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js não encontrado. Instale em: https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar se npm está instalado
Write-Host "📦 Verificando npm..." -ForegroundColor Cyan
npm --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm não encontrado." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Dependências verificadas!" -ForegroundColor Green
Write-Host ""

# Perguntar qual método usar
Write-Host "Escolha o método para gerar APK:" -ForegroundColor Yellow
Write-Host "1. PWABuilder (Mais fácil - recomendado)" -ForegroundColor White
Write-Host "2. Capacitor (Mais controle)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Digite 1 ou 2"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "📱 MÉTODO PWABuilder" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para gerar APK com PWABuilder:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Primeiro, você precisa hospedar o site (HTTPS obrigatório)" -ForegroundColor White
    Write-Host "   Opções gratuitas:" -ForegroundColor White
    Write-Host "   - Vercel: https://vercel.com" -ForegroundColor Gray
    Write-Host "   - Netlify: https://netlify.com" -ForegroundColor Gray
    Write-Host "   - GitHub Pages: https://pages.github.com" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Depois de hospedar, acesse:" -ForegroundColor White
    Write-Host "   https://www.pwabuilder.com" -ForegroundColor Green
    Write-Host ""
    Write-Host "3. Cole a URL do seu site" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Clique em 'Package for Stores' → 'Android'" -ForegroundColor White
    Write-Host ""
    Write-Host "5. Baixe o APK pronto!" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Quer hospedar agora? Posso te ajudar!" -ForegroundColor Yellow
    
} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "📱 MÉTODO Capacitor" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Verificar se Capacitor já está instalado
    if (-not (Test-Path "node_modules/@capacitor")) {
        Write-Host "📦 Instalando Capacitor..." -ForegroundColor Cyan
        npm install @capacitor/core @capacitor/cli @capacitor/android
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Erro ao instalar Capacitor" -ForegroundColor Red
            exit 1
        }
    }
    
    # Verificar se já foi inicializado
    if (-not (Test-Path "capacitor.config.ts")) {
        Write-Host "⚙️ Inicializando Capacitor..." -ForegroundColor Cyan
        npx cap init "Geoteste" "com.geoteste.diarios" --web-dir=dist
    }
    
    # Build do projeto
    Write-Host "🔨 Fazendo build do projeto..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro no build" -ForegroundColor Red
        exit 1
    }
    
    # Adicionar plataforma Android se não existir
    if (-not (Test-Path "android")) {
        Write-Host "📱 Adicionando plataforma Android..." -ForegroundColor Cyan
        npx cap add android
    }
    
    # Sincronizar
    Write-Host "🔄 Sincronizando..." -ForegroundColor Cyan
    npx cap sync
    
    Write-Host ""
    Write-Host "✅ Projeto preparado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️ PRÓXIMOS PASSOS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Instale o Android Studio:" -ForegroundColor White
    Write-Host "   https://developer.android.com/studio" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Abra o projeto Android:" -ForegroundColor White
    Write-Host "   npx cap open android" -ForegroundColor Green
    Write-Host ""
    Write-Host "3. No Android Studio:" -ForegroundColor White
    Write-Host "   Build → Generate Signed Bundle/APK → APK" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Siga o wizard para criar/usar keystore" -ForegroundColor White
    Write-Host ""
    Write-Host "5. APK estará em:" -ForegroundColor White
    Write-Host "   android/app/release/app-release.apk" -ForegroundColor Gray
    Write-Host ""
    
} else {
    Write-Host "❌ Opção inválida" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📄 Mais informações: BUILD_APK.md" -ForegroundColor Cyan
Write-Host ""

