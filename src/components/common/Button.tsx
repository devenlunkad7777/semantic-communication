import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  primary = true, 
  disabled = false,
  className = ''
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-all';
  const primaryClasses = 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600';
  const secondaryClasses = 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600';
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  const buttonClasses = `${baseClasses} ${primary ? primaryClasses : secondaryClasses} ${disabled ? disabledClasses : ''} ${className}`;
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </motion.button>
  );
};

export default Button;