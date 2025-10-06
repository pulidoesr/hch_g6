// components/Button.tsx
import { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'delete';
  className?: string;
  onClick?: () => void;
};

// Componente de botão simples para consistência visual
export default function Button({ children, variant = 'primary', className = '', onClick }: ButtonProps) {
  let baseStyle = 'px-4 py-2 font-semibold text-sm rounded-lg shadow-md transition duration-150 ease-in-out ';
  
  if (variant === 'primary') {
    baseStyle += 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2';
  } else if (variant === 'secondary') {
    baseStyle += 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2';
  } else if (variant === 'delete') {
    baseStyle += 'bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2';
  }

  return (
    <button className={`${baseStyle} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}