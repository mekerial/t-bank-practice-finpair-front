import { useEffect, useState } from 'react'

const QUERY = '(max-width: 1023px)'

/** Узкий экран: компактные графики без боковых подписей оси Y. */
export function useCompactCharts(): boolean {
  const [compact, setCompact] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const sync = () => setCompact(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return compact
}
