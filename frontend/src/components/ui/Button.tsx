import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  children, 
  variant = 'primary', 
  loading, 
  icon, 
  className = '', 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-accent hover:bg-accent-hover text-white shadow-[0_2px_8px_#58a6ff33] hover:shadow-[0_4px_16px_#58a6ff44]',
    secondary: 'bg-surface-2 text-muted border border-border hover:border-accent/40 hover:text-text',
    ghost: 'bg-transparent text-muted hover:text-text underline',
    danger: 'text-muted hover:text-red underline',
    success: 'text-green bg-green/10 border border-green/30 hover:bg-green/20'
  }

  const baseCls = 
    'flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-lg transition ' +
    'hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed ' +
    'disabled:hover:translate-y-0 cursor-pointer'

  return (
    <button 
      className={`${baseCls} ${variants[variant]} ${className}`} 
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}
