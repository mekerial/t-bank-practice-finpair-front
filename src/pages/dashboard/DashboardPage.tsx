import Card from '../../shared/ui/Card'
import { IconBulb } from '../../shared/ui/icons'
import {
  mockFinancialLoad,
  mockRecommendations,
  mockMainExpenses,
  formatMoneyPlain
} from '../../shared/lib/mocks'
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
        stroke="#a78bfa"
        strokeWidth="28"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#6366f1"
        strokeWidth="28"
        strokeDasharray={`${aLen} ${c - aLen}`}
        strokeDashoffset={c / 4}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.4s ease' }}
      />
    </svg>
  )
}

export default function DashboardPage() {
  const { totalIncome, balance, loadPercent, totalExpense, partnerSplit } =
    mockFinancialLoad

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Финансовая нагрузка</h1>

      <div className="dashboard__grid">
        <Card title="Распределение нагрузки">
          <div className="dashboard__donut-wrap">
            <DonutChart a={partnerSplit.a} b={partnerSplit.b} />
            <div className="dashboard__legend">
              <span className="dashboard__legend-item">
                <span
                  className="dashboard__dot"
                  style={{ background: '#6366f1' }}
                />
                Партнёр А: {partnerSplit.a}%
              </span>
              <span className="dashboard__legend-item">
                <span
                  className="dashboard__dot"
                  style={{ background: '#a78bfa' }}
                />
                Партнёр Б: {partnerSplit.b}%
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
                <span className="overview__value">{loadPercent}%</span>
                <span className="overview__sub">
                  {formatMoneyPlain(totalExpense)}
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
          {mockRecommendations.map((r, i) => (
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
          {mockMainExpenses.map((e) => (
            <div key={e.id} className="expenses-table__row">
              <span className="expenses-table__category">{e.category}</span>
              <span>{formatMoneyPlain(e.amount)}</span>
              <span>
                <span
                  className={
                    'chip ' +
                    (e.payer === 'Общий' ? 'chip--shared' : 'chip--partner')
                  }
                >
                  {e.payer}
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
    </div>
  )
}
