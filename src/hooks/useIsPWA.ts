import { useEffect, useState } from 'react';

export const useIsPWA = () => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Detecta se está rodando como PWA instalado
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsPWA(isStandalone);
  }, []);

  return isPWA;
};

