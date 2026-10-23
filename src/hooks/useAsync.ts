import { useEffect, useState } from 'react'

type Loader<T> = (signal: AbortSignal) => Promise<T>

// A finished request, remembering which load / reload it belongs to.
interface Result<T> {
  load: Loader<T>
  reloadCount: number
  data: T | undefined
  error: unknown
}

// Runs `load` when the component mounts (and whenever `load` changes), tracking
// loading / error / data. Wrap `load` in useCallback so it only changes when its inputs do.
// If the component unmounts or `load` changes first, the old request is cancelled.
export function useAsync<T>(load: Loader<T>) {
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState<Result<T> | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ load, reloadCount, data, error: undefined })
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setResult({ load, reloadCount, data: undefined, error })
      },
    )
    return () => controller.abort()
  }, [load, reloadCount])

  // Still loading until a result exists for the current request. Deriving this during render
  // (instead of setting a "loading" flag inside the effect) avoids an extra render and
  // never shows data from a previous request, e.g. after navigating from product 1 to 2.
  const current = result && result.load === load && result.reloadCount === reloadCount ? result : null

  return {
    data: current?.data,
    error: current?.error,
    loading: current === null,
    reload: () => setReloadCount((count) => count + 1),
  }
}
