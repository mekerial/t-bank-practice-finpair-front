import axios, { AxiosError } from 'axios'
import { getErrorMessage } from '../../src/shared/lib/asyncUtils'

describe('getErrorMessage', () => {
  it('собирает message и details из API-ошибки', () => {
    const error = new AxiosError('Request failed')
    error.response = {
      data: {
        error: {
          message: 'Невалидный запрос',
          details: {
            email: ['Некорректный email'],
            password: ['Слишком короткий пароль']
          }
        }
      }
    } as AxiosError['response']

    expect(getErrorMessage(error)).toBe(
      'Невалидный запрос Некорректный email Слишком короткий пароль'
    )
  })

  it('возвращает дефолтный текст для неизвестной ошибки', () => {
    expect(getErrorMessage({ foo: 'bar' })).toBe(
      'Произошла ошибка. Попробуйте ещё раз.'
    )
  })

  it('возвращает строку как есть', () => {
    expect(getErrorMessage('Ошибка сети')).toBe('Ошибка сети')
  })

  it('обрабатывает не-axios Error', () => {
    expect(getErrorMessage(new Error('Упало'))).toBe('Упало')
  })

  it('подтверждает, что объект является axios-ошибкой', () => {
    const error = new AxiosError('Axios failure')
    expect(axios.isAxiosError(error)).toBe(true)
  })
})
