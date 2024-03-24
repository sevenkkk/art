import {
  FetchBody,
  QueryConfig,
  QueryPageConfig,
  QueryPageStoreType,
  QueryStoreType,
  RequestType,
  UseResult
} from '../model'
import { PluginReturn, StoreType } from '../utils/plugin-utils'
import { clearLocalData, getPostBody } from './service/fetch-service'

export const PagePlugin = <TData, TBody>(
  request: RequestType<TBody>,
  config?: QueryPageConfig<TData, TBody>
): PluginReturn<StoreType<QueryPageStoreType<TData, TBody>>> => {
  // 初始化状态
  const state = {
    current: 1,
    pageSize: config?.pageSize ?? 10,
    total: 0
  }

  // 设置页码
  const setPage = (
    store: StoreType<QueryPageStoreType<TData>>,
    config: {
      current?: number
      pageSize?: number
      autoRun?: boolean
    }
  ): void => {
    const { current, pageSize } = config ?? {}
    if (current || pageSize) {
      store({
        current: current ?? store.current,
        pageSize: pageSize ?? store.pageSize
      })
    }
  }

  // 设置页面并且查询
  const setPageQuerySync = (
    store: StoreType<QueryPageStoreType<TData>>,
    config: {
      current?: number
      pageSize?: number
    }
  ): void => {
    setPage(store, config)
    store.querySync()
  }

  const setPageQuery = (
    store: StoreType<QueryPageStoreType<TData>>,
    config: {
      current?: number
      pageSize?: number
    }
  ): Promise<UseResult<TData>> => {
    setPage(store, config)
    return store.query()
  }

  // 清理数据
  const clear = (store: StoreType<QueryPageStoreType<TData>>) => {
    store({
      originData: undefined,
      data: undefined,
      body: undefined,
      total: 0,
      current: 1
    })
    clearLocalData(store, config as QueryConfig<TData, TBody>, request)
  }

  const postBody = (
    store: StoreType<QueryStoreType<TData>>,
    postBody: (postBody: (body: FetchBody<TBody>) => any) => any
  ) => {
    // 处理分页
    return getPostBody(store.body, postBody)
  }

  return {
    state,
    method: {
      setPage,
      setPageQuery,
      setPageQuerySync,
      clear,
      postBody
    }
  }
}
