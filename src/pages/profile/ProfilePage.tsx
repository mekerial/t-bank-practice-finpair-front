import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import AsyncDataView from '../../shared/ui/AsyncDataView'
import { useAsyncData } from '../../shared/hooks/useAsyncData'
import {
  type CoupleDetails,
  type CoupleMember,
  fetchCoupleRequest,
  fetchSettingsRequest,
  fetchUserProfileRequest,
  updateUserProfileRequest
} from '../../shared/api/settingsApi'
import { changeEmailRequest } from '../../shared/api/authApi'
import { ROUTES } from '../../shared/config/routes'
import { getErrorMessage } from '../../shared/lib/asyncUtils'
import { fetchAuthUser, useAppDispatch } from '../../app/store'
import { isValidHouseholdId } from '../../shared/lib/householdId'
import './profile.css'

const SUCCESS_TOAST_MS = 6000

interface NameFormValues {
  name: string
}

interface EmailFormValues {
  newEmail: string
  password: string
}

function splitExpensesLabel(split: CoupleDetails['splitType']): string {
  switch (split) {
    case 'equal':
      return 'Поровну'
    case 'income':
    case 'income_ratio':
      return 'По доходу'
    case 'custom':
      return 'Свои доли'
    default:
      return '—'
  }
}

function greetingName(name: string | undefined, email: string | undefined): string {
  const n = (name ?? '').trim()
  if (n) return n.split(/\s+/)[0] ?? n
  const local = (email ?? '').split('@')[0]?.trim()
  return local || 'Пользователь'
}

function currencyLabel(code: string | undefined): string {
  const c = (code ?? 'RUB').toUpperCase()
  if (c === 'RUB') return 'Рубли (₽)'
  if (c === 'USD') return 'Доллары ($)'
  if (c === 'EUR') return 'Евро (€)'
  return c
}

