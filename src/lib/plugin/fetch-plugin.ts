import {
  FetchConfig,
  FetchRunConfig,
  FetchStoreType,
  RefreshConfigType,
  RequestResult,
  RequestType,
  UseResult
} from '../model'
import {
  autoClear,
  debounce,
  doRefresh,
  doRequest,
  getCacheRequest,
  getPostBody,
  getRequest,
  getStoreCacheData,
  handlePageBody,
  setResData,
  throttle,
  updateDefaultBody
} from './fetch-service'
import { PluginReturn } from '../utils/plugin-utils'

export function FetchPlugin<TData, TBody>(
  request: RequestType<TBody> | string,
  config: FetchConfig<TData, TBody>
): PluginReturn<TData, TBody> {
  // 当前请求
  let currentRequest: RequestResult | undefined

  const abortController = new AbortController()

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
    store: FetchStoreType<TData, TBody>,
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
    store: FetchStoreType<TData, TBody>,
    refConfig?: RefreshConfigType
  ): Promise<UseResult<TData>> => {
    return doRefresh<TData, TBody>(
      config,
      store,
      request,
      currentRequest,
      refConfig
    )
  }

  /**
   * 请求接口
   * @param store 全局状态
   * @param body 请求体
   * @param runConfig 配置项
   */
  const run = (
    store: FetchStoreType<TData, TBody>,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    runSync(store, body, runConfig).then()
  }

  /**
   * 请求接口异步
   * @param store 全局状态
   * @param body 请求体
   * @param runConfig 配置项
   */
  const runSync = (
    store: FetchStoreType<TData, TBody>,
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
      if (!config?.refresh && cache && active) {
        return getCacheRequest<TData, TBody>(myConfig, cache, store)
      } else {
        // 设置body
        updateDefaultBody<TBody>(store, myConfig.defaultBody, body)
        // 处理分页
        let _body = handlePageBody(store, myConfig.pagination)
        // 获取准备提交的请求体
        _body = getPostBody(_body, myConfig.postBody)
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

  const cancel = (store: FetchStoreType) => {
    if (currentRequest?.cancel) {
      currentRequest?.cancel!()
    }
    abortController.abort()
    store.setStatus('idle')
  }

  const clear = (store: FetchStoreType) => {
    store.data = undefined
    store.body = undefined
    store.isEmpty = false
  }

  return {
    state,
    method: { run, runSync, refresh, refreshSync, cancel, clear }
  }
}
