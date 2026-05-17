import { useState } from 'react'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import { IconChevronRight } from '../../shared/ui/icons'
import { useAsyncData } from '../../shared/hooks/useAsyncData'
import AsyncDataView from '../../shared/ui/AsyncDataView'
import {
  fetchSupportContactsRequest,
  fetchSupportFaqRequest,
  sendSupportChatMessageRequest,
  type SupportFaqItem as FaqModel
} from '../../shared/api/supportApi'
import './support.css'
import '../../app/styles/mobile-pages.css'

interface FaqItemProps {
  item: FaqModel
  open: boolean
  onToggle: () => void
}

interface ChatMessage {
  id: string
  author: string
  text: string
  fromUser?: boolean
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      author: 'Поддержка FinPair',
      text: 'Здравствуйте! Чем мы можем вам помочь сегодня? 😊'
    }
  ])
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const faq = data?.faq ?? []
  const contacts = data?.contacts
  const telegramRaw = (contacts?.telegram ?? '@finpair_support').trim()
  const telegramHandle = telegramRaw.replace(/^@/, '')
  const telegramHref = `https://t.me/${telegramHandle}`

  const onSendMessage = async () => {
    const trimmed = message.trim()
    if (!trimmed) {
      setSendError('Введите сообщение перед отправкой')
      return
    }

    setIsSending(true)
    setSendError('')

    try {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        author: 'Вы',
        text: trimmed,
        fromUser: true
      }
      setChatMessages((items) => [...items, userMessage])

      const answer = await sendSupportChatMessageRequest({ message: trimmed })
      setChatMessages((items) => [
        ...items,
        {
          id: `bot-${Date.now()}`,
          author: 'Поддержка FinPair',
          text: answer.outputText
        }
      ])
      setMessage('')
    } catch {
      setSendError('Не удалось получить ответ чат-бота. Попробуйте ещё раз.')
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
              <p className="chat-head__hint">Бот отвечает на вопросы о FinPair</p>
            </div>
          </div>

          <div className="chat-thread" aria-live="polite">
            {chatMessages.map((item) => (
              <div
                className={'chat-msg' + (item.fromUser ? ' chat-msg--user' : '')}
                key={item.id}
              >
                <div className="chat-msg__avatar">{item.fromUser ? 'Вы' : 'F'}</div>
                <div>
                  <div className="chat-msg__name">{item.author}</div>
                  <div className="chat-msg__text">{item.text}</div>
                </div>
              </div>
            ))}
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
          {sendError && (
            <p className="auth-form__common-error" role="alert">
              {sendError}
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
