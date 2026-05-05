import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import authReducer from '../../src/app/store/slices/authSlice'
import transactionsReducer from '../../src/app/store/slices/transactionsSlice'
import goalsReducer from '../../src/app/store/slices/goalsSlice'
import AppRouter from '../../src/app/router/AppRouter'
import { ThemeProvider } from '../../src/app/providers/ThemeProvider'
import type { AuthUser, RootState } from '../../src/app/store'

function createStoreWithAuth(user: AuthUser | null) {
  const preloadedState: RootState = {
    auth: { user, accessToken: user ? 'token' : null, restoreStatus: 'done' },
    transactions: {
      items: [],
      summary: { income: 0, expense: 0, balance: 0, balanceChangePercent: 0, period: '' },
      status: 'idle',
      error: null,
      addStatus: 'idle',
      addError: null
    },
    goals: {
      items: [],
      status: 'idle',
      error: null,
      createStatus: 'idle',
      createError: null
    }
  }
  return configureStore({
    reducer: { auth: authReducer, transactions: transactionsReducer, goals: goalsReducer },
    preloadedState
  })
}

describe('AppRouter critical routes', () => {
  it('открывает страницу логина для гостя', () => {
    const store = createStoreWithAuth(null)
    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter initialEntries={['/login']}>
            <AppRouter />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    )
    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument()
  })

  it('редиректит неизвестный путь на 404', () => {
    const store = createStoreWithAuth(null)
    render(
      <Provider store={store}>
        <ThemeProvider>
          <MemoryRouter initialEntries={['/unknown']}>
            <AppRouter />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    )
    expect(screen.getByText('Страница не найдена')).toBeInTheDocument()
  })
})
