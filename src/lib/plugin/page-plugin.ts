import {
  FetchBody,
  QueryConfig,
  QueryPageConfig,
  QueryPageStoreType,
  QueryStoreType,
  RequestType,
  UseResult
} from '../model'
import { PluginReturn } from '../utils/plugin-utils'
import { clearData, getPostBody, handlePageBody } from './fetch-service'

export const PagePlugin = <TData, TBody>(
  request: RequestType<TBody>,
  config?: QueryPageConfig<TData, TBody>
): PluginReturn<QueryPageStoreType<TData, TBody>> => {
  // 初始化状态
  const state = {
    current: 1,
    pageSize: config?.pageSize ?? 10,
    total: 0,
    offset: undefined
  }

  // 设置页码
  const setPage = (
    store: QueryPageStoreType<TData>,
    config: {
      current?: number
      pageSize?: number
      autoRun?: boolean
    }
  ): void => {
    const { current, pageSize } = config ?? {}
    if (current) {
      store.current = current
    }
    if (pageSize) {
      store.pageSize = pageSize
    }
  }

  // 设置页面并且查询
  const setPageQuery = (
    store: QueryPageStoreType<TData>,
    config: {
      current?: number
      pageSize?: number
    }
  ): void => {
    setPage(store, config)
    store.query()
  }

  const setPageQuerySync = (
    store: QueryPageStoreType<TData>,
    config: {
      current?: number
      pageSize?: number
    }
  ): Promise<UseResult<TData>> => {
    setPage(store, config)
    return store.querySync()
  }

  // 清理数据
  const clear = (store: QueryPageStoreType<TData>) => {
    clearData(store, config as QueryConfig<TData, TBody>, request)
    store.total = 0
    store.current = 1
  }

  const postBody = (
    store: QueryStoreType<TData>,
    postBody: (postBody: (body: FetchBody<TBody>) => any) => any
  ) => {
    // 处理分页
    const _body = handlePageBody(store)
    return getPostBody(_body, postBody)
  }

  const setRes = (store: QueryPageStoreType<TData>, res: UseResult<TData>) => {
    store.setData(res.data)
    store.total = res.total ?? 0
  }

  return {
    state,
    method: {
      setPage,
      setPageQuery,
      setPageQuerySync,
      clear,
      setRes,
      postBody
    }
  }
}
