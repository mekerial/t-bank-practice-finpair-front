import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import reducer, {
  calcSummary,
  clearCreateTransactionError,
  createTransaction,
  fetchTransactions,
  type Transaction
} from '../../src/app/store/slices/transactionsSlice'

describe('calcSummary', () => {
  it('считает доходы/расходы/баланс только за текущий месяц', () => {
    const ref = new Date('2026-02-10T12:00:00')
    const jan: Transaction = {
      id: '1',
      category: 'x',
      date: '',
      dateSortKey: new Date('2026-01-15').getTime(),
      payer: '',
      amount: 100000
    }
    const feb: Transaction = {
      id: '2',
      category: 'x',
      date: '',
      dateSortKey: new Date('2026-02-05').getTime(),
      payer: '',
      amount: 40000
    }
    const s = calcSummary([jan, feb], ref)
    expect(s.income).toBe(40000)
    expect(s.expense).toBe(0)
    expect(s.balance).toBe(40000)
    expect(s.period).toMatch(/феврал/i)
  })

  it('процент: рост чистого потока к прошлому месяцу', () => {
    const ref = new Date('2026-02-10T12:00:00')
    const jan: Transaction = {
      id: '1',
      category: 'x',
      date: '',
      dateSortKey: new Date('2026-01-20').getTime(),
      payer: '',
      amount: 50000
    }
    const feb: Transaction = {
      id: '2',
      category: 'x',
      date: '',
      dateSortKey: new Date('2026-02-05').getTime(),
      payer: '',
      amount: 80000
    }
    expect(calcSummary([jan, feb], ref).balanceChangePercent).toBe(60)
  })

  it('процент: null, если в прошлом месяце не было движения', () => {
    const ref = new Date('2026-02-10T12:00:00')
    const feb: Transaction = {
      id: '1',
      category: 'x',
      date: '',
      dateSortKey: new Date('2026-02-05').getTime(),
      payer: '',
      amount: 10000
    }
    expect(calcSummary([feb], ref).balanceChangePercent).toBeNull()
    expect(calcSummary([feb], ref).balanceChangeSkipReason).toBe('no_previous_flow')
  })

  it('процент: не показываем при экстремальном росте (|×| к прошлому месяцу выше потолка)', () => {
    const ref = new Date('2026-02-15T12:00:00')
    const jan: Transaction = {
      id: '1',
      category: 'x',
      date: '',
      dateSortKey: new Date('2026-01-10').getTime(),
      payer: '',
      amount: 50_000
    }
    const feb: Transaction = {
      id: '2',
      category: 'x',
      date: '',
      dateSortKey: new Date('2026-02-05').getTime(),
      payer: '',
      amount: 200_000
    }
    const s = calcSummary([jan, feb], ref)
    expect(s.balance).toBe(200000)
    expect(s.balanceChangePercent).toBeNull()
    expect(s.balanceChangeSkipReason).toBe('not_comparable')
  })

  it('процент: 0%, если оба месяца с нулевым чистым потоком', () => {
    const ref = new Date('2026-02-10T12:00:00')
    const janIn: Transaction = {
      id: '1',
      category: 'x',
      date: '',
      dateSortKey: new Date('2026-01-10').getTime(),
      payer: '',
      amount: 10000
    }
    const janOut: Transaction = {
      id: '2',
      category: 'x',
      date: '',
      dateSortKey: new Date('2026-01-11').getTime(),
      payer: '',
      amount: -10000
    }
    expect(calcSummary([janIn, janOut], ref).balanceChangePercent).toBe(0)
  })
})

describe('transactionsSlice reducer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })
  const incomeTx: Transaction = {
    id: 'tx-1',
    category: 'salary',
    date: '1 янв. 2026',
    dateSortKey: new Date('2026-01-01').getTime(),
    payer: '',
    amount: 100000
  }
  const expenseTx: Transaction = {
    id: 'tx-2',
    category: 'products',
    date: '2 янв. 2026',
    dateSortKey: new Date('2026-01-02').getTime(),
    payer: '',
    amount: -10000
  }

  it('добавляет транзакцию, сортирует по дате (новее выше) и пересчитывает summary', () => {
    const base = reducer(
      undefined,
      fetchTransactions.fulfilled(
        {
          items: [incomeTx],
          summary: {
            income: 100000,
            expense: 0,
            balance: 100000,
            balanceChangePercent: null,
            period: 'январь'
          }
        },
        'req',
        undefined
      )
    )

    const next = reducer(
      base,
      createTransaction.fulfilled(expenseTx, 'req', {
        category: 'products',
        categoryId: '11111111-1111-1111-1111-111111111111',
        householdId: '22222222-2222-2222-2222-222222222222',
        payerUserId: '33333333-3333-3333-3333-333333333333',
        amount: '10000',
        type: 'expense',
        date: '2026-01-02'
      })
    )

    expect(next.items[0].id).toBe('tx-2')
    expect(next.summary.balance).toBe(90000)
    expect(next.summary.balanceChangePercent).toBeNull()
  })

  it('при добавлении более старой даты вставляет её ниже в списке', () => {
    const newer: Transaction = {
      id: 'tx-new',
      category: 'зарплата',
      date: '10 янв. 2026',
      dateSortKey: new Date('2026-01-10').getTime(),
      payer: '',
      amount: 50000
    }
    const base = reducer(
      undefined,
      fetchTransactions.fulfilled(
        {
          items: [newer],
          summary: {
            income: 50000,
            expense: 0,
            balance: 50000,
            balanceChangePercent: null,
            period: 'январь'
          }
        },
        'req',
        undefined
      )
    )

    const older: Transaction = {
      id: 'tx-old',
      category: 'продукты',
      date: '3 янв. 2026',
      dateSortKey: new Date('2026-01-03').getTime(),
      payer: '',
      amount: -5000
    }

    const next = reducer(
      base,
      createTransaction.fulfilled(older, 'req', {
        category: 'products',
        categoryId: '11111111-1111-1111-1111-111111111111',
        householdId: '22222222-2222-2222-2222-222222222222',
        payerUserId: '33333333-3333-3333-3333-333333333333',
        amount: '5000',
        type: 'expense',
        date: '2026-01-03'
      })
    )

    expect(next.items.map((t) => t.id)).toEqual(['tx-new', 'tx-old'])
  })

  it('очищает addError', () => {
    const failed = reducer(
      undefined,
      createTransaction.rejected(
        new Error('fail'),
        'req',
        {
          category: 'x',
          categoryId: '11111111-1111-1111-1111-111111111111',
          householdId: '22222222-2222-2222-2222-222222222222',
          payerUserId: '33333333-3333-3333-3333-333333333333',
          amount: 'abc',
          type: 'expense',
          date: '2026-01-02'
        },
        'Некорректная сумма'
      )
    )
    expect(reducer(failed, clearCreateTransactionError()).addError).toBeNull()
  })
})
