import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children: ReactNode
  type?: 'button' | 'submit' | 'reset'
  variant?: ButtonVariant
  fullWidth?: boolean
}

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  className,
  ...rest
}: ButtonProps) {
  const cn = [
    'btn',
    `btn--${variant}`,
    fullWidth ? 'btn--full' : '',
    className ?? ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={cn} {...rest}>
      {children}
    </button>
  )
}
