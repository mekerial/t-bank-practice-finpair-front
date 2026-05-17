import { useCallback, useEffect, useRef, useState } from 'react'

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface UseAsyncDataResult<T> {
  data: T | undefined
  status: AsyncStatus
  error: unknown
  refetch: () => void
}

/**
 * Загружает данные при монтировании, при смене `cacheKey` и после refetch().
 * Повторная загрузка с тем же ключом (refetch) не уводит статус в полный лоадер —
 * форма остаётся на экране (stale-while-revalidate).
 */
export function useAsyncData<T>(
  cacheKey: string | number,
  fetcher: () => Promise<T>
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | undefined>(undefined)
  const [status, setStatus] = useState<AsyncStatus>('loading')
  const [error, setError] = useState<unknown>(undefined)
  const [retryCount, setRetryCount] = useState(0)
  const cacheKeyRef = useRef(cacheKey)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    let cancelled = false
    const keyChanged = cacheKeyRef.current !== cacheKey
    if (keyChanged) {
      cacheKeyRef.current = cacheKey
    }

    const run = async () => {
      setError(undefined)
      if (keyChanged) {
        setData(undefined)
        setStatus('loading')
      } else if (retryCount === 0) {
        setStatus('loading')
      } else {
        setStatus((s) => (s === 'error' ? 'loading' : s))
      }

      try {
        const result = await fetcherRef.current()
        if (!cancelled) {
          setData(result)
          setStatus('success')
        }
      } catch (e) {
        if (!cancelled) {
          setError(e)
          setStatus('error')
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [cacheKey, retryCount])

  const refetch = useCallback(() => {
    setRetryCount((c) => c + 1)
  }, [])

  return { data, status, error, refetch }
}
