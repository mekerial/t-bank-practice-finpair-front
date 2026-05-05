import type { HTMLAttributes } from 'react'
import './Spinner.css'

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'md' | 'sm'
  label?: string
}

export default function Spinner({
  size = 'md',
  label,
  className = '',
  role = 'status',
  ...rest
}: SpinnerProps) {
  const cn = ['spinner', size === 'sm' ? 'spinner--sm' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={cn}
      role={role}
      aria-label={label ?? 'Загрузка'}
      {...rest}
    />
  )
}
