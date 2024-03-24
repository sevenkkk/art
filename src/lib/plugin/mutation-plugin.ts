import {
  FetchRunConfig,
  MutationConfig,
  MutationStoreType,
  RequestResult,
  RequestType
} from '../model'
import {
  createRequest,
  fetchCancel,
  getPostBody,
  getRequest,
  updateDefaultBody
} from './service/fetch-service'
import { PluginReturn, StoreType } from '../utils/plugin-utils'
import { doRequest } from './service/query-service'

export function MutationPlugin<TData, TBody>(
  request: RequestType<TBody>,
  config: MutationConfig<TData, TBody>
): PluginReturn<StoreType<MutationStoreType<TData, TBody>>> {
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
  const mutateSync = (
    store: StoreType<MutationStoreType<TData, TBody>>,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    mutate(store, body, runConfig).then()
  }

  /**
   * 请求接口异步
   * @param store 全局状态
   * @param body 请求体
   * @param runConfig 配置项
   */
  const mutate = (
    store: StoreType<MutationStoreType<TData, TBody>>,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    const requestFun = (body?: Partial<TBody>, runConfig?: FetchRunConfig) => {
      const myConfig = { ...config, ...runConfig }
      // 设置body
      updateDefaultBody<TBody>(
        store,
        myConfig.replaceBody,
        myConfig.defaultBody,
        body
      )
      // 获取准备提交的请求体
      const _body = getPostBody(store.body, myConfig.postBody)
      // 获取请求体
      currentRequest = getRequest(request, _body, myConfig.method)
      // 发送请求
      return doRequest<TData, TBody>(currentRequest, store, myConfig)
    }
    return createRequest(config, abortController, requestFun, body, runConfig)
  }

  const cancel = (store: StoreType<MutationStoreType>) => {
    fetchCancel(store, abortController, currentRequest)
  }

  const clear = (store: StoreType<MutationStoreType>) => {
    store({
      data: undefined,
      body: undefined,
      status: 'idle',
      isLoading: false,
      isError: false,
      isSuccess: false
    })
  }

  return {
    state,
    method: { mutate, mutateSync, cancel, clear }
  }
}
