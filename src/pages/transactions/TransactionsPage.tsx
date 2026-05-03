import { useEffect, useMemo, useState } from 'react'
import Card from '../../shared/ui/Card'
import Button from '../../shared/ui/Button'
import AsyncDataView from '../../shared/ui/AsyncDataView'
import {
  IconSearch,
  IconFilter,
  IconPlus,
  IconChevronLeft,
  IconChevronRight
} from '../../shared/ui/icons'
import {
  formatMoney,
  formatMoneyPlain,
  PAYER_ALEXEY,
  PAYER_MARIA,
  type PartnerLabel
} from '../../shared/lib/mocks'
import {
  clearCreateTransactionError,
  createTransaction,
  fetchTransactions,
  useAppDispatch,
  useAppSelector
} from '../../app/store'
import AddTransactionForm, {
  type TransactionForm
} from './components/AddTransactionForm'
import SimpleSelect, {
  type SimpleSelectOption
} from '../../shared/ui/SimpleSelect'
import './transactions.css'

type TypeFilter = 'all' | 'income' | 'expense'
type PayerFilter = 'all' | PartnerLabel

const TYPE_FILTER_OPTIONS: SimpleSelectOption<TypeFilter>[] = [
  { value: 'all', label: 'Все' },
  { value: 'income', label: 'Доходы' },
  { value: 'expense', label: 'Расходы' }
]

const PAYER_FILTER_OPTIONS: SimpleSelectOption<PayerFilter>[] = [
  { value: 'all', label: 'Все плательщики' },
  { value: PAYER_ALEXEY, label: PAYER_ALEXEY },
  { value: PAYER_MARIA, label: PAYER_MARIA }
]

function CloseIcon({
  width = 20,
  height = 20
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

export default function TransactionsPage() {
  const dispatch = useAppDispatch()
  const { items, summary, status, error, addError } = useAppSelector(
    (s) => s.transactions
  )
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [payer, setPayer] = useState<PayerFilter>('all')
  const [page, setPage] = useState(1)
  const [isAddOpen, setIsAddOpen] = useState(false)

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchTransactions())
    }
  }, [dispatch, status])

  const filtered = useMemo(() => {
    return items.filter((t) => {
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
  }, [items, search, type, payer])

  const { income, expense, balance, balanceChangePercent, period } = summary

  const handleAddTransaction = async (data: TransactionForm) => {
    dispatch(clearCreateTransactionError())
    const result = await dispatch(createTransaction(data))
    if (createTransaction.fulfilled.match(result)) {
      setPage(1)
      setIsAddOpen(false)
    }
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
          {isAddOpen ? <CloseIcon /> : <IconPlus />}

          <span style={{ marginLeft: 6 }}>
            {isAddOpen ? 'Скрыть форму' : 'Добавить'}
          </span>
        </Button>
      </div>

      {addError && <p className="auth-form__common-error">{addError}</p>}

      {isAddOpen && (
        <AddTransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setIsAddOpen(false)}
        />
      )}

      <div className="transactions__filters">
        <div className="filter-input">
          <IconSearch className="filter-input__icon" aria-hidden />
          <input
            type="text"
            placeholder="Поиск транзакций..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input__control"
          />
        </div>

        <div className="filter-input">
          <IconFilter className="filter-input__icon" aria-hidden />
          <SimpleSelect<TypeFilter>
            className="filter-input__control"
            value={type}
            onChange={setType}
            options={TYPE_FILTER_OPTIONS}
            aria-label="Тип операции"
          />
        </div>

        <div className="filter-input">
          <SimpleSelect<PayerFilter>
            className="filter-input__control"
            value={payer}
            onChange={setPayer}
            options={PAYER_FILTER_OPTIONS}
            aria-label="Плательщик"
          />
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

      <AsyncDataView
        status={
          status === 'loading'
            ? 'loading'
            : status === 'failed'
              ? 'error'
              : 'success'
        }
        error={error}
        onRetry={() => void dispatch(fetchTransactions())}
        loadingLabel="Загружаем транзакции…"
      >
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
      </AsyncDataView>
    </div>
  )
}