import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80; // Distância mínima para ativar o refresh

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setCanPull(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0 && container.scrollTop === 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance * 0.5, 100)); // Resistência ao puxar
      }
    };

    const handleTouchEnd = async () => {
      if (!canPull || isRefreshing) return;

      if (pullDistance > threshold) {
        setIsRefreshing(true);
        if (navigator.vibrate) {
          navigator.vibrate(20);
        }
        try {
          await onRefresh();
        } catch (error) {
          console.error('Erro ao atualizar:', error);
        } finally {
          setIsRefreshing(false);
        }
      }
      
      setPullDistance(0);
      setCanPull(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canPull, isRefreshing, pullDistance, onRefresh]);

  return (
    <div ref={containerRef} className="relative h-full overflow-auto">
      {/* Indicador de Pull to Refresh */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance / threshold,
          transform: `translateY(${-threshold + pullDistance}px)`,
        }}
      >
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
          <RefreshCw
            className={`w-5 h-5 transition-transform duration-200 ${
              isRefreshing ? 'animate-spin' : ''
            } ${pullDistance > threshold ? 'rotate-180' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3.6}deg)` }}
          />
          <span className="text-sm font-medium">
            {isRefreshing
              ? 'Atualizando...'
              : pullDistance > threshold
              ? 'Solte para atualizar'
              : 'Puxe para atualizar'}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

