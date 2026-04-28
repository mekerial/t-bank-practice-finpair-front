import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  clearAuthError,
  registerUser,
  useAppDispatch,
  useAppSelector
} from '../../app/store'
import { ROUTES } from '../../shared/config/routes'
import { getErrorMessage } from '../../shared/lib/asyncUtils'
import Input from '../../shared/ui/Input'
import Button from '../../shared/ui/Button'
import './auth.css'

interface RegisterForm {
  name: string
  email: string
  password: string
  passwordConfirm: string
}

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, status, error } = useAppSelector((s) => s.auth)
  const [formError, setFormError] = useState('')

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid }
  } = useForm<RegisterForm>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: ''
    },
    mode: 'onChange'
  })

  const passwordValue = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    setFormError('')
    dispatch(clearAuthError())
    try {
      await dispatch(
        registerUser({
          name: data.name,
          email: data.email,
          password: data.password
        })
      ).unwrap()
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

  useEffect(() => {
    if (formError === 'Заполните все обязательные поля' && isValid) {
      setFormError('')
    }
  }, [formError, isValid])

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
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
        <h2 className="auth-form__title">Регистрация</h2>
      </div>

      <form
        className="auth-form__form"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
      >
        {(error || formError) && (
          <p className="auth-form__common-error">{error ?? formError}</p>
        )}

        <Controller
          name="name"
          control={control}
          rules={{
            required: 'Введите имя'
          }}
          render={({ field }) => (
            <Input
              id="name"
              label="Имя"
              placeholder="Ваше имя"
              autoComplete="name"
              aria-invalid={errors.name ? 'true' : 'false'}
              {...field}
            />
          )}
        />
        {errors.name && (
          <p className="auth-form__error">{errors.name.message}</p>
        )}

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
              placeholder="Минимум 6 символов"
              autoComplete="new-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              {...field}
            />
          )}
        />
        {errors.password && (
          <p className="auth-form__error">{errors.password.message}</p>
        )}

        <Controller
          name="passwordConfirm"
          control={control}
          rules={{
            required: 'Подтвердите пароль',
            validate: (value) =>
              value === passwordValue || 'Пароли не совпадают'
          }}
          render={({ field }) => (
            <Input
              id="passwordConfirm"
              label="Подтвердите пароль"
              type="password"
              placeholder="Повторите пароль"
              autoComplete="new-password"
              aria-invalid={errors.passwordConfirm ? 'true' : 'false'}
              {...field}
            />
          )}
        />
        {errors.passwordConfirm && (
          <p className="auth-form__error">
            {errors.passwordConfirm.message}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isSubmitting || status === 'loading'}>
          {isSubmitting || status === 'loading'
            ? 'Создаём аккаунт…'
            : 'Создать аккаунт'}
        </Button>
      </form>

      <div className="auth-form__footer">
        <span>Уже есть аккаунт? </span>
        <Link to={ROUTES.LOGIN} className="auth-form__link">
          Войти
        </Link>
      </div>
    </div>
  )
}