import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import AsyncDataView from '../../shared/ui/AsyncDataView'
import {
  type SplitType,
  type NotificationSettings
} from '../../shared/lib/financeView'
import { useAsyncData } from '../../shared/hooks/useAsyncData'
import {
  createCoupleRequest,
  type CoupleDetails,
  fetchCoupleRequest,
  fetchSettingsRequest,
  fetchUserProfileRequest,
  joinCoupleRequest,
  type SettingsResult,
  updateCoupleSettingsRequest,
  updateSettingsRequest,
  updateUserIncomeRequest
} from '../../shared/api/settingsApi'
import { changeEmailRequest } from '../../shared/api/authApi'
import { fetchAuthUser, useAppDispatch } from '../../app/store'
import { getErrorMessage } from '../../shared/lib/asyncUtils'
import { isValidHouseholdId } from '../../shared/lib/householdId'
import './settings.css'
import '../../app/styles/mobile-pages.css'

interface SplitOption {
  id: SplitType
  icon: string
  title: string
  hint: string
}

const SPLITS: SplitOption[] = [
  { id: '50-50', icon: '⚖️', title: '50/50', hint: 'Равное деление всех расходов' },
  {
    id: 'by-income',
    icon: '📊',
    title: 'По доходу',
    hint: 'Пропорционально доходам партнёров'
  },
  {
    id: 'custom',
    icon: '🎯',
    title: 'Индивидуально',
    hint: 'Свои проценты по каждой категории'
  }
]

interface ToggleProps {
  checked: boolean
  onChange: (value: boolean) => void
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={'toggle' + (checked ? ' toggle--on' : '')}
      aria-pressed={checked}
    >
      <span className="toggle__knob" />
    </button>
  )
}

interface SettingsFormValues {
  myEmail: string
  emailPassword: string
  myIncome: string
  splitType: SplitType
  currency: 'RUB' | 'USD' | 'EUR'
  notifications: NotificationSettings
}

function fromBackendSplitType(
  value: 'equal' | 'income' | 'income_ratio' | 'custom' | undefined
): SplitType {
  if (value === 'income' || value === 'income_ratio') return 'by-income'
  if (value === 'custom') return 'custom'
  return '50-50'
}

