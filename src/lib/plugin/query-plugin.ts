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
  clearData,
  debounce,
  doRefresh,
  doRequest,
  getCacheRequest,
  getPostBody,
  getRequest,
  getStoreCacheData,
  setResData,
  throttle,
  updateDefaultBody
} from './fetch-service'
import { PluginReturn } from '../utils/plugin-utils'

export function QueryPlugin<TData, TBody>(
  request: RequestType<TBody>,
  config: QueryConfig<TData, TBody>
): PluginReturn<QueryStoreType<TData, TBody>> {
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
  const refresh = (
    store: QueryStoreType<TData, TBody>,
    refConfig?: RefreshConfigType
  ) => {
    refreshSync(store, refConfig).then()
  }

  /**
   * 请求刷新异步
   * @param store 全局状态
   * @param refConfig 配置项
   */
  const refreshSync = (
    store: QueryStoreType<TData, TBody>,
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
  const query = (
    store: QueryStoreType<TData, TBody>,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    querySync(store, body, runConfig).then()
  }

  /**
   * 请求接口异步
   * @param store 全局状态
   * @param body 请求体
   * @param runConfig 配置项
   */
  const querySync = (
    store: QueryStoreType<TData, TBody>,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    const requestFun = (body?: Partial<TBody>, runConfig?: FetchRunConfig) => {
      const myConfig = { ...config, ...runConfig }
      // 清除
      autoClear(store, myConfig.autoClear)

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
        // 设置body
        updateDefaultBody<TBody>(store, myConfig.defaultBody, body)
        // 获取准备提交的请求体
        const _body = store.postBody(myConfig.postBody)
        // 获取请求体
        currentRequest = getRequest(request, _body, myConfig.method)
        // 发送请求
        return doRequest<TData, TBody>(currentRequest, store, myConfig, (res) =>
          setResData(res, myConfig, store, request)
        )
      }
    }
    if (config.throttleMs) {
      return throttle(
        requestFun,
        abortController,
        config.throttleMs
      )(body, runConfig)
    }

    return debounce(
      requestFun,
      abortController,
      config.debounceMs
    )(body, runConfig)
  }

  const postBody = (
    store: QueryStoreType<TData>,
    postBody: (postBody: (body: FetchBody<TBody>) => any) => any
  ) => {
    return getPostBody(store.body, postBody)
  }

  const setRes = (store: QueryStoreType<TData>, res: UseResult<TData>) => {
    store.setData(res.data)
  }

  const cancel = (store: QueryStoreType) => {
    if (currentRequest?.cancel) {
      currentRequest?.cancel!()
    }
    abortController.abort()
    store.setStatus('idle')
  }

  const clear = (store: QueryStoreType) => {
    clearData(store, config, request)
    store.setStatus('idle')
  }

  return {
    state,
    method: {
      query,
      querySync,
      refresh,
      refreshSync,
      cancel,
      clear,
      setRes,
      postBody
    }
  }
}
