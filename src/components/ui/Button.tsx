import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-asianow-blue text-white hover:bg-asianow-dark focus-visible:ring-asianow-blue',
  secondary: 'bg-asianow-red text-white hover:bg-red-700 focus-visible:ring-asianow-red',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-300',
  outline: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus-visible:ring-gray-300',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
};
