import { DependencyList, useMemo } from 'react'
import { getMyConfig } from './plugin/fetch-service'
import {
  FetchConfig,
  FetchStoreType,
  HooksFetchConfig,
  RequestType
} from './model'
import { useCommonHooks } from './hooks'
import { getObserver } from './obs/observer'
import { PagePlugin } from './plugin/page-plugin'
import { getMethodInjectStore, handlePlugins } from './utils/plugin-utils'
import { FetchPlugin } from './plugin/fetch-plugin'
import { StatusPlugin } from './plugin/status-plugin'
import { BodyPlugin } from './plugin/body-plugin'
import { ResultPlugin } from './plugin/result-plugin'

export function makeFetch<
  TData = Record<string, any> | string,
  TBody = Record<string, any>
>(
  request: RequestType<TBody> | string,
  config?: FetchConfig<TData, TBody>
): FetchStoreType<TData, TBody> {
  // 得到当前配置
  const myConfig = getMyConfig<TData, TBody>(config) as FetchConfig<
    TData,
    TBody
  >

  const { state, method } = handlePlugins([
    StatusPlugin<TData, TBody>(),
    BodyPlugin<TData, TBody>(),
    ResultPlugin<TData, TBody>(myConfig),
    FetchPlugin<TData, TBody>(request, myConfig),
    PagePlugin<TData, TBody>(myConfig)
  ])

  // 创建store
  const store: FetchStoreType<TData, TBody> = getObserver()<
    FetchStoreType<TData, TBody>
  >({
    ...state,
    ...getMethodInjectStore(method, () => store)
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
