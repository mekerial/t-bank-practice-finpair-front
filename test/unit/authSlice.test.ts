import reducer, {
  loginUser,
  logout,
  logoutUser,
  tryRestoreSession
} from '../../src/app/store/slices/authSlice'

type AuthState = ReturnType<typeof reducer>

const testUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@example.com',
  emailVerified: true,
  hasPartner: false
}

describe('authSlice reducer', () => {
  it('возвращает initial state', () => {
    const state = reducer(undefined, { type: 'unknown' })
    expect(state).toEqual({
      user: null,
      accessToken: null,
      restoreStatus: 'idle'
    })
  })

  it('сохраняет пользователя и токен после loginUser.fulfilled', () => {
    const action = loginUser.fulfilled(
      { user: testUser, accessToken: 'token-1' },
      'request-id',
      { email: 'test@example.com', password: 'secret' }
    )
    const state = reducer(undefined, action)

    expect(state.user).toEqual(testUser)
    expect(state.accessToken).toBe('token-1')
  })

  it('ставит restoreStatus=done после tryRestoreSession.rejected', () => {
    const pendingState = reducer(
      undefined,
      tryRestoreSession.pending('request-id', undefined)
    )
    const nextState = reducer(
      pendingState as AuthState,
      tryRestoreSession.rejected(new Error('No session'), 'request-id', undefined)
    )
    expect(nextState.restoreStatus).toBe('done')
  })

  it('очищает state после logout', () => {
    const loggedIn = reducer(
      undefined,
      loginUser.fulfilled(
        { user: testUser, accessToken: 'token-2' },
        'request-id',
        { email: 'test@example.com', password: 'secret' }
      )
    )
    const nextState = reducer(loggedIn, logout())
    expect(nextState.user).toBeNull()
    expect(nextState.accessToken).toBeNull()
  })

  it('очищает state после logoutUser.fulfilled', () => {
    const loggedIn = reducer(
      undefined,
      loginUser.fulfilled(
        { user: testUser, accessToken: 'token-3' },
        'request-id',
        { email: 'test@example.com', password: 'secret' }
      )
    )
    const nextState = reducer(
      loggedIn,
      logoutUser.fulfilled(undefined, 'request-id', undefined)
    )
    expect(nextState.user).toBeNull()
    expect(nextState.accessToken).toBeNull()
  })
})
