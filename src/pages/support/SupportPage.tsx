import { useState } from 'react'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import { IconChevronRight } from '../../shared/ui/icons'
import {
  mockFaq,
  mockContacts,
  type FaqItem as FaqModel
} from '../../shared/lib/mocks'
import './support.css'

interface FaqItemProps {
  item: FaqModel
  open: boolean
  onToggle: () => void
}

function FaqItem({ item, open, onToggle }: FaqItemProps) {
  return (
    <div className={'faq' + (open ? ' faq--open' : '')}>
      <button className="faq__button" type="button" onClick={onToggle}>
        <span>{item.question}</span>
        <IconChevronRight width={18} height={18} className="faq__chevron" />
      </button>
      {open && <div className="faq__answer">{item.answer}</div>}
    </div>
  )
}

export default function SupportPage() {
  const [openId, setOpenId] = useState<number | null>(mockFaq[0].id)
  const [message, setMessage] = useState('')

  return (
    <div className="support">
      <h1 className="support__title">Помощь и поддержка</h1>

      <Card>
        <h3 className="support__greeting">👋 Нужна помощь?</h3>
        <p className="support__text">
          Мы здесь, чтобы помочь вам максимально эффективно использовать
          FinPair. Выберите удобный способ связи или найдите ответ в FAQ ниже.
        </p>
      </Card>

      <div className="support__grid">
        <Card title="Часто задаваемые вопросы">
          <div className="faq-list">
            {mockFaq.map((f) => (
              <FaqItem
                key={f.id}
                item={f}
                open={openId === f.id}
                onToggle={() => setOpenId(openId === f.id ? null : f.id)}
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="chat-head">
            <div className="chat-head__avatar">💬</div>
            <div>
              <h3 className="chat-head__title">Чат с поддержкой</h3>
              <p className="chat-head__hint">Обычно отвечаем за 5 минут</p>
            </div>
          </div>

          <div className="chat-msg">
            <div className="chat-msg__avatar">F</div>
            <div>
              <div className="chat-msg__name">Поддержка FinPair</div>
              <div className="chat-msg__text">
                Здравствуйте! Чем мы можем вам помочь сегодня? 😊
              </div>
            </div>
          </div>

          <textarea
            className="chat-textarea"
            placeholder="Введите ваше сообщение..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="secondary" fullWidth>
            Отправить сообщение
          </Button>
        </Card>
      </div>

      <Card title="Контактная информация">
        <div className="contacts">
          <div className="contacts__item">
            <div className="contacts__label">📧 Email поддержки</div>
            <a href={`mailto:${mockContacts.email}`} className="contacts__link">
              {mockContacts.email}
            </a>
          </div>
          <div className="contacts__item">
            <div className="contacts__label">🕘 Часы работы</div>
            <div className="contacts__value">{mockContacts.hours}</div>
          </div>
          <div className="contacts__item">
            <div className="contacts__label">✈️ Telegram</div>
            <a href="#" className="contacts__link">
              {mockContacts.telegram}
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}
