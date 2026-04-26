import { Controller, useForm } from 'react-hook-form'
import Card from '../../../shared/ui/Card'
import Button from '../../../shared/ui/Button'
import Input from '../../../shared/ui/Input'

export interface GoalCreateFormValues {
  title: string
  deadline: string
  collected: string
  target: string
  monthly: string
  isMain: boolean
}

interface GoalCreateFormProps {
  onSubmitForm: (data: GoalCreateFormValues) => void
  onCancel: () => void
}

export default function GoalCreateForm({
  onSubmitForm,
  onCancel
}: GoalCreateFormProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<GoalCreateFormValues>({
    defaultValues: {
      title: '',
      deadline: '',
      collected: '',
      target: '',
      monthly: '',
      isMain: false
    }
  })

  const submitHandler = (data: GoalCreateFormValues) => {
    const collected = Number(data.collected)
    const target = Number(data.target)

    if (!Number.isNaN(collected) && !Number.isNaN(target) && collected > target) {
      return
    }

    onSubmitForm(data)
    reset()
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
                required: 'Укажите срок'
              }}
              render={({ field }) => (
                <Input
                  id="goal-deadline"
                  label="Срок"
                  placeholder="Например, Декабрь 2026"
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

          <div>
            <Controller
              name="monthly"
              control={control}
              rules={{
                required: 'Введите ежемесячный платёж',
                validate: (value) => {
                  const num = Number(value)

                  if (value.trim() === '') {
                    return 'Введите ежемесячный платёж'
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
                  id="goal-monthly"
                  label="Откладывать в месяц"
                  type="number"
                  placeholder="5000"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
            {errors.monthly && (
              <p className="goal-create__error">{errors.monthly.message}</p>
            )}
          </div>
        </div>

        <label className="goal-create__checkbox">
          <input type="checkbox" {...register('isMain')} />
          <span>Сделать главной целью</span>
        </label>

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