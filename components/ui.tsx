import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-md focus:ring-emerald-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm focus:ring-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    outline: "bg-transparent border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => {
  return (
    <input 
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
        className
      )} 
      {...props} 
    />
  );
};

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => {
    return (
      <div className="relative">
        <select 
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            className
          )} 
          {...props} 
        >
            {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    );
  };

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  return (
    <div 
      className={cn("rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm", className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export const Badge: React.FC<{ variant?: 'success' | 'warning' | 'danger' | 'neutral', children: React.ReactNode }> = ({ variant = 'neutral', children }) => {
    const variants = {
        success: "bg-emerald-100 text-emerald-800 border-emerald-200",
        warning: "bg-amber-100 text-amber-800 border-amber-200",
        danger: "bg-red-100 text-red-800 border-red-200",
        neutral: "bg-slate-100 text-slate-800 border-slate-200"
    };
    return (
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant])}>
            {children}
        </span>
    );
};
