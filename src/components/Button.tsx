import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "font-sans font-bold py-3 px-6 rounded-lg transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-action text-white hover:bg-opacity-90 shadow-md hover:shadow-lg",
    secondary: "bg-brand text-white hover:bg-opacity-90 shadow-md",
    outline: "border-2 border-brand text-brand hover:bg-brand hover:text-white"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};