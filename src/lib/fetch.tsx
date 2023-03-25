import { DependencyList, useMemo } from 'react'
import {
  cancel,
  doRun,
  getMyConfig,
  getRequestFun,
  refresh,
  refreshSync,
  setBody,
  setPage,
  setPageRun,
  setPageRunSync,
  setStatus
} from './utils/request-utils'
import {
  FetchConfig,
  HooksFetchConfig,
  FetchRunConfig,
  RequestResult,
  RequestType,
  UseResult,
  RefreshConfigType,
  FetchStatus,
  FetchStoreType
} from './model'
import { useCommonHooks } from './hooks'
import { getObserver } from './obs/observer'
import { ID } from './utils/ID'

export function makeFetch<
  TData = Record<string, any> | string,
  TBody = Record<string, any>
>(request: RequestType<TBody> | string, config?: FetchConfig<TData, TBody>) {
  const abortController = new AbortController()
  // 得到当前配置
  const myConfig = getMyConfig<TData, TBody>(config) as FetchConfig<
    TData,
    TBody
  >

  // 当前请求
  let currentRequest: RequestResult | undefined

  // 创建store
  const store: FetchStoreType<TData, TBody> = getObserver()<
    FetchStoreType<TData, TBody>
  >({
    key: ID.generate(),
    status: 'idle',
    isLoading: false,
    isError: false,
    isSuccess: false,
    isEmpty: false,
    error: undefined,
    lastRequestTime: undefined,
    body: undefined,
    originData: undefined,
    data: undefined,
    current: config?.pagination ? 1 : undefined,
    pageSize: config?.pagination ? config?.pageSize ?? 10 : undefined,
    total: 0,
    offset: undefined,
    setStatus: (status: FetchStatus) => {
      setStatus(store, status)
    },
    setBody: (body: Partial<TBody>, replace = false): void => {
      setBody<TBody>(store, body, replace)
    },
    setPage: (config: {
      current?: number
      pageSize?: number
      autoRun?: boolean
    }): void => {
      setPage(config, store)
    },
    setPageRun: (config: { current?: number; pageSize?: number }): void =>
      setPageRun(config, store),
    setPageRunSync: (config: {
      current?: number
      pageSize?: number
    }): Promise<UseResult<TData>> => setPageRunSync(config, store),
    setData: (data?: TData) => {
      store.data = data
    },
    refresh: (config?: RefreshConfigType): void => {
      return refresh(myConfig, store, request, currentRequest, config)
    },
    refreshSync: (config?: RefreshConfigType): Promise<UseResult<TData>> => {
      return refreshSync(myConfig, store, request, currentRequest, config)
    },
    runSync: doRun<TData, TBody>(
      (body?: Partial<TBody>, config?: FetchRunConfig) =>
        getRequestFun(myConfig, store, request, currentRequest, body, config),
      abortController,
      myConfig
    ),
    run: (body?: Partial<TBody>, config?: FetchRunConfig) =>
      getRequestFun(
        myConfig,
        store,
        request,
        currentRequest,
        body,
        config
      ).then(),
    cancel: () => {
      cancel(currentRequest, store, abortController)
    },
    clear: () => {
      store.data = undefined
      store.body = undefined
      store.total = 0
      store.current = 1
      store.isEmpty = false
    }
  })
  return store
}

export function makeSubmit<
  TBody = Record<string, any>,
  TData = Record<string, any> | string
>(
  request: RequestType<TBody> | string,
  config?: FetchConfig<TData, TBody>
): FetchStoreType<TData, TBody> {
  const _config: FetchConfig<TData, TBody> = {
    submit: true,
    showMessage: true,
    showErrorMessage: true,
    showSuccessMessage: true,
    loading: true,
    ...(config ?? {})
  }
  return makeFetch<TData, TBody>(request, _config)
}

export function useFetch<
  TData = Record<string, any> | string,
  TBody = Record<string, any>
>(
  request: RequestType<TBody> | string,
  config?: HooksFetchConfig<TData, TBody>,
  deps?: DependencyList
) {
  const store = useMemo(() => makeFetch(request, config), deps ?? [])
  useCommonHooks(store, config, deps)
  return store
}

export function useSubmit<
  TBody = Record<string, any>,
  TData = Record<string, any> | string
>(
  request: RequestType<TBody> | string,
  config?: HooksFetchConfig<TData, TBody>,
  deps?: DependencyList
) {
  const store = useMemo(() => makeSubmit(request, config), deps ?? [])
  const _config: FetchConfig<TData, TBody> = {
    submit: true,
    ...(config ?? {})
  }
  useCommonHooks(store, _config, deps)
  return store
}
