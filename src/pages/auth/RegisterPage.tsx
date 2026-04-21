import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../shared/config/routes'
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
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  })

  const handleChange =
    (field: keyof RegisterForm) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('register submit', form)
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

      <form className="auth-form__form" onSubmit={handleSubmit}>
        <Input
          id="name"
          label="Имя"
          placeholder="Ваше имя"
          value={form.name}
          onChange={handleChange('name')}
          autoComplete="name"
          required
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="your@email.com"
          value={form.email}
          onChange={handleChange('email')}
          autoComplete="email"
          required
        />
        <Input
          id="password"
          label="Пароль"
          type="password"
          placeholder="Минимум 6 символов"
          value={form.password}
          onChange={handleChange('password')}
          autoComplete="new-password"
          required
        />
        <Input
          id="passwordConfirm"
          label="Подтвердите пароль"
          type="password"
          placeholder="Повторите пароль"
          value={form.passwordConfirm}
          onChange={handleChange('passwordConfirm')}
          autoComplete="new-password"
          required
        />

        <Button type="submit" fullWidth>
          Создать аккаунт
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
