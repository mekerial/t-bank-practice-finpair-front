import { useMemo, useState } from 'react'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconChevronLeft,
  IconChevronRight
} from '../../shared/ui/icons'
import {
  mockTransactions,
  mockTransactionsSummary,
  formatMoney,
  formatMoneyPlain
} from '../../shared/lib/mocks'
import AddTransactionForm, {
  type TransactionForm
} from './components/AddTransactionForm'
import './transactions.css'

type TypeFilter = 'all' | 'income' | 'expense'
type PayerFilter = 'all' | 'Партнёр А' | 'Партнёр Б'

function CloseIcon({
  width = 16,
  height = 16
}: {
  width?: number
  height?: number
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function formatTransactionDate(value: string) {
  const date = new Date(value)

  const parts = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).formatToParts(date)

  const day = parts.find((part) => part.type === 'day')?.value ?? ''
  const month = (parts.find((part) => part.type === 'month')?.value ?? '').replace('.', '')
  const year = parts.find((part) => part.type === 'year')?.value ?? ''

  return `${day} ${month} ${year}`
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(mockTransactions)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [payer, setPayer] = useState<PayerFilter>('all')
  const [page, setPage] = useState(1)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (
        search &&
        !t.category.toLowerCase().includes(search.toLowerCase())
      ) {
        return false
      }

      if (type === 'income' && t.amount < 0) return false
      if (type === 'expense' && t.amount > 0) return false
      if (payer !== 'all' && t.payer !== payer) return false

      return true
    })
  }, [transactions, search, type, payer])

  const { income, expense, balance, balanceChangePercent, period } =
    mockTransactionsSummary

  const handleAddTransaction = (data: TransactionForm) => {
    const amountNumber = Number(data.amount.replace(',', '.').trim())

    const newTransaction = {
      id: Date.now(),
      category: data.category.trim(),
      payer: data.payer,
      date: formatTransactionDate(data.date),
      amount: data.type === 'income' ? amountNumber : -amountNumber
    }

    setTransactions((prev) => [newTransaction, ...prev])
    setPage(1)
    setIsAddOpen(false)
  }

  return (
    <div className="transactions">
      <div className="transactions__header">
        <h1 className="transactions__title">Транзакции</h1>

        <Button
          type="button"
          onClick={() => setIsAddOpen((prev) => !prev)}
          aria-expanded={isAddOpen}
          aria-label={
            isAddOpen ? 'Скрыть форму добавления' : 'Открыть форму добавления'
          }
        >
          {isAddOpen ? (
            <CloseIcon width={16} height={16} />
          ) : (
            <IconPlus width={16} height={16} />
          )}

          <span style={{ marginLeft: 6 }}>
            {isAddOpen ? 'Скрыть форму' : 'Добавить'}
          </span>
        </Button>
      </div>

      {isAddOpen && (
        <AddTransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setIsAddOpen(false)}
        />
      )}

      <div className="transactions__filters">
        <div className="filter-input">
          <IconSearch width={16} height={16} className="filter-input__icon" />
          <input
            type="text"
            placeholder="Поиск транзакций..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input__control"
          />
        </div>

        <div className="filter-input">
          <IconFilter width={16} height={16} className="filter-input__icon" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TypeFilter)}
            className="filter-input__control"
          >
            <option value="all">Все</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </select>
        </div>

        <div className="filter-input">
          <select
            value={payer}
            onChange={(e) => setPayer(e.target.value as PayerFilter)}
            className="filter-input__control"
          >
            <option value="all">Все плательщики</option>
            <option value="Партнёр А">Партнёр А</option>
            <option value="Партнёр Б">Партнёр Б</option>
          </select>
        </div>
      </div>

      <div className="transactions__summary">
        <div className="summary-card">
          <div className="summary-card__label">Доходы</div>
          <div className="summary-card__value summary-card__value--income">
            {formatMoney(income)}
          </div>
          <div className="summary-card__hint">за {period}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card__label">Расходы</div>
          <div className="summary-card__value summary-card__value--expense">
            -{formatMoneyPlain(expense)}
          </div>
          <div className="summary-card__hint">за {period}</div>
        </div>

        <div className="summary-card">
          <div className="summary-card__label">Баланс</div>
          <div className="summary-card__value">
            {formatMoneyPlain(balance)}
          </div>
          <div className="summary-card__hint summary-card__hint--accent">
            +{balanceChangePercent}% к прошлому месяцу
          </div>
        </div>
      </div>

      <Card title="История операций">
        <div className="tx-list">
          {filtered.map((t) => {
            const isIncome = t.amount > 0
            const initials = t.category.slice(0, 2)

            return (
              <div key={t.id} className="tx-row">
                <div className="tx-row__avatar">{initials}</div>

                <div className="tx-row__main">
                  <div className="tx-row__top">
                    <span className="tx-row__category">{t.category}</span>
                    <span className="chip chip--partner">{t.payer}</span>
                  </div>
                  <div className="tx-row__date">{t.date}</div>
                </div>

                <div
                  className={
                    'tx-row__amount ' +
                    (isIncome ? 'tx-row__amount--income' : '')
                  }
                >
                  {formatMoney(t.amount)}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="tx-list__empty">Ничего не найдено</div>
          )}
        </div>

        <div className="pagination">
          <button
            type="button"
            className="pagination__btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <IconChevronLeft width={14} height={14} />
            Предыдущие
          </button>

          {[1, 2, 3, 4].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setPage(n)}
              className={
                'pagination__page' +
                (page === n ? ' pagination__page--active' : '')
              }
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            className="pagination__btn"
            onClick={() => setPage((p) => Math.min(4, p + 1))}
          >
            Следующие
            <IconChevronRight width={14} height={14} />
          </button>
        </div>
      </Card>
    </div>
  )
}