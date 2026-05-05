import type { ReactNode } from 'react'
import type { AsyncStatus } from '../../hooks/useAsyncData'
import { getErrorMessage } from '../../lib/asyncUtils'
import Button from '../Button'
import Spinner from '../Spinner'
import './AsyncDataView.css'

interface AsyncDataViewProps {
  status: AsyncStatus
  error: unknown
  onRetry?: () => void
  loadingLabel?: string
  children: ReactNode
}

export default function AsyncDataView({
  status,
  error,
  onRetry,
  loadingLabel = 'Загрузка…',
  children
}: AsyncDataViewProps) {
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="async-data-view" aria-busy="true">
        <Spinner label={loadingLabel} />
        <p className="async-data-view__label">{loadingLabel}</p>
      </div>
    )
  }

  if (status === 'error') {
    const message = getErrorMessage(error)

    return (
      <div className="async-data-view" role="alert">
        <h2 className="async-data-view__error-title">Не удалось загрузить данные</h2>
        <p className="async-data-view__error-text">{message}</p>
        {onRetry && (
          <div className="async-data-view__actions">
            <Button type="button" variant="primary" onClick={onRetry}>
              Повторить
            </Button>
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
}
