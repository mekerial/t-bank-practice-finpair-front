import { useMemo } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import Card from '../../shared/ui/Card'
import AsyncDataView from '../../shared/ui/AsyncDataView'
import { useAsyncData } from '../../shared/hooks/useAsyncData'
import {
  type CoupleDetails,
  type CoupleMember,
  fetchCoupleRequest,
  fetchSettingsRequest,
  fetchUserProfileRequest
} from '../../shared/api/settingsApi'
import { fetchDashboard } from '../../shared/api/dashboardApi'
import { ROUTES } from '../../shared/config/routes'
import './profile.css'

function splitTypeLabel(value: string | undefined): string {
  if (value === 'income' || value === 'income_ratio') return 'По доходу'
  if (value === 'custom') return 'Индивидуально'
  return '50/50'
}

function formatMoney(value: number | undefined, currency: 'RUB' | 'USD' | 'EUR' = 'RUB'): string {
  if (value === undefined || Number.isNaN(value)) return '—'
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₽'
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(value))} ${symbol}`
}

export default function ProfilePage() {
  const defaultCouple: CoupleDetails = {
    id: '',
    inviteCode: '—',
    currency: 'RUB' as const,
    splitType: 'equal' as const,
    notifications: {},
    members: [],
    users: []
  }

  const { data, status, error, refetch } = useAsyncData('profile', async () => {
    const [user, settings, couple, dashboard] = await Promise.all([
      fetchUserProfileRequest(),
      fetchSettingsRequest(),
      fetchCoupleRequest().catch((e) => {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          return defaultCouple
        }
        throw e
      }),
      fetchDashboard().catch(() => null)
    ])
    return { user, settings, couple, dashboard }
  })

  const members: CoupleMember[] = data?.couple.members ?? data?.couple.users ?? []
  const hasPartner = members.length > 1
  const currentUser = data?.user
  const currentMember = useMemo(() => {
    if (!currentUser) return undefined
    return members.find((m) => m.userId === currentUser.id)
  }, [members, currentUser])
  const statsByUserId = useMemo(() => {
    const map = new Map<
      string,
      { income: number; expense: number; sharePercent: number }
    >()
    for (const item of data?.dashboard?.partnerStats ?? []) {
      map.set(item.userId, {
        income: item.income,
        expense: item.expense,
        sharePercent: item.sharePercent
      })
    }
    return map
  }, [data?.dashboard?.partnerStats])
  const bothPartners = useMemo(() => {
    return members.map((m) => {
      const stats = statsByUserId.get(m.userId)
      const income =
        currentUser && m.userId === currentUser.id ? currentUser.income : stats?.income
      return {
        ...m,
        income,
        expense: stats?.expense,
        sharePercent: stats?.sharePercent
      }
    })
  }, [members, statsByUserId, currentUser])
  const currency = data?.settings.currency ?? 'RUB'
  const totalIncome = data?.dashboard?.financialLoad.totalIncome
  const totalExpense = data?.dashboard?.financialLoad.totalExpense
  const balance = data?.dashboard?.financialLoad.balance
  const totalMembers = members.length
  const hasInviteCode = Boolean(data?.couple.inviteCode && data.couple.inviteCode !== '—')

  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Личный кабинет</h1>

      <AsyncDataView
        status={status}
        error={error}
        onRetry={refetch}
        loadingLabel="Загружаем профиль…"
      >
        <div className="profile-page__kpis">
          <div className="profile-kpi">
            <div className="profile-kpi__label">Статус пары</div>
            <div className="profile-kpi__value">
              {hasPartner ? 'Подключена' : 'Не подключена'}
            </div>
          </div>
          <div className="profile-kpi">
            <div className="profile-kpi__label">Общий доход</div>
            <div className="profile-kpi__value">{formatMoney(totalIncome, currency)}</div>
          </div>
          <div className="profile-kpi">
            <div className="profile-kpi__label">Общие расходы</div>
            <div className="profile-kpi__value">{formatMoney(totalExpense, currency)}</div>
          </div>
          <div className="profile-kpi">
            <div className="profile-kpi__label">Баланс</div>
            <div className="profile-kpi__value">{formatMoney(balance, currency)}</div>
          </div>
        </div>

        <div className="profile-page__actions">
          <Link to={ROUTES.SETTINGS} className="btn btn--primary profile-page__action-btn">
            Настройки пары
          </Link>
          <Link to={ROUTES.ANALYTICS} className="btn btn--secondary profile-page__action-btn">
            Открыть аналитику
          </Link>
        </div>

        <Card title="Участники пары">
          <div className="profile-page__members">
            {bothPartners.map((m) => (
              <div key={m.userId} className="profile-page__member">
                <div className="profile-page__member-head">
                  <div className="profile-page__avatar">
                    {(m.name || m.email || 'U')
                      .split(/\s+/)
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <div className="profile-page__member-name">{m.name || 'Пользователь'}</div>
                  </div>
                  {m.userId === currentUser?.id && (
                    <span className="profile-page__you-badge">Это вы</span>
                  )}
                </div>
                <div className="profile-page__row">
                  <span>Email</span>
                  <strong>{m.email || '—'}</strong>
                </div>
                <div className="profile-page__row">
                  <span>Доход</span>
                  <strong>{formatMoney(m.income, currency)}</strong>
                </div>
                <div className="profile-page__row">
                  <span>Расходы за период</span>
                  <strong>{formatMoney(m.expense, currency)}</strong>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Пара и настройки">
          <p className="profile-page__hint">
            Ключевые параметры пары и быстрый доступ к подключению в одном месте.
          </p>
          <div className="profile-page__rows">
            <div className="profile-page__row">
              <span>Ваш email</span>
              <strong>{currentMember?.email ?? currentUser?.email ?? '—'}</strong>
            </div>
            <div className="profile-page__row">
              <span>Схема деления</span>
              <strong>{splitTypeLabel(data?.couple.splitType)}</strong>
            </div>
            <div className="profile-page__row">
              <span>Валюта</span>
              <strong>{data?.settings.currency ?? 'RUB'}</strong>
            </div>
            <div className="profile-page__row">
              <span>Участников</span>
              <strong>{totalMembers}</strong>
            </div>
          </div>
          <div className="profile-page__code-box">
            <div>
              <div className="profile-page__code-label">Invite-код пары</div>
              <div className="profile-page__code">
                {hasInviteCode ? data?.couple.inviteCode : 'Будет доступен после создания пары'}
              </div>
            </div>
          </div>
        </Card>
      </AsyncDataView>
    </div>
  )
}
