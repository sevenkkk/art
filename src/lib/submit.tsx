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
import { useCommonHooks } from './hooks'
import { makeAutoObservable } from 'mobx'

export function makeSubmit<
  Tbody = Record<string, any>,
  TData = Record<string, any> | string
>(request: RequestType<Tbody> | string, config?: SubmitConfig<TData, Tbody>) {
  // 得到当前配置
  const myConfig = getMyConfig<TData, Tbody>(config, 'submit') as QueryConfig<
    TData,
    Tbody
  >

  // 当前请求
  let currentRequest: RequestResult

  // 创建store
  const store: SubmitStoreType<TData, Tbody> = makeAutoObservable<
    SubmitStoreType<TData, Tbody>
  >({
    ...getDefaultState(),
    setStatus: (status: ViewState) => {
      setStatus(store, status)
    },
    setBody: (inBody: Partial<Tbody>, replace = false) => {
      setBody<Tbody>(store, inBody, replace)
    },
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
      store.isEmpty = undefined
    }
  })
  return store
}

export function useSubmit<
  Tbody = Record<string, any>,
  TData = Record<string, any> | string
>(
  request: RequestType<Tbody> | string,
  config?: HooksConfig<TData, Tbody>,
  deps?: DependencyList
) {
  const store = useMemo(() => makeSubmit(request, config), deps ?? [])

  useCommonHooks(store, 'submit', config, deps)

  return store
}
