import { DependencyList, useMemo } from 'react'
import {
  cancel,
  doRun,
  getDefaultState,
  getMyConfig,
  getRequestFun,
  refresh,
  setBody,
  setStatus
} from './utils'
import {
  HooksConfig,
  QueryConfig,
  QueryRunConfig,
  RequestResult,
  RequestType,
  SubmitConfig,
  SubmitStoreType,
  UseResult,
  ViewState
} from './model'
import resso from 'resso'
import { useCommonHooks } from './hooks'

export function createSubmitStore<
  R = Record<string, any> | string,
  P = Record<string, any>
>(request: RequestType<P> | string, config?: SubmitConfig<R, P>) {
  // 得到当前配置
  const myConfig = getMyConfig<R, P>(config) as QueryConfig<R, P>

  // 当前请求
  let currentRequest: RequestResult

  // 创建store
  const store: SubmitStoreType<R, P> = resso<SubmitStoreType<R, P>>({
    ...getDefaultState(),
    setStatus: (status: ViewState) => {
      setStatus(store, status)
    },
    setBody: (inBody: Partial<P>, replace = false) => {
      setBody<P>(store, inBody, replace)
    },
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
      store.isEmpty = undefined
    }
  })
  return store
}

export function useSubmit<
  R = Record<string, any> | string,
  P = Record<string, any>
>(
  request: RequestType<P> | string,
  config?: HooksConfig<R, P>,
  deps?: DependencyList
) {
  const store = useMemo(() => createSubmitStore(request, config), deps ?? [])

  useCommonHooks(store, 'submit', config, deps)

  return store
}
