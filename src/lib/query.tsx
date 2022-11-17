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
import resso from 'resso'
import { useCommonHooks } from './hooks'

export function createQueryStore<
  R = Record<string, any> | string,
  P = Record<string, any>
>(request: RequestType<P> | string, config?: QueryConfig<R, P>) {
  // 得到当前配置
  const myConfig = getMyConfig<R, P>(config) as QueryConfig<R, P>

  // 当前请求
  let currentRequest: RequestResult | undefined

  // 创建store
  const store: QueryStoreType<R, P> = resso<QueryStoreType<R, P>>({
    ...getDefaultState(),
    current: config?.usePage ? 1 : undefined,
    pageSize: config?.usePage ? config?.pageSize ?? 10 : undefined,
    total: 0,
    offset: undefined,
    setStatus: (status: ViewState) => {
      setStatus(store, status)
    },
    setBody: (inBody: Partial<P>, replace = false) => {
      setBody<P>(store, inBody, replace)
    },
    setPage: (config) => {
      setPage(config, store)
    },
    setPageRun: (config): Promise<UseResult<R>> => setPageRun(config, store),
    setData: (data?: R) => {
      store.data = data
    },
    refresh: (config): Promise<UseResult<R>> => {
      return refresh(myConfig, store, request, currentRequest, config)
    },
    run: doRun<R, P>(
      (body?: Partial<P>, config?: QueryRunConfig) =>
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
  R = Record<string, any> | string,
  P = Record<string, any>
>(
  request: RequestType<P> | string,
  config?: QueryHooksConfig<R, P>,
  deps?: DependencyList
) {
  const store = useMemo(() => createQueryStore(request, config), deps ?? [])
  useCommonHooks(store, 'query', config, deps)
  return store
}
