import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
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
  formatMoneyPlain
} from '../../shared/lib/financeView'
import {
  clearCreateTransactionError,
  createTransaction,
  fetchTransactions,
  useAppDispatch,
  useAppSelector
} from '../../app/store'
import AddTransactionForm, {
  type CategoryOption,
  type PayerOption,
  type TransactionForm
} from './components/AddTransactionForm'
import SimpleSelect, {
  type SimpleSelectOption
} from '../../shared/ui/SimpleSelect'
import './transactions.css'
import { useAsyncData } from '../../shared/hooks/useAsyncData'
import { fetchCoupleRequest } from '../../shared/api/settingsApi'
import type { CoupleDetails } from '../../shared/api/settingsApi'
import { fetchCategoriesRequest } from '../../shared/api/transactionsApi'
import { toRussianCategoryName } from '../../shared/lib/categoryLocalization'
import { isValidHouseholdId } from '../../shared/lib/householdId'

type TypeFilter = 'all' | 'income' | 'expense'
type PayerFilter = 'all' | string
const PAGE_SIZE = 8

const TYPE_FILTER_OPTIONS: SimpleSelectOption<TypeFilter>[] = [
  { value: 'all', label: 'Все' },
  { value: 'income', label: 'Доходы' },
  { value: 'expense', label: 'Расходы' }
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
  const emptyCouple: CoupleDetails = {
    id: '',
    inviteCode: '',
    currency: 'RUB',
    splitType: 'equal',
    notifications: {},
    members: [],
    users: []
  }
  const { data: coupleData } = useAsyncData(
    'transactions-couple',
    async () => {
      try {
        return await fetchCoupleRequest()
      } catch (e) {
        if (axios.isAxiosError(e) && e.response?.status === 404) return emptyCouple
        throw e
      }
    }
  )
  const memberNameById = useMemo(() => {
    const members = coupleData?.members ?? coupleData?.users ?? []
    const map = new Map<string, string>()
    members.forEach((m) => map.set(m.userId, m.name))
    return map
  }, [coupleData])
  const payerOptions = useMemo<SimpleSelectOption<PayerFilter>[]>(() => {
    const members = coupleData?.members ?? coupleData?.users ?? []
    const dynamic = members.map((m) => ({ value: m.name as PayerFilter, label: m.name }))
    return [{ value: 'all', label: 'Все плательщики' }, ...dynamic]
  }, [coupleData])
  const addPayerOptions = useMemo<PayerOption[]>(() => {
    const members = coupleData?.members ?? coupleData?.users ?? []
    return members.map((m) => ({ userId: m.userId, label: m.name }))
  }, [coupleData])
  const { data: categoriesData } = useAsyncData('tx-categories', async () => {
    const [income, expense] = await Promise.all([
      fetchCategoriesRequest({ type: 'income' }),
      fetchCategoriesRequest({ type: 'expense' })
    ])
    return [...income, ...expense].map((category) => ({
      ...category,
      name: toRussianCategoryName(category.name)
    })) as CategoryOption[]
  })

  const txHouseholdId = coupleData?.id
  useEffect(() => {
    if (status === 'idle' && isValidHouseholdId(txHouseholdId)) {
      void dispatch(fetchTransactions())
    }
  }, [dispatch, status, txHouseholdId])

  useEffect(() => {
    if (isValidHouseholdId(txHouseholdId)) {
      void dispatch(fetchTransactions())
    }
  }, [dispatch, txHouseholdId])

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
      const resolvedPayer = t.userId
        ? (memberNameById.get(t.userId) ?? t.payer)
        : t.payer
      if (payer !== 'all' && resolvedPayer !== payer) return false

      return true
    })
  }, [items, search, type, payer, memberNameById])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pagedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  useEffect(() => {
    setPage(1)
  }, [search, type, payer])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const { income, expense, balance, balanceChangePercent, period } = summary
  const handleAddTransaction = async (data: TransactionForm) => {
    dispatch(clearCreateTransactionError())
    const selectedCategory = (categoriesData ?? []).find(
      (c) => c.id === data.categoryId
    )
    const householdIdRaw = coupleData?.id ?? ''
    const householdId = isValidHouseholdId(householdIdRaw) ? householdIdRaw : ''
    const payerUserId = data.payerUserId
    if (!selectedCategory || !householdId || !payerUserId) {
      return
    }
    const result = await dispatch(
      createTransaction({
        category: selectedCategory.name,
        categoryId: selectedCategory.id,
        householdId,
        payerUserId,
        amount: data.amount,
        type: data.type,
        date: data.date
      })
    )
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
          payerOptions={addPayerOptions}
          categoryOptions={categoriesData ?? []}
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
            options={payerOptions}
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
            {pagedItems.map((t) => {
              const isIncome = t.amount > 0
              const initials = t.category.slice(0, 2)
              const payerName = t.userId
                ? (memberNameById.get(t.userId) ?? t.payer)
                : t.payer

              return (
                <div key={t.id} className="tx-row">
                  <div className="tx-row__avatar">{initials}</div>

                  <div className="tx-row__main">
                    <div className="tx-row__top">
                      <span className="tx-row__category">{t.category}</span>
                      <span className="chip chip--partner">{payerName}</span>
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

            {pagedItems.length === 0 && (
              <div className="tx-list__empty">Ничего не найдено</div>
            )}
          </div>

          <div className="pagination">
            <button
              type="button"
              className="pagination__btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <IconChevronLeft width={14} height={14} />
              Предыдущие
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
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