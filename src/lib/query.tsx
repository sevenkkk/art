import { DependencyList, useMemo } from 'react'
import {
  cancel,
  doRun,
  getDefaultState,
  getMyConfig,
  getRequestFun,
  refresh,
  setBody,
  setPage,
  setPageRun,
  setStatus
} from './utils'
import {
  QueryConfig,
  QueryHooksConfig,
  QueryRunConfig,
  QueryStoreType,
  RequestResult,
  RequestType,
  UseResult,
  ViewState
} from './model'
import { useCommonHooks } from './hooks'
import { getObserver } from './observer'

export function makeQuery<
  TData = Record<string, any> | string,
  Tbody = Record<string, any>
>(request: RequestType<Tbody> | string, config?: QueryConfig<TData, Tbody>) {
  // 得到当前配置
  const myConfig = getMyConfig<TData, Tbody>(config) as QueryConfig<
    TData,
    Tbody
  >

  // 当前请求
  let currentRequest: RequestResult | undefined

  // 创建store
  const store: QueryStoreType<TData, Tbody> = getObserver()<
    QueryStoreType<TData, Tbody>
  >({
    ...getDefaultState(),
    current: config?.pagination ? 1 : undefined,
    pageSize: config?.pagination ? config?.pageSize ?? 10 : undefined,
    total: 0,
    offset: undefined,
    setStatus: (status: ViewState) => {
      setStatus(store, status)
    },
    setBody: (inBody: Partial<Tbody>, replace = false) => {
      setBody<Tbody>(store, inBody, replace)
    },
    setPage: (config) => {
      setPage(config, store)
    },
    setPageRun: (config): Promise<UseResult<TData>> =>
      setPageRun(config, store),
    setData: (data?: TData) => {
      store.data = data
    },
    refresh: (config): Promise<UseResult<TData>> => {
      return refresh(myConfig, store, request, currentRequest, config)
    },
    run: doRun<TData, Tbody>(
      (body?: Partial<Tbody>, config?: QueryRunConfig) =>
        getRequestFun(myConfig, store, request, currentRequest, body, config),
      myConfig
    ),
    cancel: (message?: string) => {
      cancel(currentRequest, message)
    },
    clear: () => {
      store.data = undefined
      store.body = undefined
      store.total = 0
      store.current = 1
      store.isEmpty = undefined
    }
  })
  return store
}

export function useQuery<
  TData = Record<string, any> | string,
  Tbody = Record<string, any>
>(
  request: RequestType<Tbody> | string,
  config?: QueryHooksConfig<TData, Tbody>,
  deps?: DependencyList
) {
  const store = useMemo(() => makeQuery(request, config), deps ?? [])
  useCommonHooks(store, 'query', config, deps)
  return store
}
