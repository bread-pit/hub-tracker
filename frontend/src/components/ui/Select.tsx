import React from 'react'

interface Option {
  value: string;
  label: string;
  group?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  icon?: React.ReactNode;
  options: Option[];
}

export function Select({ label, hint, icon, options, className = '', ...props }: SelectProps) {
  const baseSelectCls =
    'w-full bg-surface-2 border border-border rounded-md text-text text-sm ' +
    'px-3 py-2 outline-none transition cursor-pointer appearance-none ' +
    'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:bg-[#1c2433]'

  // Group options if they have a group property
  const groupedOptions: Record<string, Option[]> = {}
  const ungroupedOptions: Option[] = []

  options.forEach(opt => {
    if (opt.group) {
      if (!groupedOptions[opt.group]) groupedOptions[opt.group] = []
      groupedOptions[opt.group].push(opt)
    } else {
      ungroupedOptions.push(opt)
    }
  })

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
        <select
          className={`${baseSelectCls} ${icon ? 'pl-8' : ''} ${className}`}
          {...props}
        >
          {ungroupedOptions.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-surface text-text">
              {opt.label}
            </option>
          ))}
          {Object.entries(groupedOptions).map(([group, opts]) => (
            <optgroup key={group} label={group} className="bg-surface text-muted py-2">
              {opts.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-surface text-text">
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="absolute right-2.5 text-muted pointer-events-none">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
