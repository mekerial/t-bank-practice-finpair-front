import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { loginUser, useAppDispatch, useAppSelector } from '../../app/store'
import { ROUTES } from '../../shared/config/routes'
import { getErrorMessage } from '../../shared/lib/asyncUtils'
import Input from '../../shared/ui/Input'
import Button from '../../shared/ui/Button'
import './auth.css'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)
  const [formError, setFormError] = useState('')

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onSubmit'
  })

  const onSubmit = async (data: LoginForm) => {
    setFormError('')
    try {
      await dispatch(loginUser(data)).unwrap()
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (e) {
      const message =
        typeof e === 'string' ? e : getErrorMessage(e)
      setFormError(message)
    }
  }

  const onInvalid = () => {
    setFormError('Заполните все обязательные поля')
  }

  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    <div className="auth-form">
      <div className="auth-form__header">
        <svg
          className="auth-form__icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        <h2 className="auth-form__title">Вход</h2>
      </div>

      <form
        className="auth-form__form"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
      >
        {formError && <p className="auth-form__common-error">{formError}</p>}

        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Введите email',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Некорректный email'
            }
          }}
          render={({ field }) => (
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              {...field}
            />
          )}
        />
        {errors.email && (
          <p className="auth-form__error">{errors.email.message}</p>
        )}

        <Controller
          name="password"
          control={control}
          rules={{
            required: 'Введите пароль',
            minLength: {
              value: 6,
              message: 'Минимум 6 символов'
            }
          }}
          render={({ field }) => (
            <Input
              id="password"
              label="Пароль"
              type="password"
              placeholder="Ваш пароль"
              autoComplete="current-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              {...field}
            />
          )}
        />
        {errors.password && (
          <p className="auth-form__error">{errors.password.message}</p>
        )}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Входим…' : 'Войти'}
        </Button>
      </form>

      <div className="auth-form__footer">
        <span>Нет аккаунта? </span>
        <Link to={ROUTES.REGISTER} className="auth-form__link">
          Зарегистрироваться
        </Link>
      </div>
    </div>
  )
}