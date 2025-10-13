import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar prompt apenas se o usuário não instalou antes
      const hasDeclined = localStorage.getItem('pwa-install-declined');
      if (!hasDeclined) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000); // Aguardar 3 segundos antes de mostrar
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to the install prompt: ${outcome}`);
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-declined', 'true');
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:hidden animate-slide-in">
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-2xl p-4 text-white">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <img 
              src="/logogeoteste.png" 
              alt="Geoteste" 
              className="w-10 h-10 object-contain" 
            />
          </div>
          
          <div className="flex-1 pr-6">
            <h3 className="font-bold text-lg mb-1">Instalar Geoteste</h3>
            <p className="text-sm text-white/90 mb-3">
              Instale o app para acesso rápido e use mesmo offline!
            </p>
            
            <button
              onClick={handleInstall}
              className="w-full bg-white text-green-600 font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/90 active:scale-95 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Instalar Agora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

