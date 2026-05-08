import reducer, {
  clearCreateTransactionError,
  createTransaction,
  fetchTransactions,
  type Transaction
} from '../../src/app/store/slices/transactionsSlice'

describe('transactionsSlice reducer', () => {
  const incomeTx: Transaction = {
    id: 'tx-1',
    category: 'salary',
    date: '1 янв. 2026',
    payer: '',
    amount: 100000
  }
  const expenseTx: Transaction = {
    id: 'tx-2',
    category: 'products',
    date: '2 янв. 2026',
    payer: '',
    amount: -10000
  }

  it('добавляет транзакцию первой и пересчитывает summary', () => {
    const base = reducer(
      undefined,
      fetchTransactions.fulfilled(
        {
          items: [incomeTx],
          summary: {
            income: 100000,
            expense: 0,
            balance: 100000,
            balanceChangePercent: 0,
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
