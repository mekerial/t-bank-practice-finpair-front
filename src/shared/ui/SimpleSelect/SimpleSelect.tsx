import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { IconChevronDown } from '../icons'
import './SimpleSelect.css'

export type SimpleSelectOption<T extends string = string> = {
  value: T
  label: string
}

type SimpleSelectProps<T extends string> = {
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<SimpleSelectOption<T>>
  className?: string
  'aria-label'?: string
}

export default function SimpleSelect<T extends string>({
  value,
  onChange,
  options,
  className,
  'aria-label': ariaLabel
}: SimpleSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = options.find((o) => o.value === value)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return

    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return
      close()
    }

    const onKeyDown = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') close()
    }

    document.addEventListener('mousedown', onDocMouseDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  const rootClass = ['simple-select', className].filter(Boolean).join(' ')

  return (
    <div className={rootClass} ref={rootRef}>
      <button
        type="button"
        className="simple-select__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="simple-select__value">
          {current?.label ?? value}
        </span>
        <IconChevronDown className="simple-select__chevron" aria-hidden />
      </button>

      {open && (
        <ul id={listId} className="simple-select__menu" role="listbox">
          {options.map((opt) => (
            <li key={opt.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={opt.value === value}
                className={
                  'simple-select__option' +
                  (opt.value === value ? ' simple-select__option--selected' : '')
                }
                onClick={() => {
                  onChange(opt.value)
                  close()
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
