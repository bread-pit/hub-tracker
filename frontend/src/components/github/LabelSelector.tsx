import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export type CustomLabel = {
  name: string;
  description: string;
  color: string; // hex
}

export type LabelType = string;

export const DEFAULT_LABELS = [
  { name: 'bug',           color: '#d73a4a', text: 'text-red' },
  { name: 'enhancement',   color: '#a2eeef', text: 'text-[#a2eeef]' },
  { name: 'question',      color: '#d876e3', text: 'text-[#d876e3]' },
  { name: 'documentation', color: '#0075ca', text: 'text-[#79c0ff]' },
  { name: 'help wanted',   color: '#008672', text: 'text-[#56d364]' },
]

const PRESET_COLORS = [
  '#d73a4a', '#a2eeef', '#d876e3', '#0075ca', '#008672', 
  '#e99695', '#fef2c0', '#cfd3d7', '#b60205', '#f9d0c4'
]

interface LabelSelectorProps {
  selectedLabels: LabelType[];
  onToggle: (label: LabelType) => void;
}

export function LabelSelector({ selectedLabels, onToggle }: LabelSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  const handleCreate = () => {
    if (newName.trim()) {
      onToggle(newName.trim())
      // Reset and close
      setNewName('')
      setNewDesc('')
      setNewColor(PRESET_COLORS[0])
      setIsModalOpen(false)
    }
  }

  const isDefault = (name: string) => DEFAULT_LABELS.some(l => l.name === name)

  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-head text-xs font-semibold">Labels</span>
      
      <div className="flex flex-wrap gap-2 items-center">
        {/* Default Labels */}
        {DEFAULT_LABELS.map((l) => {
          const active = selectedLabels.includes(l.name)
          return (
            <button key={l.name} type="button" onClick={() => onToggle(l.name)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition cursor-pointer
                      ${active
                        ? `border-current ring-1 ring-white/10` 
                        : 'bg-surface-2 text-muted border-border hover:border-accent/40 hover:text-text'
                      }`}
                    style={active ? { backgroundColor: `${l.color}22`, color: l.color, borderColor: l.color } : {}}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
              {l.name}
            </button>
          )
        })}

        {/* Custom Labels (selected ones not in default) */}
        {selectedLabels
          .filter(name => !isDefault(name))
          .map(name => (
            <button key={name} type="button" onClick={() => onToggle(name)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-accent/15 text-accent border border-accent/40 rounded-full text-xs font-semibold ring-1 ring-accent/20 cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-accent" />
              {name}
              <span className="ml-1 opacity-60">×</span>
            </button>
          ))
        }

        {/* The Plus Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          title="Add custom label"
          className="w-7 h-7 flex items-center justify-center rounded-full border border-dashed border-border text-muted hover:border-accent hover:text-accent transition cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>

      {/* Create Label Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create Custom Label"
      >
        <div className="flex flex-col gap-5">
          {/* Preview */}
          <div className="flex flex-col gap-2 p-4 bg-bg rounded-lg border border-border">
            <span className="text-[10px] uppercase tracking-wider text-muted font-bold">Preview</span>
            <div className="flex">
              <span 
                className="px-3 py-1 rounded-full text-xs font-bold border"
                style={{ 
                  backgroundColor: `${newColor}22`, 
                  color: newColor, 
                  borderColor: newColor 
                }}
              >
                {newName || 'Label Name'}
              </span>
            </div>
            {newDesc && <p className="text-[11px] text-muted italic mt-1">{newDesc}</p>}
          </div>

          <div className="flex flex-col gap-4">
            <Input 
              label="Label Name" 
              placeholder="e.g. priority:high"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            
            <Input 
              label="Description (optional)" 
              placeholder="What this label is for"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />

            <div className="flex flex-col gap-2">
              <label className="text-head text-xs font-semibold">Choose Color</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition ${newColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                {/* Custom Hex Input */}
                <div className="relative group">
                   <input 
                    type="text" 
                    value={newColor} 
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-20 bg-surface-2 border border-border rounded px-2 py-1 text-xs text-white font-mono uppercase outline-none focus:border-accent" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <Button 
               variant="secondary" 
               onClick={() => setIsModalOpen(false)} 
               className="flex-1"
            >
              Cancel
            </Button>
            <Button 
               onClick={handleCreate} 
               disabled={!newName.trim()} 
               className="flex-1"
            >
              Add Label
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
