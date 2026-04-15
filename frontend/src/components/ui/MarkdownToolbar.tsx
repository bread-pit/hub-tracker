import React, { useRef } from 'react'

interface MarkdownToolbarProps {
  textareaId: string
  value: string
  onChange: (value: string) => void
}

type Action = {
  title: string
  icon: React.ReactNode
  action: (selected: string) => { prefix: string; suffix: string; placeholder: string }
  block?: boolean
}

const DIVIDER = '|'

const ACTIONS: (Action | typeof DIVIDER)[] = [
  {
    title: 'Heading',
    icon: <span className="font-bold text-[11px] leading-none">H</span>,
    action: () => ({ prefix: '### ', suffix: '', placeholder: 'Heading' }),
    block: true
  },
  {
    title: 'Bold',
    icon: <span className="font-bold text-[12px] leading-none">B</span>,
    action: () => ({ prefix: '**', suffix: '**', placeholder: 'bold text' }),
  },
  {
    title: 'Italic',
    icon: <span className="italic text-[12px] leading-none">I</span>,
    action: () => ({ prefix: '_', suffix: '_', placeholder: 'italic text' }),
  },
  {
    title: 'Quote',
    icon: (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M1 2.75A.75.75 0 0 1 1.75 2h12.5a.75.75 0 0 1 0 1.5H1.75A.75.75 0 0 1 1 2.75Zm4 5A.75.75 0 0 1 5.75 7h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 7.75Zm0 5a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Z"/>
      </svg>
    ),
    action: () => ({ prefix: '> ', suffix: '', placeholder: 'quote' }),
    block: true
  },
  {
    title: 'Code',
    icon: (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M0 1.75C0 .784.784 0 1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25Zm7.47 3.97a.75.75 0 0 1 1.06 1.06L9.06 8l1.22 1.47a.75.75 0 1 1-1.06 1.06L7.47 8.53a.75.75 0 0 1 0-1.06ZM5.22 5.47a.75.75 0 0 0-1.06 1.06L5.94 8 4.16 9.53a.75.75 0 1 0 1.06 1.06l2.25-2.06a.75.75 0 0 0 0-1.06Z"/>
      </svg>
    ),
    action: () => ({ prefix: '`', suffix: '`', placeholder: 'code' }),
  },
  {
    title: 'Link',
    icon: (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        <path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 2 2 0 0 0 2.83 0l2.5-2.5a2 2 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a2 2 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 2 2 0 0 0-2.83 0l-2.5 2.5a2 2 0 0 0 0 2.83Z"/>
      </svg>
    ),
    action: () => ({ prefix: '[', suffix: '](url)', placeholder: 'link text' }),
  },
  DIVIDER,
  {
    title: 'Bulleted list',
    icon: (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm3.75-1.5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Zm0 5a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM2 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm0 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
      </svg>
    ),
    action: () => ({ prefix: '- ', suffix: '', placeholder: 'list item' }),
    block: true
  },
  {
    title: 'Numbered list',
    icon: (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M5 3.25a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 3.25Zm0 5a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 5 8.25Zm0 5a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75ZM.5 2.5A.5.5 0 0 1 1 2h1a.5.5 0 0 1 .5.5v2.5H3a.5.5 0 0 1 0 1H1a.5.5 0 0 1 0-1h.5V3H1a.5.5 0 0 1-.5-.5Zm1.5 9A.5.5 0 0 0 1 11H.5a.5.5 0 0 0 0 1H1v.5H.5a.5.5 0 0 0 0 1H3a.5.5 0 0 0 0-1h-.5V12h.5a.5.5 0 0 0 0-1H2Zm-.5-4.5A.5.5 0 0 0 1 7h-.5a.5.5 0 0 0 0 1H1v.5H.5a.5.5 0 0 0-.354.854l1 1a.5.5 0 0 0 .708-.708L1.707 9H3a.5.5 0 0 0 0-1H2V7.5A.5.5 0 0 0 1.5 7Z"/>
      </svg>
    ),
    action: () => ({ prefix: '1. ', suffix: '', placeholder: 'list item' }),
    block: true
  },
  {
    title: 'Task list',
    icon: (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M2.5 1.75a.25.25 0 0 1 .25-.25h8.5a.25.25 0 0 1 .25.25v7.736a.75.75 0 0 0 1.5 0V1.75A1.75 1.75 0 0 0 11.25 0h-8.5A1.75 1.75 0 0 0 1 1.75v11.5c0 .966.784 1.75 1.75 1.75h3.17a.75.75 0 0 0 0-1.5H2.75a.25.25 0 0 1-.25-.25ZM4.75 4a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5Zm0 3a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5Zm5.5 5.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm1 2.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 1 0v-3a.5.5 0 0 0-.5-.5Z"/>
      </svg>
    ),
    action: () => ({ prefix: '- [ ] ', suffix: '', placeholder: 'task item' }),
    block: true
  },
  DIVIDER,
  {
    title: 'Mention a user',
    icon: (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M4.243 4.757a4.5 4.5 0 0 1 7.851 3.857 3.5 3.5 0 0 1-3.594 3.036A3 3 0 1 1 8 5.5a.75.75 0 0 1 0 1.5 1.5 1.5 0 1 0 1.5 1.5 3 3 0 1 0-5.294-1.939 3.001 3.001 0 0 0 .037 3.696.75.75 0 1 1-1.185.919A4.5 4.5 0 0 1 4.243 4.757Z"/>
      </svg>
    ),
    action: () => ({ prefix: '@', suffix: '', placeholder: 'username' }),
  },
  {
    title: 'Reference',
    icon: (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/>
      </svg>
    ),
    action: () => ({ prefix: '#', suffix: '', placeholder: '1234' }),
  },
  {
    title: 'Image',
    icon: (
      <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
        <path d="M16 13.25A1.75 1.75 0 0 1 14.25 15H1.75A1.75 1.75 0 0 1 0 13.25V2.75A1.75 1.75 0 0 1 1.75 1h12.5A1.75 1.75 0 0 1 16 2.75Zm-1.5 0V2.75a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25ZM5 8.5a.75.75 0 0 0-.6 1.2l2.5 3.333A.75.75 0 0 0 8.5 13h4.25a.75.75 0 0 0 .6-1.2l-2.5-3.333a.75.75 0 0 0-1.2 0L8.5 10.4l-.5-.667A.75.75 0 0 0 7.4 9.5Zm-.5-2a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/>
      </svg>
    ),
    action: () => ({ prefix: '![', suffix: '](image-url)', placeholder: 'alt text' }),
  },
  DIVIDER,
]

