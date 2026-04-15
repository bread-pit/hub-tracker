import { Button } from './Button'

interface BannerProps {
  type: 'success' | 'error';
  title?: string;
  message: string;
  link?: { text: string; url: string };
  onDismiss: () => void;
}

export function Banner({ type, title, message, link, onDismiss }: BannerProps) {
  if (type === 'success') {
    return (
      <div className="flex items-center gap-3.5 px-6 py-4 bg-[#1a3a24] border-b border-green/30 animate-[fadeIn_0.3s_ease]">
        <div className="shrink-0 w-8 h-8 rounded-full bg-green flex items-center justify-center text-white">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-green text-sm font-semibold">{title || 'Success!'}</p>
          {link ? (
            <a href={link.url} target="_blank" rel="noopener noreferrer"
               className="text-accent text-xs hover:underline break-all">
              {link.text} ↗
            </a>
          ) : (
             <p className="text-gray-300 text-xs">{message}</p>
          )}
        </div>
        <Button variant="success" onClick={onDismiss} className="px-3 py-1.5 h-auto text-xs">
          New Issue
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-6 py-3.5 bg-[#3d1a1a] border-b border-red/30 animate-[fadeIn_0.3s_ease]">
      <svg className="w-4.5 h-4.5 text-red shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
      </svg>
      <p className="flex-1 text-red text-sm">{message}</p>
      <Button variant="danger" onClick={onDismiss} className="px-0 py-0 h-auto text-xs">
        Dismiss
      </Button>
    </div>
  )
}
