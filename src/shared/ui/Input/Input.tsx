import type { InputHTMLAttributes } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label?: string
}

export default function Input({
  id,
  label,
  className,
  ...rest
}: InputProps) {
  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={['field__input', className ?? ''].filter(Boolean).join(' ')}
        {...rest}
      />
    </div>
  )
}
