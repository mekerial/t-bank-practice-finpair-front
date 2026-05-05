import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import {
  THEME_STORAGE_KEY,
  type ThemeMode
} from '../../shared/constants/theme'

function readStoredTheme(): ThemeMode | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    /* ignore */
  }
  return null
}

function getPreferredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = readStoredTheme()
  if (stored) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyThemeToDocument(theme: ThemeMode) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.dataset.theme = 'dark'
  } else {
    delete root.dataset.theme
  }
}

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => getPreferredTheme())
  /** Сохраняем в localStorage только после явного выбора в UI (или при старте с уже сохранённой темой). */
  const persistThemeRef = useRef(!!readStoredTheme())

  useEffect(() => {
    applyThemeToDocument(theme)
    if (!persistThemeRef.current) return
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (readStoredTheme() !== null) return
      setThemeState(mq.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const setTheme = useCallback((next: ThemeMode) => {
    persistThemeRef.current = true
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    persistThemeRef.current = true
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme должен вызываться внутри ThemeProvider')
  }
  return ctx
}
