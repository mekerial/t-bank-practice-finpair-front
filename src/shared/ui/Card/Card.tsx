import type { ReactNode } from 'react'
import './Card.css'

interface CardProps {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

export default function Card({
  title,
  action,
  children,
  className = ''
}: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || action) && (
        <header className="card__header">
          {title && <h3 className="card__title">{title}</h3>}
          {action && <div className="card__action">{action}</div>}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  )
}
