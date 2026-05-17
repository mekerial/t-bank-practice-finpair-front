import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import AsyncDataView from '../../shared/ui/AsyncDataView'
import { IconPlus, IconGoals } from '../../shared/ui/icons'
import {
  formatMoneyPlain,
  type HouseholdCurrency
} from '../../shared/lib/financeView'
import { isValidHouseholdId } from '../../shared/lib/householdId'
import {
  readStoredFocusedGoalId,
  writeStoredFocusedGoalId
} from '../../shared/lib/goalFocusStorage'
import {
clearCreateGoalError,
  clearMainGoal,
  completeGoal,
  createGoal,
  deleteGoal,
  fetchGoals,
  setMainGoal,
  useAppDispatch,
  useAppSelector
} from '../../app/store'
import type { Goal } from '../../app/store/slices/goalsSlice'
import GoalCreateForm, {
  type GoalCreateFormValues
} from './components/GoalCreateForm'
import { useAsyncData } from '../../shared/hooks/useAsyncData'
import { fetchCoupleRequest } from '../../shared/api/settingsApi'
import type { CoupleDetails } from '../../shared/api/settingsApi'
import './goals.css'
import '../../app/styles/mobile-pages.css'

type ProgressVariant = 'default' | 'light'
type GoalStatus = 'not-started' | 'in-progress' | 'almost-done' | 'done'

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

function getGoalStatus(percent: number): { label: string; key: GoalStatus } {
  if (percent <= 0) {
    return { label: 'Не начато', key: 'not-started' }
  }

  if (percent >= 100) {
    return { label: 'Выполнено', key: 'done' }
  }

  if (percent >= 80) {
    return { label: 'Почти готово', key: 'almost-done' }
  }

  return { label: 'В процессе', key: 'in-progress' }
}

function getGoalEmoji(title: string) {
  const value = title.toLowerCase()

  if (value.includes('дом') || value.includes('квар')) return '🏠'
  if (value.includes('машин') || value.includes('авто')) return '🚗'
  if (
    value.includes('итал') ||
    value.includes('дубай') ||
    value.includes('китай') ||
    value.includes('отпуск') ||
    value.includes('путеш')
  ) {
    return '🏖️'
  }
  if (
    value.includes('образ') ||
    value.includes('учеб') ||
    value.includes('курс')
  ) {
    return '🎓'
  }
  if (value.includes('ремонт')) return '🛠️'
  if (value.includes('ноут')) return '💻'
  if (value.includes('телефон')) return '📱'
  if (value.includes('свад')) return '💍'

  return '🎯'
}

