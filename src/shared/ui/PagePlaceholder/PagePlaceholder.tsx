import type { ReactNode } from 'react'
import './PagePlaceholder.css'

interface PagePlaceholderProps {
  title: string
  description?: string
  children?: ReactNode
}

export default function PagePlaceholder({
  title,
  description,
  children
}: PagePlaceholderProps) {
  return (
    <section className="page-placeholder">
      <h1 className="page-placeholder__title">{title}</h1>
      {description && (
        <p className="page-placeholder__description">{description}</p>
      )}
      {children && <div className="page-placeholder__body">{children}</div>}
    </section>
  )
}
