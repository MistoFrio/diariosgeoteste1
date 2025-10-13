import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

/**
 * Componente de estado vazio reutilizável
 * Usado quando não há dados para exibir em listas, tabelas, etc.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Ícone */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-green-100 dark:bg-green-900/20 rounded-full blur-2xl opacity-50" />
        <div className="relative bg-gray-50 dark:bg-gray-800 rounded-full p-6">
          <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* Texto */}
      <div className="text-center max-w-md">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
          {description}
        </p>
      </div>

      {/* Ações */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="btn-primary w-full sm:w-auto"
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="btn-secondary w-full sm:w-auto"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;

