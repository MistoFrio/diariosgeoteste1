import React from 'react';
import { Home, FileText, Plus, Building2, Users } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  userRole?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onPageChange, userRole }) => {
  const baseItems = [
    { key: 'dashboard', label: 'Início', icon: Home },
    { key: 'diaries', label: 'Diários', icon: FileText },
    { key: 'new-diary', label: '', icon: Plus, isFloating: true },
    { key: 'profile', label: 'Perfil', icon: Users },
  ];

  const adminItems = [
    { key: 'dashboard', label: 'Início', icon: Home },
    { key: 'diaries', label: 'Diários', icon: FileText },
    { key: 'new-diary', label: '', icon: Plus, isFloating: true },
    { key: 'clients', label: 'Clientes', icon: Building2 },
    { key: 'users', label: 'Usuários', icon: Users },
  ];

  const items = userRole === 'admin' ? adminItems : baseItems;

  const handleClick = (key: string) => {
    // Feedback háptico (vibração) se disponível
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onPageChange(key);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.key;
          
          if (item.isFloating) {
            return (
              <button
                key={item.key}
                onClick={() => handleClick(item.key)}
                className="relative -top-6 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-lg flex items-center justify-center text-white transform transition-all duration-300 active:scale-90 hover:shadow-xl hover:from-green-600 hover:to-green-700"
                aria-label="Novo Diário"
              >
                <Icon className="w-6 h-6" />
                <div className="absolute -inset-1 bg-green-500/20 rounded-full animate-pulse"></div>
              </button>
            );
          }

          return (
            <button
              key={item.key}
              onClick={() => handleClick(item.key)}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-200 ${
                isActive
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <Icon 
                className={`w-6 h-6 transition-all duration-200 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`} 
              />
              <span className={`text-xs font-medium transition-all duration-200 ${
                isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-70'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-green-600 dark:bg-green-400 rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

