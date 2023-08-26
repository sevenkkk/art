import {
  FetchRunConfig,
  MutationConfig,
  MutationStoreType,
  RequestResult,
  RequestType,
  UseResult
} from '../model'
import {
  debounce,
  doRequest,
  getPostBody,
  getRequest,
  setResData,
  throttle,
  updateDefaultBody
} from './fetch-service'
import { PluginReturn } from '../utils/plugin-utils'

export function MutationPlugin<TData, TBody>(
  request: RequestType<TBody>,
  config: MutationConfig<TData, TBody>
): PluginReturn<MutationStoreType<TData, TBody>> {
  // 当前请求
  let currentRequest: RequestResult | undefined

  const abortController = new AbortController()

  // 初始化状态
  const state = {
    lastRequestTime: undefined
  }

  /**
   * 请求接口
   * @param store 全局状态
   * @param body 请求体
   * @param runConfig 配置项
   */
  const mutate = (
    store: MutationStoreType<TData, TBody>,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    mutateSync(store, body, runConfig).then()
  }

  /**
   * 请求接口异步
   * @param store 全局状态
   * @param body 请求体
   * @param runConfig 配置项
   */
  const mutateSync = (
    store: MutationStoreType<TData, TBody>,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    const requestFun = (body?: Partial<TBody>, runConfig?: FetchRunConfig) => {
      const myConfig = { ...config, ...runConfig }
      // 设置body
      updateDefaultBody<TBody>(store, myConfig.defaultBody, body)
      // 获取准备提交的请求体
      const _body = getPostBody(store.body, myConfig.postBody)
      // 获取请求体
      currentRequest = getRequest(request, _body, myConfig.method)

      // 发送请求
      return doRequest<TData, TBody>(currentRequest, store, myConfig, (res) =>
        setResData(res, myConfig, store, request)
      )
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
  const setRes = (store: MutationStoreType<TData>, res: UseResult<TData>) => {
    store.setData(res.data)
  }

  const cancel = (store: MutationStoreType) => {
    if (currentRequest?.cancel) {
      currentRequest?.cancel!()
    }
    abortController.abort()
    store.setStatus('idle')
  }

  const clear = (store: MutationStoreType) => {
    store.data = undefined
    store.body = undefined
    store.setStatus('idle')
  }

  return {
    state,
    method: { mutate, mutateSync, setRes, cancel, clear }
  }
}
