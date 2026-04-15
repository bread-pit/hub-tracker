import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Input } from './components/ui/Input'
import { Select } from './components/ui/Select'
import { Button } from './components/ui/Button'
import { Banner } from './components/ui/Banner'
import { LabelSelector } from './components/github/LabelSelector'
import type { LabelType } from './components/github/LabelSelector'
import { MarkdownToolbar } from './components/ui/MarkdownToolbar'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface Repo { id: number; full_name: string; name: string; description: string; stars: number; language: string }

function App() {
  const [repoList, setRepoList] = useState<Repo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(true)
  const [repo, setRepo] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedLabels, setSelectedLabels] = useState<LabelType[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [issueUrl, setIssueUrl] = useState('')
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/repos`)
        const data = await res.json()
        if (res.ok) {
          setRepoList(data)
          if (data.length > 0) setRepo(data[0].full_name)
        }
      } finally {
        setLoadingRepos(false)
      }
    }
    load()
  }, [])

  const toggleLabel = (label: LabelType) =>
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repo || !title) return

    setStatus('loading')
    setErrorMsg('')
    setIssueUrl('')

    try {
      const res = await fetch(`${API_BASE_URL}/api/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo,
          title,
          body,
          labels: selectedLabels
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`)
      }

      setIssueUrl(data.html_url)
      setStatus('success')
      setTitle('')
      setBody('')
      setSelectedLabels([])
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const reset = () => { setStatus('idle'); setIssueUrl(''); setErrorMsg('') }

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        const prefix = (body.length > 0 && !body.endsWith('\n')) ? '\n\n' : ''
        setBody(prev => prev + `${prefix}![image](${data.url})\n`)
      } else {
        throw new Error(data.detail || 'Upload failed')
      }
    } catch (err: any) {
      setErrorMsg(err.message)
      setStatus('error')
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const onPaste = (e: React.ClipboardEvent) => {
    const item = e.clipboardData.items[0]
    if (item?.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        e.preventDefault()
        handleImageUpload(file)
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-bg"
      style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, #1a2744 0%, transparent 70%), #0d1117' }}>

      <Header />

      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-4 pb-8">
        <div className="w-full max-w-4xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">

          <div className="px-7 pt-7 pb-5 border-b border-border bg-linear-to-b from-surface-2 to-surface">
            <h1 className="text-head text-xl font-bold tracking-tight mb-1">Create a New Issue</h1>
            <p className="text-muted text-sm">Submit issues directly via the backend server</p>
          </div>

          {status === 'success' && (
            <Banner
              type="success"
              message="Issue created successfully!"
              link={{ text: issueUrl, url: issueUrl }}
              onDismiss={reset}
            />
          )}

          {status === 'error' && (
            <Banner
              type="error"
              message={errorMsg}
              onDismiss={reset}
            />
          )}

          <form className="px-7 py-6 flex flex-col gap-5" onSubmit={handleSubmit}>

            <Select
              id="repo"
              label="Repository"
              hint={loadingRepos ? 'Loading…' : `${repoList.length} repo${repoList.length !== 1 ? 's' : ''} available`}
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              disabled={loadingRepos || repoList.length === 0}
              options={
                loadingRepos
                  ? [{ value: '', label: 'Loading repositories…' }]
                  : repoList.length > 0
                    ? repoList.map(r => ({ value: r.full_name, label: r.name }))
                    : [{ value: '', label: 'No repositories found' }]
              }
              icon={
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              }
            />

            <Input
              id="title"
              label="Issue Title"
              placeholder="Short, descriptive title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <LabelSelector selectedLabels={selectedLabels} onToggle={toggleLabel} />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-head text-xs font-semibold">Description</span>
                <div className="flex bg-surface-2 border border-border rounded-md overflow-hidden">
                  {(['write', 'preview'] as const).map((tab) => (
                    <button key={tab} type="button" onClick={() => setActiveTab(tab)}
                      className={`px-3.5 py-1 text-xs font-semibold capitalize transition cursor-pointer
                              ${activeTab === tab ? 'bg-accent text-white' : 'text-muted hover:text-text'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'write' ? (
                <>
                  <MarkdownToolbar
                    textareaId="body"
                    value={body}
                    onChange={setBody}
                    onUpload={handleImageUpload}
                    uploading={isUploading}
                  />
                  <div
                    className={`relative w-full rounded-b-md overflow-hidden transition-all
                      ${isDragging ? 'ring-2 ring-accent ring-inset' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                  >
                    <textarea
                      id="body"
                      rows={10}
                      placeholder="Describe the issue in detail. Markdown is supported. Drag and drop or paste images here."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      onPaste={onPaste}
                      className={`w-full bg-surface-2 border border-border text-text text-xs leading-relaxed font-mono px-3 py-2 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 focus:bg-[#1c2433] resize-y min-h-[300px]
                        ${isDragging ? 'opacity-50' : ''}`}
                    />
                    {isDragging && (
                      <div className="absolute inset-0 flex items-center justify-center bg-accent/10 backdrop-blur-[1px] pointer-events-none border-2 border-dashed border-accent m-1 rounded-md">
                        <div className="bg-surface px-4 py-2 rounded-lg shadow-xl border border-border flex items-center gap-2 animate-bounce">
                          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-head text-sm font-semibold">Drop image to upload</span>
                        </div>
                      </div>
                    )}
                    {isUploading && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-surface/80 backdrop-blur px-3 py-1.5 rounded-full border border-border shadow-lg z-10">
                        <svg className="animate-spin h-3.5 w-3.5 text-accent" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-[10px] font-medium text-head">Uploading image...</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-surface-2 border border-border rounded-md px-4 py-3 min-h-[300px] overflow-auto">
                  {body ? (
                    <div className="prose-md">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          img: ({ ...props }) => (
                            <img
                              {...props}
                              className="max-w-full h-auto rounded-lg border border-border shadow-md my-4"
                              onError={(e) => {
                                console.error("Image load error:", e.currentTarget.src);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )
                        }}
                      >
                        {body}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted text-xs italic">Nothing to preview yet.</p>
                  )}
                </div>
              )}
              <p className="text-muted text-[11px]">Markdown supported — headers, lists, code blocks, and more.</p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-muted text-xs font-mono">{title.length} chars in title</span>
              <Button type="submit" loading={status === 'loading'} disabled={!repo || !title}>
                {status === 'loading' ? 'Submitting…' : 'Submit Issue'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default App
