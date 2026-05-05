import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import authReducer from '../../src/app/store/slices/authSlice'
import transactionsReducer from '../../src/app/store/slices/transactionsSlice'
import goalsReducer from '../../src/app/store/slices/goalsSlice'
import LoginPage from '../../src/pages/auth/LoginPage'
import type { AuthUser, RootState } from '../../src/app/store'

function createStore(user: AuthUser | null) {
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

describe('LoginPage', () => {
  it('редиректит на dashboard, если пользователь уже авторизован', () => {
    const user: AuthUser = {
      id: '2d8f14f5-29a9-4f82-a64b-9e861f159957',
      email: 'user@example.com',
      emailVerified: true,
      hasPartner: true
    }
    const store = createStore(user)

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<div>Dashboard Screen</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )
    expect(screen.getByText('Dashboard Screen')).toBeInTheDocument()
  })
})