function initialsFromUser(name: string | undefined, email: string | undefined): string {
  const n = (name ?? '').trim()
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
    }
    return n.slice(0, 2).toUpperCase()
  }
  const e = (email ?? '').trim()
  return e ? e.slice(0, 2).toUpperCase() : '?'
}

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const [nameMessage, setNameMessage] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [emailError, setEmailError] = useState('')

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
    const [user, settings, couple] = await Promise.all([
      fetchUserProfileRequest(),
      fetchSettingsRequest(),
      fetchCoupleRequest().catch((e) => {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          return defaultCouple
        }
        throw e
      })
    ])
    return { user, settings, couple }
  })

  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    reset: resetName,
    formState: { isSubmitting: nameSubmitting }
  } = useForm<NameFormValues>({
    defaultValues: { name: '' },
    mode: 'onBlur'
  })

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    reset: resetEmail,
    clearErrors: clearEmailFieldErrors,
    formState: { isSubmitting: emailSubmitting, errors: emailFieldErrors }
  } = useForm<EmailFormValues>({
    defaultValues: { newEmail: '', password: '' },
    /** Только по кнопке «Сохранить почту», чтобы блок почты не валидировался при сохранении имени. */
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  })

  useEffect(() => {
    if (!data?.user) return
    resetName({ name: data.user.name ?? '' })
  }, [data?.user, resetName])

  useEffect(() => {
    if (!nameMessage) return
    const id = window.setTimeout(() => setNameMessage(''), SUCCESS_TOAST_MS)
    return () => window.clearTimeout(id)
  }, [nameMessage])

  useEffect(() => {
    if (!emailMessage) return
    const id = window.setTimeout(() => setEmailMessage(''), SUCCESS_TOAST_MS)
    return () => window.clearTimeout(id)
  }, [emailMessage])

  const currentUser = data?.user
  const displayInitials = initialsFromUser(currentUser?.name, currentUser?.email)

  const household = data?.couple
  const hasHousehold = isValidHouseholdId(household?.id)
  const members: CoupleMember[] = household?.members?.length
    ? household.members
    : (household?.users ?? [])
  const householdCurrency = household?.currency ?? data?.settings.currency ?? 'RUB'

  const memberChips = useMemo(() => {
    return members.map((m) => ({
      userId: m.userId,
      initials: initialsFromUser(m.name, m.email),
      title: (m.name ?? '').trim() || m.email?.split('@')[0] || 'Участник'
    }))
  }, [members])

  const onSaveName = handleSubmitName(async (values) => {
    setNameError('')
    setNameMessage('')
    setEmailError('')
    setEmailMessage('')
    clearEmailFieldErrors()
    try {
      await updateUserProfileRequest({ name: values.name.trim() })
      setNameMessage('Имя сохранено.')
      await refetch()
      void dispatch(fetchAuthUser())
    } catch (e) {
      setNameMessage('')
      setNameError(getErrorMessage(e))
    }
  })

  const onSaveEmail = handleSubmitEmail(async (values) => {
    setEmailError('')
    setEmailMessage('')
    const next = values.newEmail.trim().toLowerCase()
    const current = (currentUser?.email ?? '').trim().toLowerCase()
    if (!next) {
      setEmailError('Введите новый адрес почты.')
      return
    }
    if (next === current) {
      setEmailError('Новый адрес совпадает с текущим.')
      return
    }
    try {
      const result = await changeEmailRequest({
        email: values.newEmail.trim(),
        password: values.password
      })
      setEmailMessage(
        `Почта для входа обновлена: ${result.email}. Пароль не меняется — входите с тем же паролем и новой почтой.`
      )
      resetEmail({
        newEmail: result.email.trim(),
        password: values.password
      })
      await refetch()
      void dispatch(fetchAuthUser())
    } catch (e) {
      setEmailMessage('')
      setEmailError(getErrorMessage(e))
    }
  })

  return (
    <div className="profile-page">
      <header className="profile-page__head">
        <div className="profile-page__title-block">
          <h1 className="profile-page__title">Личный кабинет</h1>
          {currentUser ? (
            <p className="profile-page__tagline">
              {greetingName(currentUser.name, currentUser.email)}, здесь ваш профиль и быстрый доступ к разделам.
            </p>
          ) : null}
        </div>
        <Link className="profile-page__settings-link" to={ROUTES.SETTINGS}>
          Доход пары и настройки
        </Link>
      </header>

      <AsyncDataView
        status={status}
        error={error}
        onRetry={refetch}
        loadingLabel="Загружаем профиль…"
      >
        <div className="profile-page__band" aria-label="Сводка и навигация">
          <div className="profile-page__tiles">
            <div className="profile-page__tile">
              <div className="profile-page__tile-label">Валюта пары</div>
              <div className="profile-page__tile-value">
                {hasHousehold ? currencyLabel(householdCurrency) : '—'}
              </div>
            </div>
            <div className="profile-page__tile">
              <div className="profile-page__tile-label">Деление расходов</div>
              <div className="profile-page__tile-value">
                {hasHousehold ? splitExpensesLabel(household.splitType) : '—'}
              </div>
            </div>
            <div className="profile-page__tile profile-page__tile--members">
              <div className="profile-page__tile-label">Участники</div>
              {hasHousehold && memberChips.length > 0 ? (
                <div className="profile-page__member-chips">
                  {memberChips.map((m) => (
                    <span
                      key={m.userId}
                      className="profile-page__member-chip"
                      title={m.title}
                    >
                      {m.initials}
                    </span>
                  ))}
                  <span className="profile-page__member-meta">{memberChips.length} чел.</span>
                </div>
              ) : (
                <div className="profile-page__tile-value profile-page__tile-value--muted">
                  Создайте пару в настройках
                </div>
              )}
            </div>
          </div>
          <nav className="profile-page__shortcuts" aria-label="Быстрые разделы">
            <Link className="profile-page__shortcut" to={ROUTES.DASHBOARD}>
              Дашборд
            </Link>
            <Link className="profile-page__shortcut" to={ROUTES.TRANSACTIONS}>
              Транзакции
            </Link>
            <Link className="profile-page__shortcut" to={ROUTES.GOALS}>
              Цели
            </Link>
            <Link className="profile-page__shortcut" to={ROUTES.ANALYTICS}>
              Аналитика
            </Link>
            <Link className="profile-page__shortcut" to={ROUTES.SETTINGS}>
              Настройки
            </Link>
            <Link className="profile-page__shortcut" to={ROUTES.SUPPORT}>
              Помощь
            </Link>
          </nav>
        </div>

        <Card title="Профиль" className="profile-page__sheet">
          <div className="profile-page__sheet-body">
            <div className="profile-page__identity">
              <div className="profile-page__identity-top">
                <div className="profile-page__avatar" aria-hidden>
                  {displayInitials}
                </div>
                <div className="profile-page__identity-text">
                  <p className="profile-page__display-name">
                    {(currentUser?.name ?? '').trim() || 'Без имени'}
                  </p>
                  <p className="profile-page__display-mail" aria-live="polite">
                    {currentUser?.email ?? '—'}
                  </p>
                </div>
              </div>
              <h4 className="profile-page__section-title">Как вас видит партнёр</h4>
              <form className="profile-page__form profile-page__form--compact" onSubmit={onSaveName} noValidate>
                <Input
                  id="profile-name"
                  label="Имя"
                  autoComplete="name"
                  {...registerName('name', { maxLength: 100 })}
                />
                {nameError ? (
                  <p className="profile-page__error" role="alert">
                    {nameError}
                  </p>
                ) : null}
                {nameMessage ? (
                  <p className="profile-page__success" role="status" aria-live="polite">
                    {nameMessage}
                  </p>
                ) : null}
                <div className="profile-page__form-actions profile-page__form-actions--compact">
                  <Button type="submit" disabled={nameSubmitting}>
                    {nameSubmitting ? 'Сохранение…' : 'Сохранить имя'}
                  </Button>
                </div>
              </form>
            </div>

            <div className="profile-page__rail" aria-hidden />

            <div className="profile-page__credentials">
              <h4 className="profile-page__section-title">Смена почты для входа</h4>
              <p className="profile-page__hint">
                Вход в приложение после смены — только с нового адреса; пароль остаётся прежним.
              </p>
              <form className="profile-page__form profile-page__form--compact" onSubmit={onSaveEmail} noValidate>
                <Input
                  id="profile-new-email"
                  label="Новая почта"
                  type="email"
                  autoComplete="off"
                  {...registerEmail('newEmail', {
                    required: 'Укажите новую почту',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Похоже на некорректный адрес'
                    }
                  })}
                />
                <Input
                  id="profile-email-password"
                  label="Текущий пароль"
                  type="password"
                  autoComplete="current-password"
                  {...registerEmail('password', { required: 'Введите пароль' })}
                />
                {emailFieldErrors.newEmail ? (
                  <p className="profile-page__error" role="alert">
                    {emailFieldErrors.newEmail.message}
                  </p>
                ) : null}
                {emailFieldErrors.password ? (
                  <p className="profile-page__error" role="alert">
                    {emailFieldErrors.password.message}
                  </p>
                ) : null}
                {emailError ? (
                  <p className="profile-page__error" role="alert">
                    {emailError}
                  </p>
                ) : null}
                {emailMessage ? (
                  <p className="profile-page__success" role="status" aria-live="polite">
                    {emailMessage}
                  </p>
                ) : null}
                <div className="profile-page__form-actions profile-page__form-actions--compact">
                  <Button type="submit" variant="primary" disabled={emailSubmitting}>
                    {emailSubmitting ? 'Сохранение…' : 'Сохранить почту'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Card>
      </AsyncDataView>
    </div>
  )
}
