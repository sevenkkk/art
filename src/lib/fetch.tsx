import { DependencyList, useMemo } from 'react'
import {
  HooksInfiniteConfig,
  HooksMutationConfig,
  HooksQueryConfig,
  MutationStoreType,
  QueryConfig,
  QueryInfiniteConfig,
  QueryInfiniteStoreType,
  QueryStoreType,
  RequestPageType,
  RequestType
} from './model'
import { getMyStore, StoreType } from './utils/plugin-utils'
import { StatusPlugin } from './plugin/status-plugin'
import { BodyPlugin } from './plugin/body-plugin'
import { ResultPlugin } from './plugin/result-plugin'
import { QueryPlugin } from './plugin/query-plugin'
import { MutationPlugin } from './plugin/mutation-plugin'
import { MutationResultPlugin } from './plugin/mutation-result-plugin'
import { useMutationHooks, useQueryHooks } from './hooks'
import { InfinitePlugin } from './plugin/infinite-plugin'
import { getQueryConfig } from './plugin/service/query-service'
import { getQueryPageConfig } from './plugin/service/page-service'
import { getMutationConfig } from './plugin/service/mutation-service'

export function makeQuery<
  TData = Record<string, any> | string,
  TBody = Record<string, any>
>(
  request: RequestType<TBody>,
  config?: QueryConfig<TData, TBody>
): StoreType<QueryStoreType<TData, TBody>> {
  // 得到当前配置
  const myConfig = getQueryConfig<TData, TBody>(config)
  return getMyStore<QueryStoreType<TData, TBody>>([
    StatusPlugin<TData, TBody>(),
    BodyPlugin<TData, TBody>(),
    ResultPlugin<TData, TBody>(request, myConfig),
    QueryPlugin<TData, TBody>(request, myConfig)
  ])
}

// export function makePagination<
//   TData = Record<string, any> | string,
//   TBody = Record<string, any>
// >(
//   request: RequestType<TBody>,
//   config?: QueryPageConfig<TData, TBody>
// ): StoreType<QueryPageStoreType<TData, TBody>> {
//   // 得到当前配置
//   const myConfig = getQueryPageConfig<TData, TBody>(config)
//   return getMyStore<QueryPageStoreType<TData, TBody>>([
//     StatusPlugin<TData, TBody>(),
//     BodyPlugin<TData, TBody>(),
//     ResultPlugin<TData, TBody>(request, myConfig),
//     QueryPlugin<TData, TBody>(request, myConfig),
//     PagePlugin<TData, TBody>(request, myConfig)
//   ])
// }

export function makePagination<
  TData extends Array<any>,
  TBody = Record<string, any>
>(
  request: RequestType<TBody>,
  config?: QueryInfiniteConfig<TData, TBody>
): StoreType<QueryInfiniteStoreType<TData, TBody>> {
  // 得到当前配置
  const myConfig = getQueryPageConfig<TData, TBody>(
    config
  ) as QueryInfiniteConfig<TData, TBody>
  return getMyStore<QueryInfiniteStoreType<TData, TBody>>([
    StatusPlugin<TData, TBody>(),
    BodyPlugin<TData, TBody>(),
    ResultPlugin<TData, TBody>(request, myConfig),
    InfinitePlugin<TData, TBody>(request, myConfig)
  ])
}

export function makeMutation<
  TBody = Record<string, any>,
  TData = Record<string, any> | string
>(
  request: RequestType<TBody>,
  config?: QueryConfig<TData, TBody>
): StoreType<MutationStoreType<TData, TBody>> {
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
): StoreType<QueryStoreType<TData, TBody>> {
  const store = useMemo(() => makeQuery(request, config), deps ?? [])
  useQueryHooks(store, config, deps)
  return store
}

// export function usePagination<
//   TData = Record<string, any> | string,
//   TBody = Record<string, any>
// >(
//   request: RequestType<TBody>,
//   config?: HooksQueryConfig<TData, TBody>,
//   deps?: DependencyList
// ): StoreType<QueryPageStoreType<TData, TBody>> {
//   const store = useMemo(() => makePagination(request, config), deps ?? [])
//   useQueryHooks(store, config, deps)
//   return store
// }

export function usePagination<TData extends any[], TBody = Record<string, any>>(
  request: RequestPageType<TBody>,
  config?: HooksInfiniteConfig<TData, TBody>,
  deps?: DependencyList
): StoreType<QueryInfiniteStoreType<TData, TBody>> {
  const store = useMemo(() => makePagination(request, config), deps ?? [])
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
): StoreType<MutationStoreType<TData, TBody>> {
  const store = useMemo(() => makeMutation(request, config), deps ?? [])
  useMutationHooks(store, config, deps)
  return store
}
