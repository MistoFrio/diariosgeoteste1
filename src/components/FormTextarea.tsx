import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | null;
  touched?: boolean;
  showSuccess?: boolean;
}

/**
 * Textarea de formulário com validação visual
 */
const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  touched,
  showSuccess = true,
  className = '',
  required,
  ...props
}) => {
  const hasError = touched && error;
  const isValid = touched && !error && props.value && showSuccess;

  const getTextareaClasses = () => {
    const baseClasses =
      'w-full px-3 py-2 text-sm sm:text-base border rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all resize-none';

    if (hasError) {
      return `${baseClasses} border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500`;
    }

    if (isValid) {
      return `${baseClasses} border-green-500 dark:border-green-400 focus:ring-2 focus:ring-green-500 focus:border-green-500`;
    }

    return `${baseClasses} border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-green-500 focus:border-transparent`;
  };

  return (
    <div className={className}>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <textarea {...props} required={required} className={getTextareaClasses()} />

        {/* Ícone de status */}
        {(hasError || isValid) && (
          <div className="absolute right-3 top-3">
            {hasError ? (
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
            )}
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {hasError && (
        <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-fadeIn">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Contador de caracteres (se maxLength estiver definido) */}
      {props.maxLength && props.value && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
          {props.value.toString().length} / {props.maxLength}
        </p>
      )}
    </div>
  );
};

export default FormTextarea;

