import { useCallback, useEffect, useRef, useState } from 'react'

// Simple data-fetching hook: { data, loading, error, refetch }.
// Callers can optionally pass a data-accessor (e.g. rows => rows.map(...)).
export function useApi(fetcher, { accessor, deps = [], enabled = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const depsKey = JSON.stringify(deps)

  const load = useCallback(() => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    return fetcherRef
      .current()
      .then((result) => setData(accessor ? accessor(result) : result))
      .catch((err) => setError(err))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, accessor, depsKey])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, refetch: load }
}
