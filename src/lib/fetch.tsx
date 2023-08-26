import { DependencyList, useMemo } from 'react'
import {
  getMutationConfig,
  getQueryConfig,
  getQueryPageConfig
} from './plugin/fetch-service'
import {
  HooksInfiniteConfig,
  HooksMutationConfig,
  HooksQueryConfig,
  MutationStoreType,
  QueryConfig,
  QueryInfiniteConfig,
  QueryInfiniteStoreType,
  QueryPageConfig,
  QueryPageStoreType,
  QueryStoreType,
  RequestType
} from './model'
import { getMyStore } from './utils/plugin-utils'
import { StatusPlugin } from './plugin/status-plugin'
import { BodyPlugin } from './plugin/body-plugin'
import { ResultPlugin } from './plugin/result-plugin'
import { QueryPlugin } from './plugin/query-plugin'
import { MutationPlugin } from './plugin/mutation-plugin'
import { MutationResultPlugin } from './plugin/mutation-result-plugin'
import { useMutationHooks, useQueryHooks } from './hooks'
import { PagePlugin } from './plugin/page-plugin'
import { InfinitePlugin } from './plugin/infinite-plugin'

export function makeQuery<
  TData = Record<string, any> | string,
  TBody = Record<string, any>
>(
  request: RequestType<TBody>,
  config?: QueryConfig<TData, TBody>
): QueryStoreType<TData, TBody> {
  // 得到当前配置
  const myConfig = getQueryConfig<TData, TBody>(config)
  return getMyStore<QueryStoreType<TData, TBody>>([
    StatusPlugin<TData, TBody>(),
    BodyPlugin<TData, TBody>(),
    ResultPlugin<TData, TBody>(request, myConfig),
    QueryPlugin<TData, TBody>(request, myConfig)
  ])
}

export function makePagination<
  TData = Record<string, any> | string,
  TBody = Record<string, any>
>(
  request: RequestType<TBody>,
  config?: QueryPageConfig<TData, TBody>
): QueryPageStoreType<TData, TBody> {
  // 得到当前配置
  const myConfig = getQueryPageConfig<TData, TBody>(config)
  return getMyStore<QueryPageStoreType<TData, TBody>>([
    StatusPlugin<TData, TBody>(),
    BodyPlugin<TData, TBody>(),
    ResultPlugin<TData, TBody>(request, myConfig),
    QueryPlugin<TData, TBody>(request, myConfig),
    PagePlugin<TData, TBody>(request, myConfig)
  ])
}

export function makeInfinite<
  TData = Record<string, any> | string,
  TBody = Record<string, any>
>(
  request: RequestType<TBody>,
  config?: QueryInfiniteConfig<TData, TBody>
): QueryInfiniteStoreType<TData, TBody> {
  // 得到当前配置
  const myConfig = getQueryPageConfig<TData, TBody>(
    config
  ) as QueryInfiniteConfig<TData, TBody>
  return getMyStore<QueryInfiniteStoreType<TData, TBody>>([
    StatusPlugin<TData, TBody>(),
    BodyPlugin<TData, TBody>(),
    ResultPlugin<TData, TBody>(request, myConfig),
    QueryPlugin<TData, TBody>(request, myConfig),
    InfinitePlugin<TData, TBody>(request, myConfig)
  ])
}

export function makeMutation<
  TData = Record<string, any> | string,
  TBody = Record<string, any>
>(
  request: RequestType<TBody>,
  config?: QueryConfig<TData, TBody>
): MutationStoreType<TData, TBody> {
  // 得到当前配置
  const myConfig = getMutationConfig<TData, TBody>(config)
  return getMyStore<MutationStoreType<TData, TBody>>([
    StatusPlugin<TData, TBody>(),
    BodyPlugin<TData, TBody>(),
    MutationResultPlugin<TData, TBody>(),
    MutationPlugin<TData, TBody>(request, myConfig)
  ])
}

export function useQuery<
  TData = Record<string, any> | string,
  TBody = Record<string, any>
>(
  request: RequestType<TBody>,
  config?: HooksQueryConfig<TData, TBody>,
  deps?: DependencyList
): QueryStoreType<TData, TBody> {
  const store = useMemo(() => makeQuery(request, config), deps ?? [])
  useQueryHooks(store, config, deps)
  return store
}

export function usePagination<
  TData = Record<string, any> | string,
  TBody = Record<string, any>
>(
  request: RequestType<TBody>,
  config?: HooksQueryConfig<TData, TBody>,
  deps?: DependencyList
): QueryPageStoreType<TData, TBody> {
  const store = useMemo(() => makePagination(request, config), deps ?? [])
  useQueryHooks(store, config, deps)
  return store
}

export function useInfinite<
  TData = Record<string, any> | string,
  TBody = Record<string, any>
>(
  request: RequestType<TBody>,
  config?: HooksInfiniteConfig<TData, TBody>,
  deps?: DependencyList
): QueryInfiniteStoreType<TData, TBody> {
  const store = useMemo(() => makeInfinite(request, config), deps ?? [])
  useQueryHooks(store, config, deps)
  return store
}

export function useMutation<
  TBody = Record<string, any>,
  TData = Record<string, any> | string
>(
  request: RequestType<TBody>,
  config?: HooksMutationConfig<TData, TBody>,
  deps?: DependencyList
): MutationStoreType<TData, TBody> {
  const store = useMemo(() => makeMutation(request, config), deps ?? [])
  useMutationHooks(store, config, deps)
  return store
}
