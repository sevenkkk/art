import {
  FetchConfig,
  FetchRunConfig,
  FetchStoreType,
  RefreshConfigType,
  RequestResult,
  RequestType,
  UseResult,
  ViewState
} from '../model'
import { CancelMapping } from '../utils/cancel-mapping'
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

  const cancelMapping = new CancelMapping()

  // 初始化状态
  const state = {
    lastRequestTime: undefined
  }

  const refresh = (
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
        cancelMapping,
        config.throttleMs
      )(body, runConfig)
    }

    return debounce(
      requestFun,
      cancelMapping,
      config.debounceMs
    )(body, runConfig)
  }

  const cancel = (store: FetchStoreType) => {
    console.log(currentRequest)
    if (currentRequest?.cancel) {
      currentRequest?.cancel!()
    }
    cancelMapping.cancelAll()
    store.setStatus(ViewState.idle)
  }

  const clear = (store: FetchStoreType) => {
    store.data = undefined
    store.body = undefined
    store.isEmpty = undefined
  }

  return {
    state,
    method: { run, refresh, cancel, clear }
  }
}
