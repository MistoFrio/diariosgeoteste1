export const registerServiceWorker = () => {
  // Evitar SW no ambiente de desenvolvimento (Vite dev: portas 5173/5174)
  if (!(import.meta as any).env?.PROD) {
    console.log('[SW] Ignorado no ambiente de desenvolvimento');
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration);
          // Tentar buscar atualização imediatamente ao carregar
          try { registration.update(); } catch {}

          // Quando um novo SW assumir o controle, recarrega para pegar assets novos
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Evitar loop: recarrega apenas uma vez
            if (!(window as any).__swRld) {
              (window as any).__swRld = true;
              window.location.reload();
            }
          });
        })
        .catch((error) => {
          console.log('Falha ao registrar Service Worker:', error);
        });
    });
  }
};

