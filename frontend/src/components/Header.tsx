export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
            <path d="M9 8V24M23 8V24M9 16H23" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" className="text-head" />
            <circle cx="16" cy="16" r="6.5" stroke="var(--color-accent)" stroke-width="1.8" />
            <circle cx="16" cy="16" r="2.5" fill="var(--color-accent)" />
            <path d="M16 12.5V14M16 18V19.5M12.5 16H14M18 16H19.5" stroke="white" stroke-width="1" stroke-linecap="round" />
          </svg>
          <span className="text-head text-lg font-bold tracking-tight">HubTracker</span>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent bg-accent/10 border border-accent/25 rounded-full px-3 py-1">
          Issue Creator
        </span>
      </div>
    </header>
  )
}
