import {
  FetchRunConfig,
  QueryStoreType,
  QueryConfig,
  RefreshConfigType,
  RequestResult,
  RequestType,
  UseResult,
  FetchBody
} from '../model'
import {
  autoClear,
  clearLocalData,
  createRequest,
  fetchCancel,
  getCacheRequest,
  getPostBody,
  getRequest,
  getStoreCacheData,
  setStoreCacheData,
  updateDefaultBody
} from './service/fetch-service'
import { PluginReturn, StoreType } from '../utils/plugin-utils'
import { doRefresh, doRequest } from './service/query-service'

export function QueryPlugin<TData, TBody>(
  request: RequestType<TBody>,
  config: QueryConfig<TData, TBody>
): PluginReturn<StoreType<QueryStoreType<TData, TBody>>> {
  const abortController = new AbortController()

  // 当前请求
  let currentRequest: RequestResult | undefined

  // 初始化状态
  const state = {
    lastRequestTime: undefined
  }

  /**
   * 请求刷新
   * @param store 全局状态
   * @param refConfig 配置项
   */
  const refreshSync = (
    store: StoreType<QueryStoreType<TData, TBody>>,
    refConfig?: RefreshConfigType
  ) => {
    refresh(store, refConfig).then()
  }

  /**
   * 请求刷新异步
   * @param store 全局状态
   * @param refConfig 配置项
   */
  const refresh = (
    store: StoreType<QueryStoreType<TData, TBody>>,
    refConfig?: RefreshConfigType
  ): Promise<UseResult<TData>> => {
    return doRefresh<TData, TBody>(config, store, refConfig)
  }

  /**
   * 请求接口
   * @param store 全局状态
   * @param body 请求体
   * @param runConfig 配置项
   */
  const querySync = (
    store: StoreType<QueryStoreType<TData, TBody>>,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    query(store, body, runConfig).then()
  }

  /**
   * 请求接口异步
   * @param store 全局状态
   * @param body 请求体
   * @param runConfig 配置项
   */
  const query = (
    store: StoreType<QueryStoreType<TData, TBody>>,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    const requestFun = (body?: Partial<TBody>, runConfig?: FetchRunConfig) => {
      const myConfig = { ...config, ...runConfig }
      // 清除
      autoClear(store, myConfig.autoClear)

      // 设置body
      updateDefaultBody<TBody>(
        store,
        myConfig.replaceBody,
        myConfig.defaultBody,
        body
      )

      // 获取缓存
      const { cache, active } = getStoreCacheData<TData, TBody>(
        myConfig,
        request,
        store
      )

      // 如果有缓存 并且缓存有效
      if (!myConfig?.refresh && cache && active) {
        return getCacheRequest<TData, TBody>(myConfig, cache, store)
      } else {
        // 获取准备提交的请求体
        const _body = store.postBody(myConfig.postBody)
        // 获取请求体
        currentRequest = getRequest(request, _body, myConfig.method)
        // 发送请求
        return doRequest<TData, TBody>(currentRequest, store, myConfig, request)
      }
    }
    return createRequest(config, abortController, requestFun, body, runConfig)
  }

  const setCache = (store: StoreType<QueryStoreType<TData>>, data: TData) => {
    setStoreCacheData(config, request, store, { success: true, data })
  }

  const postBody = (
    store: StoreType<QueryStoreType<TData>>,
    postBody: (postBody: (body: FetchBody<TBody>) => any) => any
  ) => {
    return getPostBody(store.body, postBody)
  }

  const cancel = (store: StoreType<QueryStoreType>) => {
    fetchCancel(store, abortController, currentRequest)
  }

  const clear = (store: StoreType<QueryStoreType<TData, TBody>>) => {
    store({
      originData: undefined,
      data: undefined,
      body: undefined,
      status: 'idle'
    })
    clearLocalData(store, config as QueryConfig<TData, TBody>, request)
  }

  return {
    state,
    method: {
      query,
      querySync,
      refresh,
      refreshSync,
      setCache,
      cancel,
      clear,
      postBody
    }
  }
}
