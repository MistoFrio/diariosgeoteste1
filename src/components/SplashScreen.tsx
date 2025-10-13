import React, { useEffect, useState } from 'react';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-green-500 to-green-700 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl mb-6 shadow-2xl overflow-hidden bg-white animate-scale-in">
          <img 
            src="/logogeoteste.png" 
            alt="Geoteste" 
            className="w-full h-full object-contain p-2 animate-float" 
          />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 animate-slide-in">Geoteste</h1>
        <p className="text-white/90 text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Diários de Obra
        </p>
        <div className="mt-8 flex justify-center">
          <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

