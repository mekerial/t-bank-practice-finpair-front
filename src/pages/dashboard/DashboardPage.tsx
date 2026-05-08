import Card from '../../shared/ui/Card'
import axios from 'axios'
import { IconBulb } from '../../shared/ui/icons'
import {
  formatMoneyPlain
} from '../../shared/lib/financeView'
import { isValidHouseholdId } from '../../shared/lib/householdId'
import { useAsyncData } from '../../shared/hooks/useAsyncData'
import {
  fetchDashboard,
  type DashboardPageData
} from '../../shared/api/dashboardApi'
import AsyncDataView from '../../shared/ui/AsyncDataView'
import { fetchCoupleRequest } from '../../shared/api/settingsApi'
import type { CoupleDetails } from '../../shared/api/settingsApi'
import './dashboard.css'

interface DonutChartProps {
  a: number
  b: number
}

function DonutChart({ a }: DonutChartProps) {
  const size = 200
  const r = 72
  const c = 2 * Math.PI * r
  const aLen = (a / 100) * c
  return (
    <svg
      className="donut"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-chart-b)"
        strokeWidth="28"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-chart-a)"
        strokeWidth="28"
        strokeDasharray={`${aLen} ${c - aLen}`}
        strokeDashoffset={c / 4}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.4s ease' }}
      />
    </svg>
  )
}

function DashboardContent({
  data,
  partnerALabel,
  partnerBLabel,
  memberNameById
}: {
  data: DashboardPageData
  partnerALabel: string
  partnerBLabel: string
  memberNameById: Map<string, string>
}) {
  const { financialLoad, recommendations, mainExpenses } = data
  const { totalIncome, balance, loadPercent, totalExpense, partnerSplit } =
    financialLoad
  const isOverloaded = totalExpense > totalIncome && totalIncome > 0
  const loadPercentDisplay = Math.min(Math.max(loadPercent, 0), 100)
  const overloadAmount = Math.max(totalExpense - totalIncome, 0)
  const loadHintLabel = isOverloaded
    ? `перерасход: ${formatMoneyPlain(overloadAmount)}`
    : formatMoneyPlain(totalExpense)

  return (
    <>
      <div className="dashboard__grid">
        <Card title="Распределение нагрузки">
          <div className="dashboard__donut-wrap">
            <DonutChart a={partnerSplit.a} b={partnerSplit.b} />
            <div className="dashboard__legend">
              <span className="dashboard__legend-item">
                <span
                  className="dashboard__dot"
                  style={{ background: 'var(--color-chart-a)' }}
                />
                {partnerALabel}: {partnerSplit.a}%
              </span>
              <span className="dashboard__legend-item">
                <span
                  className="dashboard__dot"
                  style={{ background: 'var(--color-chart-b)' }}
                />
                {partnerBLabel}: {partnerSplit.b}%
              </span>
            </div>
          </div>
        </Card>

        <Card title="Ежемесячный обзор">
          <div className="overview">
            <div className="overview__row">
              <span className="overview__label">Общий доход</span>
              <span className="overview__value">
                {formatMoneyPlain(totalIncome)}
              </span>
            </div>
            <div className="overview__row">
              <span className="overview__label">Финансовая нагрузка</span>
              <div className="overview__value-stack">
                <span className="overview__value">{loadPercentDisplay}%</span>
                <span className="overview__sub">
                  {loadHintLabel}
                </span>
              </div>
            </div>
            <div className="overview__row">
              <span className="overview__label">Остаток</span>
              <span className="overview__value overview__value--accent">
                {formatMoneyPlain(balance)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="smart-balance">
        <div className="smart-balance__header">
          <div className="smart-balance__bulb">
            <IconBulb />
          </div>
          <div>
            <h3 className="smart-balance__title">Умный баланс</h3>
            <p className="smart-balance__subtitle">
              Персональные рекомендации для вас
            </p>
          </div>
        </div>
        <div className="smart-balance__list">
          {recommendations.map((r, i) => (
            <div key={r.id} className="smart-balance__item">
              <span className="smart-balance__index">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{r.text}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Основные расходы">
        <div className="expenses-table">
          <div className="expenses-table__head">
            <span>Категория</span>
            <span>Сумма</span>
            <span>Плательщик</span>
            <span>Доля</span>
            <span className="expenses-table__right">Из бюджета</span>
          </div>
          {mainExpenses.map((e) => (
            <div key={`${e.id}-${e.userId ?? e.payer}`} className="expenses-table__row">
              <span className="expenses-table__category">{e.category}</span>
              <span>{formatMoneyPlain(e.amount)}</span>
              <span>
                <span
                  className={
                    'chip ' +
                    (e.payer === 'Общий' ? 'chip--shared' : 'chip--partner')
                  }
                >
                  {e.userId
                    ? (memberNameById.get(e.userId) ??
                      (e.payer === 'А' ? partnerALabel : partnerBLabel))
                    : e.payer}
                </span>
              </span>
              <span>{e.share}%</span>
              <span className="expenses-table__right">
                {formatMoneyPlain(e.fromBudget)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

export default function DashboardPage() {
  const emptyCouple: CoupleDetails = {
    id: '',
    inviteCode: '',
    currency: 'RUB',
    splitType: 'equal',
    notifications: {},
    members: [],
    users: []
  }
  const { data: coupleData } = useAsyncData('dashboard-couple', async () => {
    try {
      return await fetchCoupleRequest()
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 404) return emptyCouple
      throw e
    }
  })
  const householdKey = coupleData?.id
  const { data, status, error, refetch } = useAsyncData(
    `dashboard-${isValidHouseholdId(householdKey) ? householdKey : 'no-couple'}`,
    () =>
      isValidHouseholdId(householdKey)
        ? fetchDashboard()
        : Promise.resolve({
            financialLoad: {
              totalIncome: 0,
              totalExpense: 0,
              balance: 0,
              loadPercent: 0,
              partnerSplit: { a: 0, b: 0 }
            },
            recommendations: [],
            mainExpenses: [],
            partnerStats: []
          })
  )
  const members = coupleData?.members ?? coupleData?.users ?? []
  const memberNameById = new Map<string, string>(
    members.map((m) => [m.userId, m.name])
  )
  const partnerALabel = members[0]?.name ?? 'Партнер A'
  const partnerBLabel = members[1]?.name ?? 'Партнер B'
  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Финансовая нагрузка</h1>

      <AsyncDataView
        status={status}
        error={error}
        onRetry={refetch}
        loadingLabel="Загружаем дашборд…"
      >
        {data ? (
          <DashboardContent
            data={data}
            partnerALabel={partnerALabel}
            partnerBLabel={partnerBLabel}
            memberNameById={memberNameById}
          />
        ) : null}
      </AsyncDataView>
    </div>
  )
}