export function MarkdownToolbar({ textareaId, value, onChange }: MarkdownToolbarProps) {
  const historyRef = useRef<string[]>([value])
  const historyIndexRef = useRef(0)

  const pushHistory = (val: string) => {
    const history = historyRef.current.slice(0, historyIndexRef.current + 1)
    history.push(val)
    historyRef.current = history
    historyIndexRef.current = history.length - 1
  }

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--
      onChange(historyRef.current[historyIndexRef.current])
    }
  }

  const applyAction = (action: Action) => {
    const ta = document.getElementById(textareaId) as HTMLTextAreaElement | null
    if (!ta) return

    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = value.slice(start, end)
    const { prefix, suffix, placeholder } = action.action(selected)

    let before = value.slice(0, start)
    let after = value.slice(end)
    let insertion = selected || placeholder

    if (action.block) {
      // Ensure it starts on a new line
      if (before.length > 0 && !before.endsWith('\n')) before += '\n'
    }

    const newValue = before + prefix + insertion + suffix + after
    pushHistory(newValue)
    onChange(newValue)

    // Restore focus and selection
    requestAnimationFrame(() => {
      ta.focus()
      const cursor = (before + prefix).length
      const selEnd = cursor + insertion.length
      ta.setSelectionRange(cursor, selEnd)
    })
  }

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 bg-surface border border-border border-b-0 rounded-t-md">
      {ACTIONS.map((item, i) =>
        item === DIVIDER ? (
          <span key={`div-${i}`} className="w-px h-4 bg-border mx-1.5 shrink-0" />
        ) : (
          <button
            key={item.title}
            type="button"
            title={item.title}
            onClick={() => applyAction(item as Action)}
            className="w-7 h-7 flex items-center justify-center rounded text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
          >
            {item.icon}
          </button>
        )
      )}
      {/* Undo */}
      <span className="w-px h-4 bg-border mx-1.5 shrink-0" />
      <button
        type="button"
        title="Undo"
        onClick={undo}
        className="w-7 h-7 flex items-center justify-center rounded text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
          <path d="M1.22 6.28a.75.75 0 0 0 0 1.06l3.5 3.5a.75.75 0 1 0 1.06-1.06L3.06 7l2.72-2.72a.75.75 0 0 0-1.06-1.06L1.22 6.28ZM3.75 7a.75.75 0 0 0 .75.75h9a.75.75 0 0 0 0-1.5h-9A.75.75 0 0 0 3.75 7Z"/>
        </svg>
      </button>
    </div>
  )
}
