import { useState } from 'react'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import { IconChevronRight } from '../../shared/ui/icons'
import { useAsyncData } from '../../shared/hooks/useAsyncData'
import AsyncDataView from '../../shared/ui/AsyncDataView'
import {
  fetchSupportContactsRequest,
  fetchSupportFaqRequest,
  sendSupportMessageRequest,
  type SupportFaqItem as FaqModel
} from '../../shared/api/supportApi'
import './support.css'
import '../../app/styles/mobile-pages.css'

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
  const { data, status, error, refetch } = useAsyncData('support', async () => {
    const [faq, contacts] = await Promise.all([
      fetchSupportFaqRequest(),
      fetchSupportContactsRequest()
    ])
    return { faq, contacts }
  })
  const [openId, setOpenId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendState, setSendState] = useState<{ error: string; success: string }>({
    error: '',
    success: ''
  })

  const faq = data?.faq ?? []
  const contacts = data?.contacts
  const telegramRaw = (contacts?.telegram ?? '@finpair_support').trim()
  const telegramHandle = telegramRaw.replace(/^@/, '')
  const telegramHref = `https://t.me/${telegramHandle}`

  const onSendMessage = async () => {
    const trimmed = message.trim()
    if (!trimmed) {
      setSendState({ error: 'Введите сообщение перед отправкой', success: '' })
      return
    }

    setIsSending(true)
    setSendState({ error: '', success: '' })

    try {
      await sendSupportMessageRequest({ message: trimmed })
      setMessage('')
      setSendState({ error: '', success: 'Сообщение отправлено в поддержку' })
    } catch {
      setSendState({
        error: 'Не удалось отправить сообщение. Попробуйте ещё раз.',
        success: ''
      })
    } finally {
      setIsSending(false)
    }
  }

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

      <AsyncDataView
        status={status}
        error={error}
        onRetry={refetch}
        loadingLabel="Загружаем поддержку…"
      >
      <div className="support__grid">
        <Card title="Часто задаваемые вопросы">
          <div className="faq-list">
            {faq.length > 0 ? (
              faq.map((f) => (
                <FaqItem
                  key={f.id}
                  item={f}
                  open={openId === f.id}
                  onToggle={() => setOpenId(openId === f.id ? null : f.id)}
                />
              ))
            ) : (
              <p className="support__text">Пока нет вопросов. Напишите нам в чат поддержки.</p>
            )}
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

          <form
            className="support__chat-form"
            onSubmit={(e) => {
              e.preventDefault()
              void onSendMessage()
            }}
          >
            <textarea
              className="chat-textarea"
              placeholder="Введите ваше сообщение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" variant="primary" fullWidth disabled={isSending}>
              {isSending ? 'Отправка…' : 'Отправить сообщение'}
            </Button>
          </form>
          {sendState.error && (
            <p className="auth-form__common-error" role="alert">
              {sendState.error}
            </p>
          )}
          {sendState.success && (
            <p className="support__send-success" role="status">
              {sendState.success}
            </p>
          )}
        </Card>
      </div>

      <Card title="Контактная информация" className="support__contacts-card">
        <div className="contacts">
          <div className="contacts__item">
            <div className="contacts__label">📧 Email поддержки</div>
            <a href={`mailto:${contacts?.email ?? 'support@finpair.app'}`} className="contacts__link">
              {contacts?.email ?? 'support@finpair.app'}
            </a>
          </div>
          <div className="contacts__item">
            <div className="contacts__label">🕘 Часы работы</div>
            <div className="contacts__value">Пн-Пт: 9:00 - 21:00 МСК</div>
          </div>
          <div className="contacts__item">
            <div className="contacts__label">✈️ Telegram</div>
            <a href={telegramHref} className="contacts__link" target="_blank" rel="noreferrer">
              {telegramRaw}
            </a>
          </div>
        </div>
      </Card>
      </AsyncDataView>
    </div>
  )
}
