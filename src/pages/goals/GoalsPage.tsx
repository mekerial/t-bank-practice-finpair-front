import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import { IconPlus, IconGoals } from '../../shared/ui/icons'
import {
  mockMainGoal,
  mockGoals,
  mockGoalTips,
  formatMoneyPlain,
  type Goal
} from '../../shared/lib/mocks'
import './goals.css'

type ProgressVariant = 'default' | 'light'

function ProgressBar({
  percent,
  variant = 'default'
}: {
  percent: number
  variant?: ProgressVariant
}) {
  return (
    <div className={'progress progress--' + variant}>
      <div
        className="progress__fill"
        style={{ width: Math.min(100, percent) + '%' }}
      />
    </div>
  )
}

function GoalCard({ goal }: { goal: Goal }) {
  const initials = goal.title
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="goal-card">
      <div className="goal-card__header">
        <div className="goal-card__icon">{initials}</div>
        <div className="goal-card__main">
          <div className="goal-card__title">{goal.title}</div>
          <div className="goal-card__deadline">{goal.deadline}</div>
        </div>
        <div className="goal-card__percent">{goal.percent}%</div>
      </div>

      <ProgressBar percent={goal.percent} />

      <div className="goal-card__row">
        <span>{formatMoneyPlain(goal.collected)}</span>
        <span>{formatMoneyPlain(goal.target)}</span>
      </div>

      <div className="goal-card__stats">
        <div className="goal-stat">
          <div className="goal-stat__label">Ежемесячно</div>
          <div className="goal-stat__value">
            {formatMoneyPlain(goal.monthly)}
          </div>
        </div>
        <div className="goal-stat">
          <div className="goal-stat__label">Осталось</div>
          <div className="goal-stat__value">
            {formatMoneyPlain(goal.remaining)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const g = mockMainGoal

  return (
    <div className="goals">
      <div className="goals__header">
        <h1 className="goals__title">Цели</h1>
        <Button>
          <IconPlus width={16} height={16} />
          <span style={{ marginLeft: 6 }}>Добавить цель</span>
        </Button>
      </div>

      <div className="main-goal">
        <div className="main-goal__row">
          <div>
            <div className="main-goal__label">{g.label}</div>
            <div className="main-goal__title">{g.title}</div>
            <div className="main-goal__meta">
              <span>📅 {g.deadline}</span>
              <span>{formatMoneyPlain(g.monthly)}/мес</span>
            </div>
          </div>
          <div className="main-goal__percent">
            <div className="main-goal__percent-value">{g.percent}%</div>
            <div className="main-goal__percent-hint">достигнуто</div>
          </div>
        </div>

        <div className="main-goal__progress">
          <div className="main-goal__progress-top">
            <span>{formatMoneyPlain(g.collected)}</span>
            <span>{formatMoneyPlain(g.target)}</span>
          </div>
          <ProgressBar percent={g.percent} variant="light" />
        </div>

        <div className="main-goal__stats">
          <div className="main-goal__stat">
            <div className="main-goal__stat-label">Осталось</div>
            <div className="main-goal__stat-value">
              {formatMoneyPlain(g.remaining)}
            </div>
          </div>
          <div className="main-goal__stat">
            <div className="main-goal__stat-label">Ещё месяцев</div>
            <div className="main-goal__stat-value">{g.monthsLeft}</div>
          </div>
          <div className="main-goal__stat">
            <div className="main-goal__stat-label">Прогресс</div>
            <div className="main-goal__stat-value main-goal__stat-value--icon">
              <IconGoals width={20} height={20} /> в пути
            </div>
          </div>
        </div>
      </div>

      <div className="goals__section-title">Все цели</div>
      <div className="goals__grid">
        {mockGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>

      <Card title="💡 Советы по накоплению">
        <div className="goal-tips">
          {mockGoalTips.map((t) => (
            <div key={t.id} className="goal-tip">
              <div className="goal-tip__title">{t.title}</div>
              <div className="goal-tip__text">{t.text}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
