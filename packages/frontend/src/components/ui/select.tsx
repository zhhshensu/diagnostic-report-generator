import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  disabled?: boolean
}

function Select({ value, onValueChange, placeholder, children, disabled }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [open])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {value || placeholder || 'Select...'}
        <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<SelectItemProps>, {
                onSelect: (val: string) => { onValueChange(val); setOpen(false) },
                selected: value,
              })
            }
            return child
          })}
        </div>
      )}
    </div>
  )
}

interface SelectItemProps {
  value: string
  children: React.ReactNode
  onSelect?: (val: string) => void
  selected?: string
}

function SelectItem({ value, children, onSelect, selected }: SelectItemProps) {
  return (
    <div
      className={cn(
        'cursor-pointer px-3 py-2 text-sm hover:bg-accent',
        selected === value && 'bg-accent font-medium',
      )}
      onClick={() => onSelect?.(value)}
    >
      {children}
    </div>
  )
}

export { Select, SelectItem }
