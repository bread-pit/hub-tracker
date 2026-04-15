import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({ label, hint, icon, className = '', ...props }: InputProps) {
  const baseInputCls =
    'w-full bg-surface-2 border border-border rounded-md text-text text-sm ' +
    'placeholder:text-muted px-3 py-2 outline-none transition ' +
    'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:bg-[#1c2433]'

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={props.id} className="flex items-center gap-2 text-head text-xs font-semibold">
          {label}
          {hint && <span className="text-muted font-normal font-mono text-[10px]">{hint}</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-2.5 text-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          className={`${baseInputCls} ${icon ? 'pl-8' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  )
}
