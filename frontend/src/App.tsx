import { useState } from 'react'
import { Header } from './components/Header'
import { Input } from './components/ui/Input'
import { Select } from './components/ui/Select'
import { Button } from './components/ui/Button'
import { Banner } from './components/ui/Banner'
import { LabelSelector } from './components/github/LabelSelector'
import type { LabelType } from './components/github/LabelSelector'

type Status = 'idle' | 'loading' | 'success' | 'error'
type RepoFetchStatus = 'idle' | 'loading' | 'done' | 'error'

interface Repo { id: number; full_name: string; name: string; description: string; stars: number; language: string }

function App() {
  const [username, setUsername]           = useState('')
  const [repoList, setRepoList]           = useState<Repo[]>([])
  const [repoFetchStatus, setRepoFetchStatus] = useState<RepoFetchStatus>('idle')
  const [repoFetchError, setRepoFetchError]   = useState('')
  const [repo, setRepo]                   = useState('')
  const [title, setTitle]                 = useState('')
  const [body, setBody]                   = useState('')
  const [selectedLabels, setSelectedLabels] = useState<LabelType[]>([])
  const [status, setStatus]               = useState<Status>('idle')
  const [errorMsg, setErrorMsg]           = useState('')
  const [issueUrl, setIssueUrl]           = useState('')
  const [activeTab, setActiveTab]         = useState<'write' | 'preview'>('write')

  const fetchRepos = async () => {
    const trimmed = username.trim()
    if (!trimmed) return
    setRepoFetchStatus('loading')
    setRepoFetchError('')
    setRepoList([])
    setRepo('')
    try {
      const res = await fetch(`http://localhost:5000/api/repos/${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch repositories.')
      setRepoList(data)
      if (data.length > 0) setRepo(data[0].full_name)
      setRepoFetchStatus('done')
    } catch (err) {
      setRepoFetchStatus('error')
      setRepoFetchError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const handleUsernameKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); fetchRepos() }
  }

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
      const res = await fetch('http://localhost:5000/api/issues', {
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

            {/* Step 1: GitHub username + search */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-head text-xs font-semibold flex items-center gap-2">
                GitHub User / Org
                <span className="text-muted font-normal font-mono text-[10px]">press Enter or click Search</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1 flex items-center">
                  <div className="absolute left-2.5 text-muted pointer-events-none">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="8" r="4"/><path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="e.g. torvalds or vercel"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleUsernameKey}
                    className="w-full bg-surface-2 border border-border rounded-md text-text text-sm placeholder:text-muted pl-8 pr-3 py-2 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 focus:bg-[#1c2433]"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchRepos}
                  disabled={!username.trim() || repoFetchStatus === 'loading'}
                  className="px-4 py-2 rounded-md bg-accent text-white text-xs font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1.5 cursor-pointer"
                >
                  {repoFetchStatus === 'loading' ? (
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
                    </svg>
                  )}
                  Search
                </button>
              </div>
              {repoFetchStatus === 'error' && (
                <p className="text-red-400 text-[11px] mt-0.5">{repoFetchError}</p>
              )}
            </div>

            {/* Step 2: Repo dropdown — only shown after a successful search */}
            {repoFetchStatus === 'done' && (
              <Select
                id="repo"
                label="Repository"
                hint={`${repoList.length} repo${repoList.length !== 1 ? 's' : ''} found`}
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                disabled={repoList.length === 0}
                options={
                  repoList.length > 0
                    ? repoList.map(r => ({ value: r.full_name, label: r.name }))
                    : [{ value: '', label: 'No public repositories found' }]
                }
                icon={
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18"/>
                  </svg>
                }
              />
            )}

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
                <textarea 
                  id="body" 
                  rows={10} 
                  placeholder="Describe the issue in detail. Markdown is supported."
                  value={body} 
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-md text-text text-xs leading-relaxed font-mono px-3 py-2 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 focus:bg-[#1c2433] resize-y min-h-[300px]" 
                />
              ) : (
                <div className="bg-surface-2 border border-border rounded-md px-3 py-3 min-h-[300px]">
                  {body
                    ? <pre className="text-text text-xs leading-relaxed whitespace-pre-wrap font-sans">{body}</pre>
                    : <p className="text-muted text-xs italic">Nothing to preview yet.</p>}
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

        <p className="mt-4 text-[11px] text-muted">
          ⚖️ Tokens are managed by the backend server for security.
        </p>
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
