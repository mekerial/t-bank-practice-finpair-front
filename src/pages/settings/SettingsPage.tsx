import { useState } from 'react'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import {
  mockUser,
  mockPartner,
  mockSettings,
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

interface ProfileForm {
  email: string
  income: number | string
}

export default function SettingsPage() {
  const [split, setSplit] = useState<SplitType>(mockSettings.splitType)
  const [notifs, setNotifs] = useState<NotificationSettings>(
    mockSettings.notifications
  )
  const [copied, setCopied] = useState(false)
  const [profileA, setProfileA] = useState<ProfileForm>({
    email: mockUser.email,
    income: mockUser.income
  })
  const [profileB, setProfileB] = useState<ProfileForm>({
    email: mockPartner.email,
    income: mockPartner.income
  })

  const handleCopy = () => {
    navigator.clipboard?.writeText(mockSettings.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="settings">
      <h1 className="settings__title">Настройки</h1>

      <Card title="Профили партнёров">
        <div className="profiles">
          <div className="profile">
            <div className="profile__head">
              <div className="profile__avatar">А</div>
              <div>
                <div className="profile__name">Партнёр А</div>
                <div className="profile__sub">Основной аккаунт</div>
              </div>
            </div>
            <div className="profile__fields">
              <Input
                id="a-email"
                label="Email"
                type="email"
                value={profileA.email}
                onChange={(e) =>
                  setProfileA({ ...profileA, email: e.target.value })
                }
              />
              <Input
                id="a-income"
                label="Месячный доход"
                value={profileA.income}
                onChange={(e) =>
                  setProfileA({ ...profileA, income: e.target.value })
                }
              />
            </div>
          </div>

          <div className="profile">
            <div className="profile__head">
              <div className="profile__avatar profile__avatar--b">Б</div>
              <div>
                <div className="profile__name">Партнёр Б</div>
                <div className="profile__sub">Второй аккаунт</div>
              </div>
            </div>
            <div className="profile__fields">
              <Input
                id="b-email"
                label="Email"
                type="email"
                value={profileB.email}
                onChange={(e) =>
                  setProfileB({ ...profileB, email: e.target.value })
                }
              />
              <Input
                id="b-income"
                label="Месячный доход"
                value={profileB.income}
                onChange={(e) =>
                  setProfileB({ ...profileB, income: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Способ деления расходов">
        <div className="split">
          {SPLITS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSplit(s.id)}
              className={
                'split__btn' + (split === s.id ? ' split__btn--active' : '')
              }
            >
              <span className="split__icon">{s.icon}</span>
              <span className="split__title">{s.title}</span>
              <span className="split__hint">{s.hint}</span>
            </button>
          ))}
        </div>
        <div className="split__note">{mockSettings.splitNote}</div>
      </Card>

      <Card title="Код приглашения">
        <p className="invite__desc">
          Поделитесь этим кодом с партнёром для подключения к вашему аккаунту
        </p>
        <div className="invite">
          <div className="invite__code">{mockSettings.inviteCode}</div>
          <Button variant="secondary" onClick={handleCopy}>
            {copied ? 'Скопировано' : 'Копировать'}
          </Button>
        </div>
      </Card>

      <div className="settings__two-col">
        <Card title="💱 Валюта">
          <select className="select">
            <option>₽ Российский рубль</option>
            <option>$ Доллар США</option>
            <option>€ Евро</option>
          </select>
        </Card>

        <Card title="🔔 Уведомления">
          <div className="notifs">
            <label className="notifs__row">
              <span>Новые транзакции</span>
              <Toggle
                checked={notifs.newTransactions}
                onChange={(v) => setNotifs({ ...notifs, newTransactions: v })}
              />
            </label>
            <label className="notifs__row">
              <span>Прогресс целей</span>
              <Toggle
                checked={notifs.goalsProgress}
                onChange={(v) => setNotifs({ ...notifs, goalsProgress: v })}
              />
            </label>
            <label className="notifs__row">
              <span>Месячные отчёты</span>
              <Toggle
                checked={notifs.monthlyReports}
                onChange={(v) => setNotifs({ ...notifs, monthlyReports: v })}
              />
            </label>
          </div>
        </Card>
      </div>

      <div className="settings__actions">
        <Button>Сохранить</Button>
      </div>
    </div>
  )
}
