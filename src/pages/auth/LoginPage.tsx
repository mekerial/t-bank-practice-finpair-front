import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../shared/config/routes'
import Input from '../../shared/ui/Input'
import Button from '../../shared/ui/Button'
import './auth.css'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' })

  const handleChange =
    (field: keyof LoginForm) => (event: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('login submit', form)
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

      <form className="auth-form__form" onSubmit={handleSubmit}>
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
          placeholder="Ваш пароль"
          value={form.password}
          onChange={handleChange('password')}
          autoComplete="current-password"
          required
        />

        <Button type="submit" fullWidth>
          Войти
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
