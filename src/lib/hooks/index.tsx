import { DependencyList, useEffect } from 'react'
import { useBrowserPageChange } from './browser-page-hooks'
import {
  HooksMutationConfig,
  HooksQueryConfig,
  MutationStoreType,
  QueryStoreType
} from '../model'

export function useQueryHooks(
  store: QueryStoreType,
  config?: HooksQueryConfig,
  deps?: DependencyList
) {
  useEffect(() => {
    const manual = config?.manual ?? false
    if (!manual) {
      store.query()
    }
    let interval: any
    if (config?.pollingIntervalMs) {
      if (interval) {
        clearInterval(interval)
      }
      interval = setInterval(() => {
        store.query()
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
          store.query()
        } else {
          store.refresh()
        }
    }
  }, [visibilityChange])
}

export function useAutoQuery<T>(
  store: QueryStoreType<any, T>,
  body?: T,
  deps?: DependencyList
) {
  useEffect(() => {
    store.query(body)
  }, deps ?? [])
}

export function useMutationHooks(
  store: MutationStoreType,
  config?: HooksMutationConfig,
  deps?: DependencyList
) {
  useEffect(() => {
    const manual = config?.manual ?? true
    if (!manual) {
      store.mutate()
    }
    let interval: any
    if (config?.pollingIntervalMs) {
      if (interval) {
        clearInterval(interval)
      }
      interval = setInterval(() => {
        store.mutate()
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
        store.mutate()
    }
  }, [visibilityChange])
}

export function useAutoMutate<T>(
  store: MutationStoreType<any, T>,
  body?: T,
  deps?: DependencyList
) {
  useEffect(() => {
    store.mutate(body)
  }, deps ?? [])
}
