import { render, screen } from '@testing-library/react'
import Button from '../../src/shared/ui/Button/Button'

describe('Button', () => {
  it('рендерит текст кнопки', () => {
    render(<Button>Сохранить</Button>)
    expect(
      screen.getByRole('button', { name: 'Сохранить' })
    ).toBeInTheDocument()
  })

  it('применяет secondary и fullWidth классы', () => {
    render(
      <Button variant="secondary" fullWidth>
        Вторичная
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Вторичная' })
    expect(button).toHaveClass('btn', 'btn--secondary', 'btn--full')
  })
})