function toBackendSplitType(value: SplitType): 'equal' | 'income' | 'custom' {
  if (value === 'by-income') return 'income'
  if (value === 'custom') return 'custom'
  return 'equal'
}

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const [copied, setCopied] = useState(false)
  const [inviteCode, setInviteCode] = useState('FINPAIR-LOADING')
  const [submitError, setSubmitError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [partnerInviteCode, setPartnerInviteCode] = useState('')
  const [connectionMode, setConnectionMode] = useState<'create' | 'join'>('create')
  const [partnerActionError, setPartnerActionError] = useState('')
  const [partnerActionSuccess, setPartnerActionSuccess] = useState('')
  const formRef = useRef<HTMLFormElement | null>(null)
  const saveSuccessRef = useRef<HTMLParagraphElement | null>(null)

  const defaultSettings: SettingsResult = {
    currency: 'RUB',
    notifications: {
      newTransactions: true,
      goalsProgress: true,
      monthlyReports: false
    }
  }

  const { data, status, error, refetch } = useAsyncData('settings', async () => {
    const user = await fetchUserProfileRequest()
    const settings = await fetchSettingsRequest().catch(() => defaultSettings)
    const couple = await fetchCoupleRequest().catch(
      (): CoupleDetails => ({
        id: '',
        inviteCode: 'FINPAIR-NEW',
        currency: settings.currency,
        splitType: 'equal',
        notifications: settings.notifications,
        members: []
      })
    )
    return { user, settings, couple }
  })
  const members = data?.couple.members ?? data?.couple.users ?? []
  const currentUserId = data?.user.id
  const currentMember = members.find((m) => m.userId === currentUserId) ?? members[0]
  const partnerMember = members.find((m) => m.userId !== currentUserId)
  const hasPartner = members.length > 1
  const hasCouple = isValidHouseholdId(data?.couple.id)
  const connectionStatus = !hasCouple
    ? 'pair-not-created'
    : hasPartner
      ? 'pair-connected'
      : 'waiting-partner'

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SettingsFormValues>({
    defaultValues: {
      myEmail: '',
      emailPassword: '',
      myIncome: '0',
      splitType: 'by-income',
      currency: 'RUB',
      notifications: {
        newTransactions: true,
        goalsProgress: true,
        monthlyReports: false
      }
    },
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  useEffect(() => {
    if (!saveSuccess) return
    const id = window.setTimeout(() => setSaveSuccess(false), 4000)
    return () => window.clearTimeout(id)
  }, [saveSuccess])

  useEffect(() => {
    if (!saveSuccess) return
    saveSuccessRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    })
  }, [saveSuccess])

  useEffect(() => {
    if (!data) return
    setInviteCode(data.couple.inviteCode)
    reset({
      myEmail: data.user.email ?? currentMember?.email ?? '',
      emailPassword: '',
      myIncome: String(data.user.income ?? 0),
      splitType: fromBackendSplitType(data.couple.splitType),
      currency: data.settings.currency,
      notifications: {
        newTransactions: data.settings.notifications.newTransactions ?? true,
        goalsProgress: data.settings.notifications.goalsProgress ?? true,
        monthlyReports: data.settings.notifications.monthlyReports ?? false
      }
    })
  }, [data, currentMember?.email, partnerMember?.email, reset])

  const watchedEmail = watch('myEmail') ?? ''
  const savedEmail = (data?.user.email ?? '').trim().toLowerCase()
  const emailChanged = watchedEmail.trim().toLowerCase() !== savedEmail

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const onSubmit = async (formData: SettingsFormValues) => {
    setSubmitError('')
    setSaveSuccess(false)
    const myIncome = Number(formData.myIncome.trim())
    if (Number.isNaN(myIncome)) {
      setSubmitError('Введите корректный доход')
      return
    }

    const nextEmail = formData.myEmail.trim()
    const emailWillChange =
      nextEmail.toLowerCase() !== (data?.user.email ?? '').trim().toLowerCase()

    if (emailWillChange) {
      if (!formData.emailPassword.trim()) {
        setSubmitError('Для смены почты введите текущий пароль')
        return
      }
    }

    try {
      if (emailWillChange) {
        await changeEmailRequest({
          email: nextEmail,
          password: formData.emailPassword
        })
      }

      const notificationsPayload = {
        newTransactions: formData.notifications.newTransactions,
        goalsProgress: formData.notifications.goalsProgress,
        monthlyReports: formData.notifications.monthlyReports
      }

      await Promise.all([
        updateUserIncomeRequest(myIncome),
        updateSettingsRequest({
          currency: formData.currency,
          notifications: notificationsPayload
        }),
        ...(hasCouple
          ? [
              updateCoupleSettingsRequest({
                splitType: toBackendSplitType(formData.splitType),
                currency: formData.currency,
                notifications: notificationsPayload
              })
            ]
          : [])
      ])
      await refetch()
      void dispatch(fetchAuthUser())
      setSaveSuccess(true)
    } catch (e) {
      setSubmitError(getErrorMessage(e))
    }
  }

  const onInvalid = () => {
    setSaveSuccess(false)
    setSubmitError('Исправьте ошибки в форме и попробуйте снова')

    const top = formRef.current?.offsetTop ?? 0
    window.scrollTo({
      top: Math.max(top - 16, 0),
      behavior: 'smooth'
    })
  }

  const handleGetInviteCode = async () => {
    setPartnerActionError('')
    setPartnerActionSuccess('')
    try {
      if (hasCouple) {
        setPartnerActionError('Код приглашения уже создан — передайте его партнёру.')
        return
      }
      const created = await createCoupleRequest()
      let freshCode = (created?.inviteCode ?? '').trim()
      if (!freshCode) {
        try {
          const couple = await fetchCoupleRequest()
          freshCode = (couple.inviteCode ?? '').trim()
        } catch {
          freshCode = ''
        }
      }

      if (freshCode) {
        setInviteCode(freshCode)
      }
      refetch()
    } catch {
      setPartnerActionError('Не удалось создать код. Попробуйте ещё раз.')
    }
  }

  const handleJoinByCode = async () => {
    setPartnerActionError('')
    setPartnerActionSuccess('')
    const code = partnerInviteCode.trim()
    if (!code) {
      setPartnerActionError('Введите код приглашения.')
      return
    }

    try {
      await joinCoupleRequest(code)
      setPartnerActionSuccess('Подключение к паре выполнено.')
      setPartnerInviteCode('')
      refetch()
    } catch {
      setPartnerActionError('Не удалось подключиться. Проверьте код и попробуйте снова.')
    }
  }

  return (
    <div className="settings">
      <h1 className="settings__title">Настройки</h1>
      <AsyncDataView
        status={status}
        error={error}
        onRetry={refetch}
        loadingLabel="Загружаем настройки…"
      >
      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter' || e.defaultPrevented) return
          const el = e.target as HTMLElement
          if (!el.closest('.invite-connect')) return
          if (el.id === 'partner-invite-code') return
          if (el.closest('button')) return
          e.preventDefault()
        }}
        className="settings__form"
      >
        {submitError && (
          <div className="settings__form-error" role="alert">
            {submitError}
          </div>
        )}

        <Card title="Профили партнёров">
          <div className="profiles">
            <div className="profile">
              <div className="profile__head">
                <div className="profile__avatar">
                  {(currentMember?.name ?? 'Вы')
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="profile__name">{currentMember?.name ?? 'Вы'}</div>
                  <div className="profile__sub">Ваш профиль</div>
                </div>
              </div>

              <div className="profile__fields">
                <div className="profile__field-slot profile__field-slot--email">
                  <Controller
                    name="myEmail"
                    control={control}
                    rules={{
                      required: 'Введите email',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Похоже на некорректный адрес'
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        id="a-email"
                        label="Email"
                        type="email"
                        autoComplete="email"
                        placeholder="your@email.com"
                        {...field}
                      />
                    )}
                  />
                  {errors.myEmail ? (
                    <p className="settings__error">{errors.myEmail.message}</p>
                  ) : null}
                  {emailChanged ? (
                    <div className="settings__email-password">
                      <Controller
                        name="emailPassword"
                        control={control}
                        rules={{
                          required: 'Введите пароль для подтверждения смены почты'
                        }}
                        render={({ field }) => (
                          <Input
                            id="a-email-password"
                            label="Текущий пароль"
                            type="password"
                            autoComplete="current-password"
                            {...field}
                          />
                        )}
                      />
                      {errors.emailPassword ? (
                        <p className="settings__error">{errors.emailPassword.message}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="profile__field-slot profile__field-slot--income">
                  <Controller
                    name="myIncome"
                    control={control}
                    rules={{
                      required: 'Введите ваш доход',
                      validate: (value) => {
                        const trimmed = value.trim()

                        if (!trimmed) return 'Введите ваш доход'

                        const num = Number(trimmed)

                        if (Number.isNaN(num)) return 'Введите число'
                        if (num < 0) return 'Сумма не может быть отрицательной'

                        return true
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        id="a-income"
                        label="Ваш месячный доход"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="Введите доход"
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/\D/g, ''))
                        }
                      />
                    )}
                  />
                  {errors.myIncome && (
                    <p className="settings__error">{errors.myIncome.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="profile profile--partner">
              <div className="profile__head">
                <div className="profile__avatar profile__avatar--b">
                  {(partnerMember?.name ?? 'Партнёр')
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="profile__name">{partnerMember?.name ?? 'Партнёр'}</div>
                  <div className="profile__sub">
                    {hasPartner ? 'Профиль партнёра' : 'Ожидает подключения'}
                  </div>
                </div>
              </div>

              <div className="profile__fields">
                <div className="profile__field-slot profile__field-slot--email">
                  <Input
                    id="b-email"
                    label="Email"
                    type="email"
                    placeholder={partnerMember?.email ?? 'Партнёр не подключён'}
                    value={partnerMember?.email ?? ''}
                    onChange={() => {}}
                    readOnly
                  />
                </div>

                <div className="profile__field-slot profile__field-slot--income">
                  <Input
                    id="b-income"
                    label="Месячный доход партнёра"
                    type="text"
                    placeholder="Доход партнёра задаётся в его аккаунте"
                    value={
                      hasPartner
                        ? 'Изменяется в аккаунте партнёра'
                        : 'Станет доступно после подключения'
                    }
                    onChange={() => {}}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Партнёр и доступ">
          <div className="invite-connect">
            <div
              className={
                'invite-connect__status' +
                (connectionStatus === 'pair-connected'
                  ? ' invite-connect__status--ok'
                  : connectionStatus === 'waiting-partner'
                    ? ' invite-connect__status--pending'
                    : '')
              }
            >
              <span className="invite-connect__status-dot" aria-hidden />
              <div className="invite-connect__status-text">
                <span className="invite-connect__status-label">Статус</span>
                <span className="invite-connect__status-value">
                  {connectionStatus === 'pair-not-created' &&
                    'Пара не создана — выберите действие ниже'}
                  {connectionStatus === 'waiting-partner' &&
                    'Ожидается второй участник — отправьте код приглашения'}
                  {connectionStatus === 'pair-connected' &&
                    'Пара активна, оба участника подключены'}
                </span>
              </div>
            </div>

            {!hasCouple ? (
              <>
                <div className="invite-connect__modes" role="tablist" aria-label="Способ подключения">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={connectionMode === 'create'}
                    className={
                      'invite-connect__mode' +
                      (connectionMode === 'create' ? ' invite-connect__mode--active' : '')
                    }
                    onClick={() => setConnectionMode('create')}
                  >
                    Создать приглашение
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={connectionMode === 'join'}
                    className={
                      'invite-connect__mode' +
                      (connectionMode === 'join' ? ' invite-connect__mode--active' : '')
                    }
                    onClick={() => setConnectionMode('join')}
                  >
                    Ввести код приглашения
                  </button>
                </div>

                {connectionMode === 'create' ? (
                  <div className="invite-connect__panel" role="tabpanel">
                    <h3 className="invite-connect__panel-title">Новый код</h3>
                    <p className="invite-connect__lead">
                      Сгенерируйте одноразовый код и передайте его партнёру в мессенджере или при
                      встрече.
                    </p>
                    <Button
                      type="button"
                      variant="primary"
                      className="invite-connect__cta"
                      onClick={handleGetInviteCode}
                    >
                      Создать код приглашения
                    </Button>
                  </div>
                ) : (
                  <div className="invite-connect__panel" role="tabpanel">
                    <h3 className="invite-connect__panel-title">Подключение к существующей паре</h3>
                    <p className="invite-connect__lead">
                      Вставьте код, который прислал партнёр после создания приглашения.
                    </p>
                    <Input
                      id="partner-invite-code"
                      label="Код приглашения"
                      placeholder="Например: FINPAIR-A1B2C3"
                      value={partnerInviteCode}
                      onChange={(e) => setPartnerInviteCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          void handleJoinByCode()
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="primary"
                      className="invite-connect__cta invite-connect__cta--join"
                      onClick={handleJoinByCode}
                    >
                      Подключиться к паре
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="invite-connect__panel invite-connect__panel--code">
                <h3 className="invite-connect__panel-title">Текущий код приглашения</h3>
                <p className="invite-connect__lead">
                  Новый код создать нельзя — можно только скопировать этот и отправить партнёру.
                </p>
                <div className="invite-connect__code-row">
                  <div className="invite-connect__code">{inviteCode || '—'}</div>
                  <Button type="button" variant="primary" onClick={handleCopy}>
                    {copied ? 'Скопировано' : 'Копировать'}
                  </Button>
                </div>
              </div>
            )}
            {partnerActionError && (
              <p className="invite-connect__message invite-connect__message--error" role="alert">
                {partnerActionError}
              </p>
            )}
            {partnerActionSuccess && (
              <p className="invite-connect__message invite-connect__message--success">
                {partnerActionSuccess}
              </p>
            )}
          </div>
        </Card>

        <Card title="Способ деления расходов">
          <Controller
            name="splitType"
            control={control}
            render={({ field }) => (
              <div className="split">
                {SPLITS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => field.onChange(s.id)}
                    className={
                      'split__btn' + (field.value === s.id ? ' split__btn--active' : '')
                    }
                  >
                    <span className="split__icon">{s.icon}</span>
                    <span className="split__title">{s.title}</span>
                    <span className="split__hint">{s.hint}</span>
                  </button>
                ))}
              </div>
            )}
          />
        </Card>

        <div className="settings__two-col">
          <Card title="💱 Валюта">
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <select
                  className="select"
                  value={field.value}
                  onChange={field.onChange}
                >
                  <option value="RUB">₽ Российский рубль</option>
                  <option value="USD">$ Доллар США</option>
                  <option value="EUR">€ Евро</option>
                </select>
              )}
            />
          </Card>

          <Card title="🔔 Уведомления">
            <div className="notifs">
              <Controller
                name="notifications.newTransactions"
                control={control}
                render={({ field }) => (
                  <label className="notifs__row">
                    <span>Новые транзакции</span>
                    <Toggle checked={field.value} onChange={field.onChange} />
                  </label>
                )}
              />

              <Controller
                name="notifications.goalsProgress"
                control={control}
                render={({ field }) => (
                  <label className="notifs__row">
                    <span>Прогресс целей</span>
                    <Toggle checked={field.value} onChange={field.onChange} />
                  </label>
                )}
              />

              <Controller
                name="notifications.monthlyReports"
                control={control}
                render={({ field }) => (
                  <label className="notifs__row">
                    <span>Месячные отчёты</span>
                    <Toggle checked={field.value} onChange={field.onChange} />
                  </label>
                )}
              />
            </div>
          </Card>
        </div>

        <div className="settings__actions">
          <div className="settings__actions-submit">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
            {saveSuccess && (
              <p
                ref={saveSuccessRef}
                className="settings__save-feedback"
                role="status"
                aria-live="polite"
              >
                Изменения сохранены.
              </p>
            )}
          </div>
        </div>
      </form>
      </AsyncDataView>
    </div>
  )
}