import { DependencyList, useEffect } from 'react'
import { HooksConfig, StoreType } from '../model'
import { useBrowserPageChange } from './browser-page-hooks'

export function useCommonHooks(
  store: StoreType,
  type: 'submit' | 'query',
  config?: HooksConfig,
  deps?: DependencyList
) {
  useEffect(() => {
    const manual = config?.manual ?? type === 'submit'
    if (!manual) {
      store.run().then()
    }
    let interval: any
    if (config?.pollingIntervalMs) {
      if (interval) {
        clearInterval(interval)
      }
      interval = setInterval(() => {
        store.run().then()
      }, config?.pollingIntervalMs)
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
          store.run().then()
        } else {
          store.refresh().then()
        }
    }
  }, [visibilityChange])
}

export function useAutoRun<T>(
  store: StoreType<any, T>,
  body?: T,
  deps?: DependencyList
) {
  useEffect(() => {
    store.run(body).then()
  }, deps ?? [])
}
