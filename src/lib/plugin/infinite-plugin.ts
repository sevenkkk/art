import {
  FetchBody,
  FetchRunConfig,
  QueryConfig,
  QueryInfiniteConfig,
  QueryInfiniteStoreType,
  QueryStoreType,
  RequestResult,
  RequestType,
  UseResult
} from '../model'
import { PluginReturn } from '../utils/plugin-utils'
import {
  clearData,
  debounce,
  doRequestByInfinite,
  getPostBody,
  getRequest,
  handlePageBody,
  setResDataByInfinite,
  throttle,
  updateDefaultBody
} from './fetch-service'

export const InfinitePlugin = <TData, TBody>(
  request: RequestType<TBody>,
  config: QueryInfiniteConfig<TData, TBody>
): PluginReturn<QueryInfiniteStoreType<TData, TBody>> => {
  const abortController = new AbortController()
  let currentRequest: RequestResult | undefined

  // 初始化状态
  const state = {
    lastPage: undefined,
    current: 1,
    pageSize: config?.pageSize ?? 10,
    isFetchingNextPage: false,
    hasNextPage: true
  }

  const queryNextPage = (
    store: QueryInfiniteStoreType<TData>,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    const requestFun = (body?: Partial<TBody>, runConfig?: FetchRunConfig) => {
      const myConfig = { ...config, ...runConfig }
      store.current = store.current + 1
      // 设置body
      updateDefaultBody<TBody>(store, myConfig.defaultBody, body)

      let nextPageRequestBody

      if (myConfig.nextPageRequestBody) {
        nextPageRequestBody = () =>
          myConfig.nextPageRequestBody(store.lastPage!, {
            current: store.current,
            pageSize: store.pageSize
          })
      }
      // 获取准备提交的请求体
      const _body = store.postBody(myConfig.postBody, nextPageRequestBody)
      // 获取请求体
      currentRequest = getRequest(request, _body, myConfig.method)
      // 发送请求
      return doRequestByInfinite<TData, TBody>(
        currentRequest,
        store,
        myConfig,
        (res) => setResDataByInfinite(res, myConfig, store)
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

  // 清理数据
  const clear = (store: QueryInfiniteStoreType<TData>) => {
    clearData(store, config as QueryConfig<TData, TBody>, request)
    store.total = 0
    store.current = 1
    store.lastPage = undefined
    store.isLoadingNextPage = false
    store.isErrorNextPage = false
    store.hasNextPage = true
  }

  const postBody = (
    store: QueryStoreType<TData>,
    postBody: (postBody: (body: FetchBody<TBody>) => any) => any,
    nextPageRequestBody?: () => Record<string, any>
  ) => {
    // 处理分页
    let _body
    if (nextPageRequestBody) {
      _body = nextPageRequestBody()
    } else {
      _body = handlePageBody(store)
    }
    return getPostBody(_body, postBody)
  }

  const setRes = (
    store: QueryInfiniteStoreType<TData>,
    res: UseResult<TData[]>
  ) => {
    store.setData([store.data, ...(res.data ?? [])])
    store.lastPage = res
    store.total = res.total ?? 0
    store.hasNextPage = res.data?.length === store.pageSize
  }

  return {
    state,
    method: {
      queryNextPage,
      clear,
      setRes,
      postBody
    }
  }
}
