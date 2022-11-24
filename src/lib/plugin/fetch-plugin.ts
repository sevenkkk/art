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
import { debounce, doRefresh, getRequestFun, throttle } from './fetch-service'
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
    store: FetchStoreType,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    const requestFun = (body?: Partial<TBody>, runConfig?: FetchRunConfig) =>
      getRequestFun(config, store, request, currentRequest, body, runConfig)
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
