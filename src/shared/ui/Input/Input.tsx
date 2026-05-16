import { forwardRef, type InputHTMLAttributes } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label?: string
  readOnlyMuted?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, className, readOnly, disabled, readOnlyMuted = true, ...rest },
  ref
) {
  const isLocked = Boolean(readOnly || disabled)
  const showMutedReadOnly = isLocked && readOnlyMuted
  return (
    <div className={'field' + (showMutedReadOnly ? ' field--readonly' : '')}>
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        readOnly={readOnly}
        disabled={disabled}
        className={[
          'field__input',
          showMutedReadOnly ? 'field__input--readonly' : '',
          className ?? ''
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />
    </div>
  )
})

export default Input
