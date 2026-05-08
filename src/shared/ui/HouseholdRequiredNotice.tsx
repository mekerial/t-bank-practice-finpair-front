import axios from 'axios'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../config/routes'
import { getErrorMessage } from '../lib/asyncUtils'
import { createCoupleRequest } from '../api/settingsApi'
import Card from './Card'
import './HouseholdRequiredNotice.css'

interface HouseholdRequiredNoticeProps {
  title?: string
  description?: string
  /** После успешного создания пары — обновить данные страницы без reload */
  onCoupleCreated?: () => void | Promise<void>
}

export function isHouseholdMissingError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const requestUrl = String(error.config?.url ?? '').toLowerCase()
    const isDomainEndpoint =
      requestUrl.includes('/couple') ||
      requestUrl.includes('/finance/dashboard') ||
      requestUrl.includes('/transactions') ||
      requestUrl.includes('/goals') ||
      requestUrl.includes('/analytics')

    // Для экранов пары/аналитики/транзакций 404 обычно означает:
    // household/couple для пользователя еще не создан.
    if (status === 404 && isDomainEndpoint) {
      return true
    }
  }

  const message = getErrorMessage(error).toLowerCase()
  return (
    (message.includes('household') && message.includes('not found')) ||
    (message.includes('couple') && message.includes('not found'))
  )
}

export default function HouseholdRequiredNotice({
  title = 'Сначала получите invite-код',
  description = 'У вас пока нет общего household. Перейдите в Настройки, получите invite-код и отправьте его партнеру.',
  onCoupleCreated
}: HouseholdRequiredNoticeProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [actionError, setActionError] = useState('')

  const handleCreateAndContinue = async () => {
    setActionError('')
    setIsCreating(true)
    try {
      await createCoupleRequest()
      await onCoupleCreated?.()
    } catch (e) {
      setActionError(getErrorMessage(e))
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <div className="household-required">
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="household-required__actions">
          <button
            type="button"
            className="btn btn--primary household-required__btn"
            onClick={handleCreateAndContinue}
            disabled={isCreating}
          >
            {isCreating ? 'Создаем invite-код…' : 'Получить invite-код и продолжить'}
          </button>
          <Link to={ROUTES.SETTINGS} className="btn btn--secondary household-required__btn">
            Перейти в настройки
          </Link>
        </div>
        {actionError && <p className="household-required__error">{actionError}</p>}
      </div>
    </Card>
  )
}
