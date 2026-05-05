import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import authReducer from '../../src/app/store/slices/authSlice'
import transactionsReducer from '../../src/app/store/slices/transactionsSlice'
import goalsReducer from '../../src/app/store/slices/goalsSlice'
import AuthGuard from '../../src/app/router/AuthGuard'
import type { RootState, AuthUser } from '../../src/app/store'

function renderWithState(path: string, authState: RootState['auth']) {
  const preloadedState: RootState = {
    auth: authState,
    transactions: {
      items: [],
      summary: {
        income: 0,
        expense: 0,
        balance: 0,
        balanceChangePercent: 0,
        period: ''
      },
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

  const store = configureStore({
    reducer: { auth: authReducer, transactions: transactionsReducer, goals: goalsReducer },
    preloadedState
  })

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<div>Login Screen</div>} />
          <Route element={<AuthGuard />}>
            <Route path="/" element={<div>Protected Screen</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

describe('AuthGuard', () => {
  it('редиректит гостя на login', () => {
    renderWithState('/', { user: null, accessToken: null, restoreStatus: 'done' })
    expect(screen.getByText('Login Screen')).toBeInTheDocument()
  })

  it('пускает авторизованного пользователя', () => {
    const user: AuthUser = {
      id: '8d25e131-9a65-4b0f-b8af-b4f4d0d0f221',
      email: 'user@example.com',
      emailVerified: true,
      hasPartner: true
    }
    renderWithState('/', { user, accessToken: 'token', restoreStatus: 'done' })
    expect(screen.getByText('Protected Screen')).toBeInTheDocument()
  })
})
