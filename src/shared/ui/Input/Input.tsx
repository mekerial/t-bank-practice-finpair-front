import { forwardRef, type InputHTMLAttributes } from 'react'
import './Input.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, className, ...rest },
  ref
) {
  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={['field__input', className ?? ''].filter(Boolean).join(' ')}
        {...rest}
      />
    </div>
  )
})

export default Input
