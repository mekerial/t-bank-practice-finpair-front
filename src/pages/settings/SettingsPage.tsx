import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import {
  mockPartner,
  mockSettings,
  mockUser,
  type SplitType,
  type NotificationSettings
} from '../../shared/lib/mocks'
import './settings.css'

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
  partnerAEmail: string
  partnerAIncome: string
  partnerBEmail: string
  partnerBIncome: string
  splitType: SplitType
  currency: 'RUB' | 'USD' | 'EUR'
  notifications: NotificationSettings
}

function generateInviteCode() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)

  const value = Array.from(bytes, (byte) => {
    return alphabet[byte % alphabet.length]
  }).join('')

  return `FINPAIR-${value}`
}

export default function SettingsPage() {
  const [copied, setCopied] = useState(false)
  const [inviteCode, setInviteCode] = useState(mockSettings.inviteCode)
  const [submitError, setSubmitError] = useState('')
  const formRef = useRef<HTMLFormElement | null>(null)
  const inviteBlockRef = useRef<HTMLDivElement | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SettingsFormValues>({
    defaultValues: {
      partnerAEmail: mockSettings.profiles.a.email,
      partnerAIncome: String(mockSettings.profiles.a.income),
      partnerBEmail: mockSettings.profiles.b.email,
      partnerBIncome: String(mockSettings.profiles.b.income),
      splitType: mockSettings.splitType,
      currency: mockSettings.currency,
      notifications: {
        newTransactions: mockSettings.notifications.newTransactions,
        goalsProgress: mockSettings.notifications.goalsProgress,
        monthlyReports: mockSettings.notifications.monthlyReports
      }
    },
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  useEffect(() => {
    const node = inviteBlockRef.current
    if (!node) return

    let wasVisible = false

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasVisible) {
          setInviteCode(generateInviteCode())
          setCopied(false)
          wasVisible = true
        }

        if (!entry.isIntersecting) {
          wasVisible = false
        }
      },
      {
        threshold: 0.65
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const onSubmit = (data: SettingsFormValues) => {
    setSubmitError('')
    const partnerAIncome = Number(data.partnerAIncome.trim())
    const partnerBIncome = Number(data.partnerBIncome.trim())

    const payload = {
      ...data,
      partnerAIncome,
      partnerBIncome,
      inviteCode
    }

    console.log('settings submit', payload)
  }

  const onInvalid = () => {
    setSubmitError('Исправьте ошибки в форме и попробуйте снова')

    const top = formRef.current?.offsetTop ?? 0
    window.scrollTo({
      top: Math.max(top - 16, 0),
      behavior: 'smooth'
    })
  }

  return (
    <div className="settings">
      <h1 className="settings__title">Настройки</h1>

      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit, onInvalid)}
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
                  {mockUser.name
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="profile__name">{mockUser.name}</div>
                  <div className="profile__sub">{mockUser.subtitle}</div>
                </div>
              </div>

              <div className="profile__fields">
                <div>
                  <Controller
                    name="partnerAEmail"
                    control={control}
                    rules={{
                      required: 'Заполните email корректно',
                      validate: (value) => {
                        const trimmed = value.trim()

                        if (!trimmed) return 'Заполните email корректно'
                        if (!trimmed.includes('@')) {
                          return 'Заполните email корректно'
                        }

                        const emailRegex =
                          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

                        if (!emailRegex.test(trimmed)) {
                          return 'Заполните email корректно'
                        }

                        return true
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        id="a-email"
                        label="Email"
                        type="email"
                        placeholder={mockUser.email}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.partnerAEmail && (
                    <p className="settings__error">{errors.partnerAEmail.message}</p>
                  )}
                </div>

                <div>
                  <Controller
                    name="partnerAIncome"
                    control={control}
                    rules={{
                      required: 'Введите доход партнёра А',
                      validate: (value) => {
                        const trimmed = value.trim()

                        if (!trimmed) return 'Введите доход партнёра А'

                        const num = Number(trimmed)

                        if (Number.isNaN(num)) return 'Введите число'
                        if (num <= 0) return 'Сумма должна быть больше 0'

                        return true
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        id="a-income"
                        label="Месячный доход"
                        type="number"
                        placeholder={String(mockUser.income)}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  {errors.partnerAIncome && (
                    <p className="settings__error">{errors.partnerAIncome.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="profile">
              <div className="profile__head">
                <div className="profile__avatar profile__avatar--b">
                  {mockPartner.name
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="profile__name">{mockPartner.name}</div>
                  <div className="profile__sub">{mockPartner.subtitle}</div>
                </div>
              </div>

              <div className="profile__fields">
                <div>
                  <Controller
                    name="partnerBEmail"
                    control={control}
                    rules={{
                      required: 'Заполните email корректно',
                      validate: (value) => {
                        const trimmed = value.trim()

                        if (!trimmed) return 'Заполните email корректно'
                        if (!trimmed.includes('@')) {
                          return 'Заполните email корректно'
                        }

                        const emailRegex =
                          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

                        if (!emailRegex.test(trimmed)) {
                          return 'Заполните email корректно'
                        }

                        return true
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        id="b-email"
                        label="Email"
                        type="email"
                        placeholder={mockPartner.email}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.partnerBEmail && (
                    <p className="settings__error">{errors.partnerBEmail.message}</p>
                  )}
                </div>

                <div>
                  <Controller
                    name="partnerBIncome"
                    control={control}
                    rules={{
                      required: 'Введите доход партнёра Б',
                      validate: (value) => {
                        const trimmed = value.trim()

                        if (!trimmed) return 'Введите доход партнёра Б'

                        const num = Number(trimmed)

                        if (Number.isNaN(num)) return 'Введите число'
                        if (num <= 0) return 'Сумма должна быть больше 0'

                        return true
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        id="b-income"
                        label="Месячный доход"
                        type="number"
                        placeholder={String(mockPartner.income)}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                  {errors.partnerBIncome && (
                    <p className="settings__error">{errors.partnerBIncome.message}</p>
                  )}
                </div>
              </div>
            </div>
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

        <div ref={inviteBlockRef}>
          <Card title="Код приглашения">
            <p className="invite__desc">
              Поделитесь этим кодом с партнёром для подключения к вашему аккаунту
            </p>
            <div className="invite">
              <div className="invite__code">{inviteCode}</div>
              <Button type="button" variant="primary" onClick={handleCopy}>
                {copied ? 'Скопировано' : 'Копировать'}
              </Button>
            </div>
          </Card>
        </div>

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
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </div>
  )
}