function GoalDeleteConfirmModal({
  goalTitle,
  onCancel,
  onConfirm
}: {
  goalTitle: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div
      className="goal-delete-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-delete-modal-title"
    >
      <button
        type="button"
        className="goal-delete-modal__backdrop"
        tabIndex={-1}
        aria-label="Закрыть"
        onClick={onCancel}
      />
      <div className="goal-delete-modal__panel">
        <h2 id="goal-delete-modal-title" className="goal-delete-modal__title">
          Удалить цель?
        </h2>
        <p className="goal-delete-modal__text">
          Цель «<strong>{goalTitle}</strong>» будет удалена без восстановления.
        </p>
        <div className="goal-delete-modal__actions">
          <button
            type="button"
            className="goal-delete-modal__btn goal-delete-modal__btn--secondary"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className="goal-delete-modal__btn goal-delete-modal__btn--danger"
            onClick={onConfirm}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}

function GoalCard({
  goal,
  onToggleMainFocus,
  onComplete,
  onRequestDelete,
  mutationGoalId,
  currency
}: {
  goal: Goal
  onToggleMainFocus: (goal: Goal) => void
  onComplete: (goalId: Goal['id']) => void
  onRequestDelete: (goal: Goal) => void
  mutationGoalId: Goal['id'] | null
  currency: HouseholdCurrency
}) {
  const status = getGoalStatus(goal.percent)
  const isBusy = mutationGoalId !== null && String(mutationGoalId) === String(goal.id)

  return (
    <div className="goal-card">
      <div className="goal-card__header">
        <div className="goal-card__emoji" role="img" aria-label={goal.title}>
          {getGoalEmoji(goal.title)}
        </div>

        <div className="goal-card__main">
          <div className="goal-card__title-row">
            <div className="goal-card__title">{goal.title}</div>
            {goal.isMain && <span className="goal-card__badge">В фокусе</span>}
          </div>
          <div className="goal-card__deadline">{goal.deadline}</div>
        </div>

        <div className="goal-card__percent">{goal.percent}%</div>
      </div>

      <ProgressBar percent={goal.percent} />

      <div className="goal-card__row">
        <span>{formatMoneyPlain(goal.collected, currency)}</span>
        <span>{formatMoneyPlain(goal.target, currency)}</span>
      </div>

      <div className="goal-card__status">
        <span className={`goal-status goal-status--${status.key}`}>
          {status.label}
        </span>
      </div>

      <div className="goal-card__stats">
        <div className="goal-stat">
          <div className="goal-stat__label">Ежемесячно</div>
          <div className="goal-stat__value">
            {formatMoneyPlain(goal.monthly, currency)}
          </div>
        </div>

        <div className="goal-stat">
          <div className="goal-stat__label">Осталось</div>
          <div className="goal-stat__value">
            {formatMoneyPlain(goal.remaining, currency)}
          </div>
        </div>
      </div>

      <div className="goal-card__actions-bar">
        <div className="goal-card__toolbar-group">
          <button
            type="button"
            className={
              'goal-card__btn ' +
              (goal.isMain ? 'goal-card__btn--ghost' : 'goal-card__btn--primary')
            }
            title={
              goal.isMain
                ? 'Убрать из блока сверху'
                : 'Показать эту цель в большом блоке сверху'
            }
            onClick={() => onToggleMainFocus(goal)}
            disabled={isBusy}
          >
            {goal.isMain ? 'Снять' : 'В фокус'}
          </button>
        </div>
        <div className="goal-card__toolbar-group goal-card__toolbar-group--end">
          <button
            type="button"
            className="goal-card__btn goal-card__btn--ghost"
            title="Закрыть цель: накопленная сумма станет равна цели"
            onClick={() => onComplete(goal.id)}
            disabled={goal.percent >= 100 || isBusy}
          >
            Выполнено
          </button>
          <button
            type="button"
            className="goal-card__btn goal-card__btn--danger"
            title="Удалить цель без восстановления"
            onClick={() => onRequestDelete(goal)}
            disabled={isBusy}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}

function getMonthsLeft(remaining: number, monthly: number): number | null {
  const rem = Math.max(remaining, 0)
  if (rem <= 0) return 0
  if (monthly <= 0) return null

  // Копейки + целочисленный ceil(a/b) = floor((a+b-1)/b), иначе Math.ceil(float)
  // иногда даёт лишний месяц (например Math.ceil(3.0000000000000004) === 4).
  const remK = Math.round(rem * 100)
  const monK = Math.round(monthly * 100)
  if (monK <= 0) return null

  return Math.floor((remK + monK - 1) / monK)
}

const STATIC_GOAL_TIPS: Array<{ id: string; title: string; text: string }> = [
  {
    id: 'static-payday',
    title: 'День зарплаты',
    text: 'Сразу после дохода переводите на цели фиксированную сумму — так проще не потратить её импульсивно.'
  },
  {
    id: 'static-small',
    title: 'Часто и понемногу',
    text: 'Даже небольшие взносы каждый месяц дают привычку и ощутимый прогресс за год.'
  },
  {
    id: 'static-review',
    title: 'Проверка раз в месяц',
    text: 'Раз в месяц сравните план откладывания с фактом: при необходимости скорректируйте сумму или срок.'
  },
  {
    id: 'static-priority',
    title: 'Одна главная',
    text: 'Закрепите одну цель «В фокус» — так проще не распыляться и доводить накопление до конца.'
  },
  {
    id: 'static-buffer',
    title: 'Подушка рядом',
    text: 'Имеет смысл держать небольшой резерв на непредвиденное, чтобы не снимать деньги с целей из‑за мелочей.'
  }
]

const MIN_GOAL_TIPS = 3

function buildGoalTips(
  goals: Goal[],
  currency: HouseholdCurrency
): Array<{ id: string; title: string; text: string }> {
  const tips: Array<{ id: string; title: string; text: string }> = []

  if (goals.length > 0) {
    const avgProgress =
      goals.reduce((acc, goal) => acc + goal.percent, 0) / goals.length
    const topGoal = [...goals].sort((a, b) => b.remaining - a.remaining)[0]

    tips.push({
      id: 'progress',
      title: 'Средний прогресс',
      text: `По всем целям сейчас ${Math.round(avgProgress)}%.`
    })
    tips.push({
      id: 'focus',
      title: 'Фокус месяца',
      text: `Больше всего осталось по цели «${topGoal.title}» — ${formatMoneyPlain(
        topGoal.remaining,
        currency
      )}.`
    })

    if (goals.length >= 2) {
      const sortedByProgress = [...goals].sort((a, b) => b.percent - a.percent)
      const lead = sortedByProgress[0]
      if (lead && String(lead.id) !== String(topGoal.id)) {
        tips.push({
          id: 'momentum',
          title: 'Лидер по темпу',
          text: `Сейчас впереди по прогрессу цель «${lead.title}» — ${lead.percent}%. Так держать.`
        })
      }
    }
  }

  const used = new Set(tips.map((t) => t.id))
  for (const s of STATIC_GOAL_TIPS) {
    if (tips.length >= MIN_GOAL_TIPS) break
    if (!used.has(s.id)) {
      tips.push(s)
      used.add(s.id)
    }
  }

  return tips
}

export default function GoalsPage() {
  const dispatch = useAppDispatch()
  const { items: goals, status, error, createError } = useAppSelector((s) => s.goals)
  const emptyCouple: CoupleDetails = {
    id: '',
    inviteCode: '',
    currency: 'RUB',
    splitType: 'equal',
    notifications: {},
    members: [],
    users: []
  }
  const { data: coupleData } = useAsyncData(
    'goals-couple',
    async () => {
      try {
        return await fetchCoupleRequest()
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) return emptyCouple
        throw e
      }
    }
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [goalBanner, setGoalBanner] = useState<{
    tone: 'success' | 'error'
    text: string
  } | null>(null)
  const [mutationGoalId, setMutationGoalId] = useState<Goal['id'] | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{
    id: Goal['id']
    title: string
  } | null>(null)

  useEffect(() => {
    if (!goalBanner || goalBanner.tone !== 'success') return
    const id = window.setTimeout(() => setGoalBanner(null), 4200)
    return () => window.clearTimeout(id)
  }, [goalBanner])

  useEffect(() => {
    if (!pendingDelete) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPendingDelete(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [pendingDelete])

  const goalsHouseholdId = coupleData?.id
  useEffect(() => {
    if (!isValidHouseholdId(goalsHouseholdId)) return
    void dispatch(fetchGoals())
  }, [dispatch, goalsHouseholdId])

  useEffect(() => {
    if (!isValidHouseholdId(goalsHouseholdId)) return
    if (status !== 'succeeded') return
    if (goals.length === 0) return

    const stored = readStoredFocusedGoalId(goalsHouseholdId)
    if (!stored) return

    const match = goals.find((g) => String(g.id) === stored)
    if (!match) {
      writeStoredFocusedGoalId(goalsHouseholdId, null)
      return
    }
    if (!match.isMain) {
      dispatch(setMainGoal(match.id))
    }
  }, [dispatch, goalsHouseholdId, status, goals])

  const currency: HouseholdCurrency = coupleData?.currency ?? 'RUB'
  const totalGoals = useMemo(() => goals.length, [goals])
  const goalTips = useMemo(() => buildGoalTips(goals, currency), [goals, currency])
  const mainGoal = useMemo(() => {
    return goals.find((goal) => goal.isMain)
  }, [goals])
  const otherGoals = useMemo(
    () => goals.filter((goal) => !goal.isMain),
    [goals]
  )

  const handleCloseCreate = () => {
    setIsCreateOpen(false)
  }

  const handleCreateGoal = async (data: GoalCreateFormValues) => {
    dispatch(clearCreateGoalError())
    const result = await dispatch(createGoal(data))
    if (createGoal.fulfilled.match(result)) {
      setIsCreateOpen(false)
      if (
        isValidHouseholdId(goalsHouseholdId) &&
        result.payload.isMain
      ) {
        writeStoredFocusedGoalId(
          goalsHouseholdId,
          String(result.payload.id)
        )
      }
    }
  }
  const handleToggleMainFocus = (goal: Goal) => {
    setGoalBanner(null)
    if (goal.isMain) {
      dispatch(clearMainGoal())
      if (isValidHouseholdId(goalsHouseholdId)) {
        writeStoredFocusedGoalId(goalsHouseholdId, null)
      }
      setGoalBanner({
        tone: 'success',
        text: 'Закрепление снято. Блок сверху скрыт — при желании закрепите другую цель кнопкой «В фокус».'
      })
      return
    }
    dispatch(setMainGoal(goal.id))
    if (isValidHouseholdId(goalsHouseholdId)) {
      writeStoredFocusedGoalId(goalsHouseholdId, String(goal.id))
    }
    setGoalBanner({
      tone: 'success',
      text: 'Цель закреплена в блоке сверху. Она убрана из списка ниже, пока закреплена.'
    })
  }

  const handleCompleteGoal = async (goalId: Goal['id']) => {
    setGoalBanner(null)
    setMutationGoalId(goalId)
    const result = await dispatch(completeGoal(goalId))
    setMutationGoalId(null)
    if (completeGoal.fulfilled.match(result)) {
      setGoalBanner({ tone: 'success', text: 'Цель отмечена как выполненная.' })
    } else if (completeGoal.rejected.match(result)) {
      setGoalBanner({
        tone: 'error',
        text: result.payload ?? 'Не удалось обновить цель.'
      })
    }
  }

  const openDeleteConfirm = (goal: Goal) => {
    setPendingDelete({ id: goal.id, title: goal.title })
  }

  const performDelete = async (goalId: Goal['id']) => {
    setPendingDelete(null)
    setGoalBanner(null)
    setMutationGoalId(goalId)
    const result = await dispatch(deleteGoal(goalId))
    setMutationGoalId(null)
    if (deleteGoal.fulfilled.match(result)) {
      if (
        isValidHouseholdId(goalsHouseholdId) &&
        readStoredFocusedGoalId(goalsHouseholdId) === String(goalId)
      ) {
        writeStoredFocusedGoalId(goalsHouseholdId, null)
      }
      setGoalBanner({ tone: 'success', text: 'Цель удалена.' })
    } else if (deleteGoal.rejected.match(result)) {
      setGoalBanner({
        tone: 'error',
        text: result.payload ?? 'Не удалось удалить цель.'
      })
    }
  }

  if (goals.length === 0) {
    return (
      <div className="goals">
        <div className="goals__header">
          <h1 className="goals__title">Цели</h1>

          <Button
            type="button"
            onClick={() => setIsCreateOpen((prev) => !prev)}
          >
            {isCreateOpen ? (
              <span className="goals__toggle-icon" aria-hidden="true">
                ✕
              </span>
            ) : (
              <IconPlus width={16} height={16} />
            )}

            <span style={{ marginLeft: 6 }}>
              {isCreateOpen ? 'Закрыть' : 'Добавить цель'}
            </span>
          </Button>
        </div>

        {isCreateOpen && (
          <GoalCreateForm
            onSubmitForm={handleCreateGoal}
            onCancel={handleCloseCreate}
          />
        )}

        <Card title="Цели">
          <p className="goals__empty">Пока нет целей. Добавьте первую цель.</p>
        </Card>

        <Card title="💡 Советы по накоплению">
          <div className="goal-tips">
            {goalTips.map((t) => (
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

  const monthsLeft = mainGoal
    ? getMonthsLeft(mainGoal.remaining, mainGoal.monthly)
    : null
  const mainStatus = mainGoal ? getGoalStatus(mainGoal.percent) : null

  return (
    <div className="goals">
      <div className="goals__header">
        <h1 className="goals__title">Цели</h1>

        <Button type="button" onClick={() => setIsCreateOpen((prev) => !prev)}>
          {isCreateOpen ? (
            <span className="goals__toggle-icon" aria-hidden="true">
              ✕
            </span>
          ) : (
            <IconPlus width={16} height={16} />
          )}

          <span style={{ marginLeft: 6 }}>
            {isCreateOpen ? 'Закрыть' : 'Добавить цель'}
          </span>
        </Button>
      </div>

      {createError && <p className="auth-form__common-error">{createError}</p>}
      {goalBanner && (
        <div
          className={
            'goals__notice' +
            (goalBanner.tone === 'success'
              ? ' goals__notice--success'
              : ' goals__notice--error')
          }
          role={goalBanner.tone === 'error' ? 'alert' : 'status'}
        >
          {goalBanner.text}
        </div>
      )}

      {isCreateOpen && (
        <GoalCreateForm
          onSubmitForm={handleCreateGoal}
          onCancel={handleCloseCreate}
        />
      )}

      <AsyncDataView
        status={
          status === 'loading'
            ? 'loading'
            : status === 'failed'
              ? 'error'
              : 'success'
        }
        error={error}
        onRetry={() => void dispatch(fetchGoals())}
        loadingLabel="Загружаем цели…"
      >
        {mainGoal && mainStatus && (
          <div className="main-goal">
            <div className="main-goal__row">
              <div>
                <div className="main-goal__label">Цель в фокусе</div>

                <div className="main-goal__title-row">
                  <span
                    className="main-goal__emoji"
                    role="img"
                    aria-label={mainGoal.title}
                  >
                    {getGoalEmoji(mainGoal.title)}
                  </span>
                  <div className="main-goal__title">{mainGoal.title}</div>
                </div>

                <div className="main-goal__meta">
                  <span>📅 {mainGoal.deadline}</span>
                  <span>
                    {formatMoneyPlain(mainGoal.monthly, currency)}/мес
                  </span>
                </div>
              </div>

              <div className="main-goal__percent">
                <div className="main-goal__percent-value">{mainGoal.percent}%</div>
                <div className="main-goal__percent-hint">достигнуто</div>
              </div>
            </div>

            <div className="main-goal__progress">
              <div className="main-goal__progress-top">
                <span>{formatMoneyPlain(mainGoal.collected, currency)}</span>
                <span>{formatMoneyPlain(mainGoal.target, currency)}</span>
              </div>
              <ProgressBar percent={mainGoal.percent} variant="light" />
            </div>

            <div className="main-goal__status">
              <span
                className={`goal-status goal-status--${mainStatus.key} goal-status--light`}
              >
                {mainStatus.label}
              </span>
            </div>

            <div className="main-goal__stats">
              <div className="main-goal__stat">
                <div className="main-goal__stat-label">Осталось</div>
                <div className="main-goal__stat-value">
                  {formatMoneyPlain(mainGoal.remaining, currency)}
                </div>
              </div>

              <div className="main-goal__stat">
                <div className="main-goal__stat-label">Ещё месяцев</div>
                <div className="main-goal__stat-value">
                  {monthsLeft === null ? '—' : monthsLeft}
                </div>
              </div>

              <div className="main-goal__stat">
                <div className="main-goal__stat-label">Прогресс</div>
                <div className="main-goal__stat-value main-goal__stat-value--icon">
                  <IconGoals width={20} height={20} /> {mainStatus.label}
                </div>
              </div>
            </div>

            <div className="main-goal__actions-bar">
              <div className="main-goal__toolbar-group">
                <button
                  type="button"
                  className="main-goal__btn main-goal__btn--outline"
                  title="Убрать из блока сверху"
                  onClick={() => handleToggleMainFocus(mainGoal)}
                  disabled={mutationGoalId !== null}
                >
                  Снять закрепление
                </button>
              </div>
              <div className="main-goal__toolbar-group main-goal__toolbar-group--end">
                <button
                  type="button"
                  className="main-goal__btn"
                  title="Накопленная сумма станет равна цели"
                  onClick={() => void handleCompleteGoal(mainGoal.id)}
                  disabled={
                    mainGoal.percent >= 100 || mutationGoalId !== null
                  }
                >
                  Выполнено
                </button>
                <button
                  type="button"
                  className="main-goal__btn main-goal__btn--danger"
                  title="Удалить цель"
                  onClick={() => openDeleteConfirm(mainGoal)}
                  disabled={mutationGoalId !== null}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}

        {otherGoals.length > 0 && (
          <>
            <div className="goals__section-head">
              <div className="goals__section-title">
                {mainGoal ? 'Остальные цели' : 'Все цели'}
              </div>
              <div className="goals__count">Всего: {totalGoals}</div>
            </div>

            <div className="goals__grid">
              {otherGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggleMainFocus={handleToggleMainFocus}
                  onComplete={(id) => void handleCompleteGoal(id)}
                  onRequestDelete={openDeleteConfirm}
                  mutationGoalId={mutationGoalId}
                  currency={currency}
                />
              ))}
            </div>
          </>
        )}

        <Card title="💡 Советы по накоплению">
          <div className="goal-tips">
            {goalTips.map((t) => (
              <div key={t.id} className="goal-tip">
                <div className="goal-tip__title">{t.title}</div>
                <div className="goal-tip__text">{t.text}</div>
              </div>
            ))}
          </div>
        </Card>
      </AsyncDataView>

      {pendingDelete && (
        <GoalDeleteConfirmModal
          goalTitle={pendingDelete.title}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => void performDelete(pendingDelete.id)}
        />
      )}
    </div>
  )
}