import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Input from '../../../shared/ui/Input'

export interface GoalCreateFormValues {
  title: string
  deadline: string
  collected: string
  target: string
  isMain: boolean
}

interface GoalCreateFormProps {
  onSubmitForm: (data: GoalCreateFormValues) => void
  onCancel: () => void
}

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsed = new Date(year, month - 1, day)

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null
  }

  return parsed
}

function countMonthlyDeposits(today: Date, deadline: Date): number {
  if (deadline <= today) return 1

  let months =
    (deadline.getFullYear() - today.getFullYear()) * 12 +
    deadline.getMonth() -
    today.getMonth()

  if (deadline.getDate() > today.getDate()) {
    months += 1
  }

  return Math.max(1, months)
}

function calculateMonthlyContribution(
  target: string,
  collected: string,
  deadline: string,
  today: string
): string {
  const targetValue = Number(target)
  const collectedValue = Number(collected)
  const deadlineDate = parseDateOnly(deadline)
  const todayDate = parseDateOnly(today)

  if (
    !deadlineDate ||
    !todayDate ||
    !Number.isFinite(targetValue) ||
    !Number.isFinite(collectedValue) ||
    targetValue <= 0 ||
    collectedValue < 0 ||
    collectedValue > targetValue
  ) {
    return ''
  }

  const remaining = Math.max(0, targetValue - collectedValue)
  if (remaining <= 0) return '0'

  const months = countMonthlyDeposits(todayDate, deadlineDate)
  return String(Math.ceil((remaining / months) * 100) / 100)
}

export default function GoalCreateForm({
  onSubmitForm,
  onCancel
}: GoalCreateFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<GoalCreateFormValues>({
    defaultValues: {
      title: '',
      deadline: '',
      collected: '0',
      target: '',
      isMain: false
    }
  })
  const target = watch('target')
  const collected = watch('collected')
  const deadline = watch('deadline')
  const monthlyPreview = useMemo(
    () => calculateMonthlyContribution(target, collected, deadline, today),
    [collected, deadline, target, today]
  )

  const submitHandler = (data: GoalCreateFormValues) => {
    const collected = Number(data.collected)
    const target = Number(data.target)

    if (!Number.isNaN(collected) && !Number.isNaN(target) && collected > target) {
      setError('collected', {
        type: 'validate',
        message: 'Накоплено не может быть больше цели'
      })
      return
    }

    clearErrors('collected')
    onSubmitForm({
      ...data,
      isMain: Boolean(data.isMain)
    })
    reset({
      title: '',
      deadline: '',
      collected: '0',
      target: '',
      isMain: false
    })
  }

  return (
    <Card title="Новая цель">
      <form className="goal-create" onSubmit={handleSubmit(submitHandler)}>
        <div className="goal-create__grid">
          <div>
            <Controller
              name="title"
              control={control}
              rules={{
                required: 'Введите название цели'
              }}
              render={({ field }) => (
                <Input
                  id="goal-title"
                  label="Название цели"
                  placeholder="Например, Новый ноутбук"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.title && (
              <p className="goal-create__error">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="deadline"
              control={control}
              rules={{
                required: 'Укажите срок',
                validate: (value) =>
                  value >= today || 'Дата цели должна быть сегодня или позже'
              }}
              render={({ field }) => (
                <Input
                  id="goal-deadline"
                  label="Срок"
                  type="date"
                  min={today}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.deadline && (
              <p className="goal-create__error">{errors.deadline.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="collected"
              control={control}
              rules={{
                required: 'Введите накопленную сумму',
                validate: (value) => {
                  const num = Number(value)

                  if (value.trim() === '') {
                    return 'Введите накопленную сумму'
                  }

                  if (Number.isNaN(num)) {
                    return 'Введите число'
                  }

                  if (num < 0) {
                    return 'Сумма не может быть отрицательной'
                  }

                  return true
                }
              }}
              render={({ field }) => (
                <Input
                  id="goal-collected"
                  label="Уже накоплено"
                  type="number"
                  placeholder="0"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
            {errors.collected && (
              <p className="goal-create__error">{errors.collected.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="target"
              control={control}
              rules={{
                required: 'Введите целевую сумму',
                validate: (value) => {
                  const num = Number(value)

                  if (value.trim() === '') {
                    return 'Введите целевую сумму'
                  }

                  if (Number.isNaN(num)) {
                    return 'Введите число'
                  }

                  if (num <= 0) {
                    return 'Целевая сумма должна быть больше 0'
                  }

                  return true
                }
              }}
              render={({ field }) => (
                <Input
                  id="goal-target"
                  label="Цель"
                  type="number"
                  placeholder="100000"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
            {errors.target && (
              <p className="goal-create__error">{errors.target.message}</p>
            )}
          </div>

          <Input
            id="goal-monthly"
            label="Откладывать в месяц"
            type="number"
            placeholder="Автоматически"
            value={monthlyPreview}
            readOnly
          />
        </div>

        <Controller
          name="isMain"
          control={control}
          render={({ field }) => (
            <label className="goal-create__checkbox">
              <input
                type="checkbox"
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <span>Сделать главной</span>
            </label>
          )}
        />

        <div className="goal-create__actions">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Сохранение...' : 'Сохранить цель'}
          </Button>
          <Button type="button" onClick={onCancel}>
            Отмена
          </Button>
        </div>
      </form>
    </Card>
  )
}
