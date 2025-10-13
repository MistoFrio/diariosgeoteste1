import React from 'react';

/**
 * Skeleton base - componente reutilizável para criar loaders animados
 */
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

/**
 * Skeleton para card de diário
 */
export const DiaryCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5 md:p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton para lista de diários - mostra múltiplos cards
 */
export const DiaryListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <DiaryCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Skeleton para linha de tabela
 */
export const TableRowSkeleton: React.FC = () => (
  <tr className="border-b border-gray-200 dark:border-gray-700">
    <td className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
    <td className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
    <td className="px-4 py-3">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    </td>
  </tr>
);

/**
 * Skeleton para tabela completa
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-4 py-3"><Skeleton className="h-4 w-24" /></th>
          <th className="px-4 py-3"><Skeleton className="h-4 w-32" /></th>
          <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
          <th className="px-4 py-3"><Skeleton className="h-4 w-16" /></th>
          <th className="px-4 py-3"><Skeleton className="h-4 w-20" /></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRowSkeleton key={index} />
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Skeleton para card de cliente/usuário
 */
export const UserCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-5">
    <div className="flex items-center gap-4 mb-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
    
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
      <Skeleton className="h-9 flex-1" />
      <Skeleton className="h-9 w-20" />
    </div>
  </div>
);

/**
 * Skeleton para formulário
 */
export const FormSkeleton: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index}>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex gap-3 pt-4">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

/**
 * Spinner animado - para ações rápidas
 */
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div
      className={`${sizeClasses[size]} border-green-600 border-t-transparent rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Carregando"
    />
  );
};

/**
 * Loading overlay - para cobrir conteúdo durante loading
 */
export const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-3" />
      <p className="text-gray-600 dark:text-gray-300 font-medium">{message}</p>
    </div>
  </div>
);

/**
 * Estado de loading para página inteira
 */
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" className="mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">{message}</p>
    </div>
  </div>
);

export default Skeleton;

