import { Controller, useForm, useWatch } from 'react-hook-form'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Input from '../../../shared/ui/Input'
import {
  PAYER_ALEXEY,
  PAYER_MARIA,
  type PartnerLabel
} from '../../../shared/lib/mocks'

type TransactionType = 'income' | 'expense'

export interface TransactionForm {
  category: string
  amount: string
  payer: PartnerLabel
  type: TransactionType
  date: string
}

const CATEGORY_OPTIONS: Record<TransactionType, string[]> = {
  expense: [
    'Продукты',
    'Кафе и рестораны',
    'Транспорт',
    'Такси',
    'Жильё',
    'Коммунальные услуги',
    'Интернет',
    'Здоровье',
    'Красота',
    'Одежда',
    'Образование',
    'Подписки',
    'Прочее'
  ],
  income: [
    'Зарплата',
    'Подарок',
    'Возврат',
    'Инвестиции',
    'Аренда',
    'Продажа',
    'Перевод',
    'Подписки',
    'Прочее'
  ]
}

function ensureSelectOpensDown(target: HTMLSelectElement) {
  const MIN_SPACE_BELOW_PX = 280
  const rect = target.getBoundingClientRect()
  const availableBelow = window.innerHeight - rect.bottom

  if (availableBelow >= MIN_SPACE_BELOW_PX) {
    return
  }

  const missingSpace = MIN_SPACE_BELOW_PX - availableBelow
  window.scrollBy({
    top: missingSpace + 12,
    behavior: 'smooth'
  })
}

interface AddTransactionFormProps {
  onSubmit: (data: TransactionForm) => void
  onCancel: () => void
}

export default function AddTransactionForm({
  onSubmit,
  onCancel
}: AddTransactionFormProps) {
  const minDate = '2020-01-01'
  const today = new Date().toISOString().split('T')[0]

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isSubmitted }
  } = useForm<TransactionForm>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      category: '',
      amount: '',
      payer: PAYER_ALEXEY,
      type: 'expense',
      date: ''
    }
  })

  const selectedType = useWatch({
    control,
    name: 'type',
    defaultValue: 'expense'
  })

  const currentCategories = CATEGORY_OPTIONS[selectedType]

  const submitHandler = (data: TransactionForm) => {
    const normalizedData: TransactionForm = {
      ...data,
      category: data.category.trim(),
      amount: data.amount.trim()
    }

    onSubmit(normalizedData)
    reset()
  }

  return (
    <Card title="Добавить транзакцию">
      <form
        className="transactions-form"
        onSubmit={handleSubmit(submitHandler)}
        noValidate
      >
        <div className="transactions-form__row">
          <div className="transactions-form__field">
            <label className="transactions-form__label" htmlFor="type">
              Тип
            </label>
            <Controller
              name="type"
              control={control}
              rules={{ required: 'Выберите тип операции' }}
              render={({ field }) => (
                <select
                  id="type"
                  className={`transactions-form__select ${
                    isSubmitted && errors.type
                      ? 'transactions-form__select--error'
                      : ''
                  }`}
                  value={field.value}
                  onChange={(event) => {
                    const nextType = event.target.value as TransactionType
                    field.onChange(nextType)
                    setValue('category', '')
                  }}
                  aria-invalid={isSubmitted && errors.type ? 'true' : 'false'}
                >
                  <option value="expense">Расход</option>
                  <option value="income">Доход</option>
                </select>
              )}
            />
            {isSubmitted && errors.type && (
              <p className="transactions-form__error">{errors.type.message}</p>
            )}
          </div>

          <div className="transactions-form__field">
            <label className="transactions-form__label" htmlFor="payer">
              Плательщик
            </label>
            <Controller
              name="payer"
              control={control}
              rules={{ required: 'Выберите плательщика' }}
              render={({ field }) => (
                <select
                  id="payer"
                  className={`transactions-form__select ${
                    isSubmitted && errors.payer
                      ? 'transactions-form__select--error'
                      : ''
                  }`}
                  {...field}
                  aria-invalid={isSubmitted && errors.payer ? 'true' : 'false'}
                >
                  <option value={PAYER_ALEXEY}>{PAYER_ALEXEY}</option>
                  <option value={PAYER_MARIA}>{PAYER_MARIA}</option>
                </select>
              )}
            />
            {isSubmitted && errors.payer && (
              <p className="transactions-form__error">{errors.payer.message}</p>
            )}
          </div>
        </div>

        <div className="transactions-form__row">
          <div className="transactions-form__field">
            <label className="transactions-form__label" htmlFor="category">
              Категория
            </label>
            <Controller
              name="category"
              control={control}
              rules={{
                required: 'Выберите категорию'
              }}
              render={({ field }) => (
                <select
                  id="category"
                  className={`transactions-form__select ${
                    isSubmitted && errors.category
                      ? 'transactions-form__select--error'
                      : ''
                  }`}
                  {...field}
                  aria-invalid={
                    isSubmitted && errors.category ? 'true' : 'false'
                  }
                  onMouseDown={(event) => {
                    ensureSelectOpensDown(event.currentTarget)
                  }}
                  onFocus={(event) => {
                    ensureSelectOpensDown(event.currentTarget)
                  }}
                >
                  <option value="">Выберите категорию</option>
                  {currentCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              )}
            />
            {isSubmitted && errors.category && (
              <p className="transactions-form__error">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="transactions-form__field">
            <Controller
              name="amount"
              control={control}
              rules={{
                required: 'Введите сумму',
                validate: (value) => {
                  const normalized = value.replace(',', '.').trim()

                  if (!normalized) return 'Введите сумму'

                  const amount = Number(normalized)

                  if (Number.isNaN(amount)) return 'Введите корректное число'
                  if (amount <= 0) return 'Сумма должна быть больше 0'

                  return true
                }
              }}
              render={({ field }) => (
                <Input
                  id="amount"
                  label="Сумма"
                  type="number"
                  placeholder="Например: 2500"
                  min="0"
                  step="0.01"
                  aria-invalid={isSubmitted && errors.amount ? 'true' : 'false'}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {isSubmitted && errors.amount && (
              <p className="transactions-form__error">{errors.amount.message}</p>
            )}
          </div>
        </div>

        <div className="transactions-form__field">
          <Controller
            name="date"
            control={control}
            rules={{
              required: 'Выберите дату',
              validate: {
                minDate: (value) =>
                  value >= minDate || `Дата не может быть раньше ${minDate}`,
                maxDate: (value) =>
                  value <= today || 'Дата не может быть в будущем'
              }
            }}
            render={({ field }) => (
              <Input
                id="date"
                label="Дата"
                type="date"
                min={minDate}
                max={today}
                aria-invalid={isSubmitted && errors.date ? 'true' : 'false'}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {isSubmitted && errors.date && (
            <p className="transactions-form__error">{errors.date.message}</p>
          )}
        </div>

        <div className="transactions-form__actions">
          <Button type="button" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Сохранить транзакцию
          </Button>
        </div>
      </form>
    </Card>
  )
}