'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Plus, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TechTagInputProps {
  /** Controlled array of current tags */
  value: string[]
  onChange: (tags: string[]) => void
  /** Global suggestions fetched from the DB */
  suggestions: string[]
  disabled?: boolean
  placeholder?: string
}

export function TechTagInput({
  value,
  onChange,
  suggestions,
  disabled,
  placeholder = 'Add technology...',
}: TechTagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const trimmed = inputValue.trim()

  // Suggestions = global suggestions that are NOT already added, filtered by current input
  const filtered = suggestions.filter(
    (s) =>
      !value.some((v) => v.toLowerCase() === s.toLowerCase()) &&
      (trimmed === '' || s.toLowerCase().includes(trimmed.toLowerCase())),
  )

  const showCreate =
    trimmed.length > 0 &&
    !value.some((v) => v.toLowerCase() === trimmed.toLowerCase()) &&
    !suggestions.some((s) => s.toLowerCase() === trimmed.toLowerCase())

  const dropdownItems = showCreate
    ? [{ type: 'create' as const, label: trimmed }, ...filtered.map((s) => ({ type: 'suggest' as const, label: s }))]
    : filtered.map((s) => ({ type: 'suggest' as const, label: s }))

  // Reset highlight when dropdown items change
  useEffect(() => {
    setHighlightIndex(-1)
  }, [inputValue])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const addTag = useCallback(
    (tag: string) => {
      const clean = tag.trim()
      if (!clean) return
      if (value.some((v) => v.toLowerCase() === clean.toLowerCase())) return
      onChange([...value, clean])
      setInputValue('')
      setDropdownOpen(false)
      setHighlightIndex(-1)
      inputRef.current?.focus()
    },
    [value, onChange],
  )

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index))
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (highlightIndex >= 0 && dropdownItems[highlightIndex]) {
        addTag(dropdownItems[highlightIndex].label)
      } else if (trimmed) {
        addTag(trimmed)
      }
      return
    }

    if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.length - 1)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => Math.min(i + 1, dropdownItems.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => Math.max(i - 1, -1))
      return
    }

    if (e.key === 'Escape') {
      setDropdownOpen(false)
      setInputValue('')
    }
  }

  const showDropdown = dropdownOpen && (dropdownItems.length > 0)

  return (
    <div ref={containerRef} className="relative">
      {/* Tag container + inline input */}
      <div
        className={cn(
          'flex flex-wrap gap-1.5 min-h-[44px] px-2.5 py-2 rounded-xl border border-border bg-background transition-all cursor-text',
          !disabled && 'focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand',
          disabled && 'opacity-50 pointer-events-none',
        )}
        onClick={() => {
          if (!disabled) {
            inputRef.current?.focus()
            setDropdownOpen(true)
          }
        }}
      >
        {value.map((tag, i) => (
          <span
            key={tag + i}
            className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-medium bg-muted border border-border text-foreground"
          >
            <Hash size={9} className="shrink-0 text-muted-foreground" />
            {tag}
            <button
              type="button"
              disabled={disabled}
              onClick={(e) => { e.stopPropagation(); removeTag(i) }}
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X size={9} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          disabled={disabled}
          placeholder={value.length === 0 ? placeholder : ''}
          onChange={(e) => {
            setInputValue(e.target.value)
            setDropdownOpen(true)
          }}
          onFocus={() => setDropdownOpen(true)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[100px] bg-transparent text-foreground text-sm placeholder:text-muted-foreground outline-none py-0.5"
        />
      </div>

      {/* Hint text */}
      {!disabled && (
        <p className="text-[10px] text-muted-foreground mt-1">
          Press <kbd className="px-1 py-px rounded border border-border bg-muted text-[9px]">Enter</kbd> or <kbd className="px-1 py-px rounded border border-border bg-muted text-[9px]">,</kbd> to add &middot; <kbd className="px-1 py-px rounded border border-border bg-muted text-[9px]">Backspace</kbd> to remove last
        </p>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="max-h-44 overflow-y-auto py-1">
            {dropdownItems.map((item, idx) => (
              <button
                key={item.type + item.label}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); addTag(item.label) }}
                onMouseEnter={() => setHighlightIndex(idx)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors',
                  highlightIndex === idx ? 'bg-muted' : 'hover:bg-muted/60',
                  item.type === 'create' ? '' : 'text-foreground',
                )}
              >
                {item.type === 'create' ? (
                  <>
                    <Plus size={13} className="shrink-0" style={{ color: '#f4a295' }} />
                    <span>
                      Add <strong>&ldquo;{item.label}&rdquo;</strong>
                    </span>
                  </>
                ) : (
                  <>
                    <Hash size={12} className="shrink-0 text-muted-foreground" />
                    <span className="text-foreground">{item.label}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
