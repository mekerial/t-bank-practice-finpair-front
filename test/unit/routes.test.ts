import { NAV_ITEMS, ROUTES } from '../../src/shared/config/routes'

describe('routes config', () => {
  it('содержит ключевые маршруты приложения', () => {
    expect(ROUTES.LOGIN).toBe('/login')
    expect(ROUTES.REGISTER).toBe('/register')
    expect(ROUTES.DASHBOARD).toBe('/')
    expect(ROUTES.NOT_FOUND).toBe('*')
  })

  it('навигация содержит все основные страницы без дублей path', () => {
    expect(NAV_ITEMS.length).toBe(6)

    const paths = NAV_ITEMS.map((item) => item.path)
    const uniquePaths = new Set(paths)

    expect(uniquePaths.size).toBe(paths.length)
    expect(paths).toEqual([
      ROUTES.DASHBOARD,
      ROUTES.TRANSACTIONS,
      ROUTES.ANALYTICS,
      ROUTES.GOALS,
      ROUTES.SETTINGS,
      ROUTES.SUPPORT
    ])
  })
})
