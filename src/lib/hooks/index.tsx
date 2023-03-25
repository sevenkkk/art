import { DependencyList, useEffect } from 'react'
import { useBrowserPageChange } from './browser-page-hooks'
import { FetchStoreType, HooksFetchConfig } from '../model'

export function useCommonHooks(
  store: FetchStoreType,
  config?: HooksFetchConfig,
  deps?: DependencyList
) {
  useEffect(() => {
    const manual = config?.manual ?? config?.submit ?? false
    if (!manual) {
      store.run()
    }
    let interval: any
    if (config?.pollingIntervalMs) {
      if (interval) {
        clearInterval(interval)
      }
      interval = setInterval(() => {
        store.run()
      }, config.pollingIntervalMs)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
      store.cancel()
    }
  }, deps ?? [])

  const { visibilityChange } = useBrowserPageChange()

  useEffect(() => {
    if (config?.refreshOnWindowFocus && visibilityChange) {
      if (
        !store.lastRequestTime ||
        new Date().getTime() - store.lastRequestTime >
        (config?.refreshOnWindowFocusTimespanMs ?? 0)
      )
        if (config?.refreshOnWindowFocusMode === 'run') {
          store.run()
        } else {
          store.refresh()
        }
    }
  }, [visibilityChange])
}

export function useAutoRun<T>(
  store: FetchStoreType<any, T>,
  body?: T,
  deps?: DependencyList
) {
  useEffect(() => {
    store.run(body)
  }, deps ?? [])
}
