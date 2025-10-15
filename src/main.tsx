import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './utils/authDebug';
import { registerServiceWorker } from './utils/registerSW';
import { isSupabaseConfigured } from './lib/supabaseClient';

// Registrar Service Worker para PWA
registerServiceWorker();

// Marcadores seguros para diagnóstico em produção
console.log('[Build] PROD:', (import.meta as any).env?.PROD ? 'yes' : 'no');
console.log('[Build] Supabase configured:', isSupabaseConfigured ? 'yes' : 'no');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
