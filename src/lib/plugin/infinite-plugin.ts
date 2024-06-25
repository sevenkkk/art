import {
  FetchBody,
  FetchRunConfig,
  QueryInfiniteConfig,
  QueryInfiniteStoreType,
  QueryStoreType,
  RefreshConfigType,
  RequestResult,
  RequestType,
  UseResult
} from '../model'
import { PluginReturn, StoreType } from '../utils/plugin-utils'
import {
  autoClear,
  createRequest,
  fetchCancel,
  getCacheRequest,
  getPostBody,
  getRequest,
  getStoreCacheData,
  updateDefaultBody
} from './service/fetch-service'
import {
  doRequestByInfinite,
  doRequestByInfiniteQuery
} from './service/infinite-service'
import { doRefresh } from './service/query-service'
import { Art } from '../art'

export const InfinitePlugin = <TData extends Array<unknown>, TBody>(
  request: RequestType<TBody>,
  config: QueryInfiniteConfig<TData, TBody>
): PluginReturn<StoreType<QueryInfiniteStoreType<TData, TBody>>> => {
  const abortController = new AbortController()
  let currentRequest: RequestResult | undefined

  // 初始化状态
  const state = {
    lastRequestTime: undefined,
    current: config?.current ?? 1,
    pageSize: config?.pageSize ?? 10,
    total: config?.total ?? 0,
    pageTokens: config?.defaultNextToken
      ? [undefined, config?.defaultNextToken]
      : [undefined],
    isFetchingNextPage: false,
    hasNextPage: config?.defaultHasNextPage ?? false,
    isLoadingNextPage: false,
    isErrorNextPage: false
  }

  /**
   * 请求刷新
   * @param store 全局状态
   * @param refConfig 配置项
   */
  const refreshSync = (
    store: StoreType<QueryInfiniteStoreType<TData, TBody>>,
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
    store: StoreType<QueryInfiniteStoreType<TData, TBody>>,
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
    store: StoreType<QueryInfiniteStoreType<TData, TBody>>,
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
    store: StoreType<QueryInfiniteStoreType<TData, TBody>>,
    body?: Partial<TBody>,
    runConfig?: FetchRunConfig
  ) => {
    if (currentRequest?.cancel) {
      currentRequest?.cancel!()
    }
    const requestFun = (body?: Partial<TBody>, runConfig?: FetchRunConfig) => {
      const myConfig = { ...config, ...runConfig }
      // 清除
      autoClear(store, myConfig.autoClear)

      if (store.current !== 1) {
        store({
          current: 1
        })
      }
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
        let pageInfo = {
          current: store.current,
          nextToken: undefined,
          pageSize: store.pageSize
        }
        if (Art.config.convertPage) {
          pageInfo = Art.config.convertPage(pageInfo)
        }
        // 获取准备提交的请求体
        const _body = store.postBody(myConfig.postBody, undefined)
        // 获取请求体
        currentRequest = getRequest(
          request,
          _body,
          myConfig.method,
          undefined,
          pageInfo
        )
        // 发送请求
        return doRequestByInfiniteQuery<TData, TBody>(
          currentRequest,
          store,
          myConfig,
          request
        )
      }
    }
    return createRequest(config, abortController, requestFun, body, runConfig)
  }

  const queryByPage = (
    store: StoreType<QueryInfiniteStoreType<TData>>,
    pageConfig?: {
      current?: number
      pageSize?: number
    },
    runConfig?: FetchRunConfig
  ) => {
    const { current, pageSize } = pageConfig ?? {}
    if (current || pageSize) {
      store({
        current: current ?? store.current,
        pageSize: pageSize ?? store.pageSize
      })
    }
    return query(store, undefined, runConfig)
  }

  const queryNextPage = (
    store: StoreType<QueryInfiniteStoreType<TData>>,
    pageConfig?: {
      current?: number
    },
    runConfig?: FetchRunConfig
  ) => {
    const requestFun = (body?: Partial<TBody>, runConfig?: FetchRunConfig) => {
      const myConfig = { ...config, ...runConfig }
      if (pageConfig?.current) {
        if (pageConfig?.current > store.current + 1) {
          store.current = 1
        } else {
          store.current = pageConfig?.current
        }
      } else {
        store.current = store.current + 1
      }

      let pageInfo = {
        current: store.current,
        nextToken:
          store.pageTokens.length >= store.current
            ? store.pageTokens[store.current - 1]
            : undefined,
        pageSize: store.pageSize
      }
      if (Art.config.convertPage) {
        pageInfo = Art.config.convertPage(pageInfo)
      }

      // 设置body
      updateDefaultBody<TBody>(
        store,
        myConfig.replaceBody,
        myConfig.defaultBody,
        body
      )
      // 获取准备提交的请求体
      const _body = store.postBody(myConfig.postBody)
      // 获取请求体
      currentRequest = getRequest(
        request,
        _body,
        myConfig.method,
        undefined,
        pageInfo
      )
      // 发送请求
      return doRequestByInfinite<TData, TBody>(currentRequest, store, myConfig)
    }
    return createRequest(
      config,
      abortController,
      requestFun,
      undefined,
      runConfig
    )
  }

  const cancel = (store: StoreType<QueryStoreType>) => {
    fetchCancel(store, abortController, currentRequest)
  }

  const postBody = (
    store: StoreType<QueryStoreType<TData>>,
    postBody: (postBody: (body: FetchBody<TBody>) => any) => any,
    nextPageRequestBody?: () => Record<string, any>
  ) => {
    // 处理分页
    let _body
    if (nextPageRequestBody) {
      _body = nextPageRequestBody()
    } else {
      _body = store.body
    }
    return getPostBody(_body, postBody)
  }

  // 清理数据
  const clear = (store: StoreType<QueryInfiniteStoreType<TData>>) => {
    store({
      data: undefined,
      body: undefined,
      status: 'idle',
      total: 0,
      current: 1,
      isLoading: false,
      pageTokens: [undefined],
      isError: false,
      isSuccess: false,
      isLoadingNextPage: false,
      isErrorNextPage: false,
      hasNextPage: false
    })
  }

  return {
    state,
    method: {
      query,
      queryByPage,
      querySync,
      refresh,
      refreshSync,
      cancel,
      clear,
      postBody,
      queryNextPage
    }
  }
}
