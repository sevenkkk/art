import {
  CachedData,
  DefaultBodyType,
  GetDefaultBody,
  Method,
  PaginationType,
  QueryBody,
  QueryConfig,
  QueryRunConfig,
  QueryStoreType,
  RefreshConfigType,
  RequestResult,
  RequestType,
  StoreType,
  SubmitStoreType,
  UseResult,
  ViewState
} from './model'
import { Art } from './art'
import { clearCache, createCacheKey, getCache, setCache } from './cache'
import { getAxiosRequest, handleError } from './axios'

/**
 * 默认状态
 */
export function getDefaultState() {
  return {
    isBusy: false,
    isError: false,
    status: ViewState.idle,
    isEmpty: undefined,
    error: undefined,
    lastRequestTime: undefined,
    body: undefined,
    originData: undefined,
    data: undefined
  }
}

/**
 * 处理默认请求体
 * @param store 状态管理
 * @param defaultBody 默认请求内容
 * @param body 动态请求参数
 */
export function updateDefaultBody<P>(
  store: StoreType<any, P>,
  defaultBody?: DefaultBodyType<P>,
  body?: Partial<P>
) {
  let _body
  if (defaultBody) {
    let _defaultBody
    if (typeof defaultBody === 'function') {
      _defaultBody = (defaultBody as GetDefaultBody<P>)()
    } else {
      _defaultBody = defaultBody
    }
    _body = { ..._defaultBody, ...(body ?? {}) }
  } else {
    _body = body
  }
  store.body = _body
}

/**
 * 添加分页请求参数
 * @param store
 * @param usePage 是否使用分页
 */
export function handlePageBody<R, P>(
  store: StoreType<R, P>,
  usePage?: boolean
): any {
  let _body = store.body as any
  if (usePage) {
    const _store = store as QueryStoreType<R, P>
    if (Art.config.handlePage) {
      _body = {
        ...(_body ?? {}),
        ...Art.config.handlePage(_store.current!, _store.pageSize!)
      }
    } else {
      _body = {
        ...(_body ?? {}),
        current: _store.current,
        pageSize: _store.pageSize
      }
    }
  }
  return _body
}

/**
 * 转化成提交之前的请求体
 * @param body
 * @param postBody
 */
export function getPostBody<P>(
  body?: QueryBody<P>,
  postBody?: (body: QueryBody<P>) => any
) {
  let _body = body
  if (postBody && _body) {
    _body = postBody(_body)
  }
  return _body
}

/**
 * 自动清除
 * @param store
 * @param autoClear
 */
export function autoClear(store: { clear: () => void }, autoClear?: boolean) {
  if (autoClear) {
    store.clear()
  }
}

/**
 * 获取当前配置项目
 * @param config
 */
export function getMyConfig<R, P>(
  config?: QueryConfig<R, P>
): QueryConfig<R, P> {
  // 初始化默认配置
  const defaultConfig = {
    status: true,
    loading: false,
    isDefaultSet: true,
    autoClear: false,
    cacheTime: 300000,
    staleTime: 0,
    showMessage: true,
    showSuccessMessage: false,
    showErrorMessage: true
  } as QueryConfig<R, P>
  // 得到当前配置
  // @ts-ignore
  return { ...defaultConfig, ...(config ?? {}) }
}

/**
 * 处理开始loading
 * @param config
 */
export function handleStartLoading(config: {
  loading?: boolean
  startLoading?: () => void
}) {
  if (config.loading && config.startLoading) {
    config.startLoading()
  }
}

/**
 * 处理结束loading
 * @param config
 */
export function handleEndLoading(config: {
  loading?: boolean
  startLoading?: () => void
}) {
  if (config.loading && config.startLoading) {
    config.startLoading()
  }
}

export async function doRequest<T, P>(
  request: RequestResult,
  store: SubmitStoreType<T, P>,
  config: QueryConfig<T, P>,
  setData: (res: UseResult<T>) => void
): Promise<UseResult<T>> {
  // 处理开始loading
  handleStartLoading(config)

  const setStatus = async (status: ViewState) => {
    const loadingWait = async () => {
      if (status !== ViewState.busy && config.loadingDelayMs) {
        await waitTime(config.loadingDelayMs)
      }
    }

    if (config?.status) {
      await loadingWait()
      store.setStatus(status)
    }
  }

  // 发送请求
  let myRes: UseResult<T>
  try {
    // 设置状态
    await setStatus(ViewState.busy)
    // 请求接口
    const res = await request.request()
    // 转换数据
    myRes = config.convertRes
      ? config.convertRes(res)
      : Art.config.convertRes
      ? Art.config.convertRes(res)
      : res
    // 设置原始值
    store.originData = myRes.data
    // 转换成前端想要的数据格式
    if (config.postData) {
      myRes.data = config.postData(myRes.data)
    }
    // 设置状态
    await setStatus(ViewState.idle)
  } catch (e) {
    // 处理异常
    myRes = handleRequestCatch(e, request) as UseResult<T>
    if (!myRes.isCancel) {
      // 设置状态
      await setStatus(ViewState.error)
    } else {
      // 设置状态
      await setStatus(ViewState.idle)
    }
  }

  setData(myRes)

  // 处理回调
  handleCallback<T, P>(config, myRes)

  // 处理消息
  handleMessage<T, P>(config, myRes)

  // 结束loading
  handleEndLoading(config)
  return myRes
}

// 处理消息
function handleMessage<T, P>(config: QueryConfig<T, P>, res: UseResult) {
  if (config.showMessage) {
    if (
      res.success &&
      config.showSuccessMessage &&
      Art.config.showSuccessMessage
    ) {
      Art.config.showSuccessMessage(res)
    } else if (
      !res.success &&
      config.showErrorMessage &&
      Art.config.showErrorMessage
    ) {
      Art.config.showErrorMessage(res)
    }
  }
}

// 处理回调
function handleCallback<T, P>(config: QueryConfig<T, P>, res: UseResult<T>) {
  // 请求结束
  if (res.success) {
    if (config.onSuccess) {
      config.onSuccess(res, false)
    }
  } else if (!res.isCancel) {
    if (config.onError) {
      config.onError(res)
    }
  }
  if (config.onComplete) {
    config.onComplete(res)
  }
}

/**
 * 处理请求失败
 * @param e
 * @param request
 */
function handleRequestCatch(e: any, request: RequestResult): UseResult {
  let result = { success: false, isCancel: false, message: e } as UseResult
  if (request.type === 'axios') {
    result = handleError(e)
  }

  if (Art.config.handleHttpError) {
    Art.config.handleHttpError(e)
  }
  console.log(e)
  return result
}

/**
 * 创建请求
 * @param request 请求或者地址
 * @param body 请求阐述
 * @param method 方法
 */
export function getRequest(
  request: RequestType | string,
  body?: any,
  method?: Method
): RequestResult {
  let _request: () => Promise<any>

  let source: any

  if (typeof request === 'function') {
    _request = () => request(body)
  } else {
    let url = request as string
    const isPathParams = url.includes('{') && url.includes('}')
    const _method = method ?? (isPathParams ? 'GET' : body ? 'POST' : 'GET')
    const isPost = method === 'POST' || method === 'post'
    if (body && typeof body === 'object' && isPathParams) {
      Object.keys(body).forEach((key) => {
        // @ts-ignore
        url = url.replace(new RegExp('\\{' + key + '\\}', 'g'), body[key])
      })
    }

    if (Art.config.axios != null) {
      source = Art.config.axios?.axios.CancelToken.source()
      _request = () =>
        getAxiosRequest(_method, url, body ?? (isPost ? {} : undefined), {
          cancelToken: source.token
        })
    } else {
      throw new Error(
        'Art must pass in the http object, currently only supports axios'
      )
    }
  }
  return { request: _request, type: 'axios', source }
}

export function setBody<P>(
  store: { body?: Partial<P> },
  inBody: Partial<P>,
  replace = false
): void {
  const { body } = store
  if (body && !replace) {
    store.body = { ...inBody, ...store.body }
  } else {
    store.body = inBody
  }
}

/**
 * 延迟等待
 * @param time 等待时间
 */
export const waitTime = (time = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, time)
  })
}

/**
 * 处理请求
 * @param request
 * @param config
 */
export function doRun<R, P>(
  request: (
    body?: Partial<P>,
    config?: QueryRunConfig
  ) => Promise<UseResult<R>>,
  config: QueryConfig<R, P>
) {
  if (config.throttleMs) {
    return throttle(request, config.throttleMs)
  }
  return debounce(request, config.debounceMs)
}

// 防抖函数
export function debounce<R, P>(
  request: (
    body?: Partial<P>,
    config?: QueryRunConfig
  ) => Promise<UseResult<R>>,
  ms?: number
) {
  let timeout: any
  return (
    body?: Partial<P>,
    config?: QueryRunConfig
  ): Promise<UseResult<R>> => {
    clearTimeout(timeout)
    return new Promise((resolve) => {
      if (ms) {
        timeout = setTimeout(() => {
          resolve(request(body, config))
        }, ms)
      } else {
        resolve(request(body, config))
      }
    })
  }
}

// 节流函数
export function throttle<R, P>(
  request: (
    body?: Partial<P>,
    config?: QueryRunConfig
  ) => Promise<UseResult<R>>,
  waitMs: number
) {
  let timeout: any
  let old = 0
  return (
    body?: Partial<P>,
    config?: QueryRunConfig
  ): Promise<UseResult<R>> => {
    return new Promise((resolve) => {
      const now = new Date().valueOf()
      if (!old) {
        old = now
      }
      if (now - old > waitMs) {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        resolve(request(body, config))
        old = now
      } else if (!timeout) {
        timeout = setTimeout(() => {
          old = new Date().valueOf()
          timeout = null
          resolve(request(body, config))
        }, waitMs)
      }
    })
  }
}

/**
 * 处理数据缓存
 * @param config
 * @param request
 * @param store
 * @param res
 */
export function setStoreCacheData<R, P>(
  config: QueryConfig<R, P>,
  request: RequestType<P> | string,
  store: StoreType<R, P>,
  res: UseResult<R>
) {
  if (!config.cache) {
    return
  }

  const key = getCacheKey(config, request, store)

  let pagination: PaginationType | undefined
  try {
    if (config.usePage) {
      const { current, pageSize, total, offset } = store as QueryStoreType<R, P>
      pagination = { current: current!, pageSize: pageSize!, total, offset }
    }
  } catch (e) {}

  setCache<UseResult<R>, P>(key, {
    body: store.body as P,
    data: res,
    time: new Date().getTime(),
    pagination
  })
}

export function getStoreCacheData<R, P>(
  config: QueryConfig<R, P>,
  request: RequestType<P> | string,
  store: StoreType<R, P>
) {
  if (!config.cache) {
    return { cache: undefined, active: false }
  }

  const key = getCacheKey(config, request, store)

  const cache = getCache<UseResult<R>, P>(key)

  if (cache) {
    const cacheTime = config.cacheTime ?? 300000
    if (cacheTime < 0 || new Date().getTime() - cache.time <= cacheTime) {
      return { cache, active: true }
    } else {
      clearCache(key)
    }
  }
  return { cache: undefined, active: false }
}

export function getCacheRequest<R, P>(
  config: QueryConfig<R, P>,
  cache: CachedData<UseResult<R>, P>,
  store: StoreType<R, P>
): Promise<UseResult<R>> {
  const res = cache.data
  if (config.onSuccess) {
    config.onSuccess(res, true)
  }
  if (cache.pagination) {
    try {
      const _store = store as QueryStoreType<R, P>
      const { current, pageSize, total, offset } = cache.pagination
      _store.current = current
      _store.pageSize = pageSize
      _store.total = total
      _store.offset = offset
    } catch (e) {}
  }
  store.data = cache.data.data
  store.body = cache.body

  // 控制新鲜度, 如果过期新鲜度
  const staleTime = config.staleTime ?? 0
  if (staleTime >= 0 && new Date().getTime() - cache.time > staleTime) {
    store
      .run(undefined, { loading: false, status: false, refresh: true })
      .then()
  }
  return new Promise((resolve) => resolve(res))
}

export function getCacheKey<R, P>(
  config: QueryConfig<R, P>,
  request: RequestType<P> | string,
  store: StoreType<R, P>
) {
  let key

  if (config.cache === true || typeof config.cache === 'function') {
    if (typeof request === 'function') {
      throw new Error(
        'When request is a function, the configuration item cache can only be a string'
      )
    }
  }

  if (typeof config.cache === 'string') {
    key = createCacheKey(config.cache)
  } else if (typeof config.cache === 'function') {
    const ids = config.cache(store.body as P)
    key = createCacheKey(request as string, ids)
  } else {
    key = createCacheKey(request as string)
  }
  if (config.usePage) {
    const { current, pageSize } = store as QueryStoreType<R, P>
    return `${key}_${current}_${pageSize}`
  }
  return key
}

export function setStatus(store: StoreType, status: ViewState) {
  store.status = status
  store.isError = status === ViewState.error
  store.isBusy = status === ViewState.busy
}

export function setPage<R>(
  config: {
    current?: number
    pageSize?: number
    autoRun?: boolean
  },
  store: QueryStoreType<R>
): void {
  const { current, pageSize } = config ?? {}
  if (current) {
    store.current = current
  }
  if (pageSize) {
    store.pageSize = pageSize
  }
}

export function setPageRun<R>(
  config: {
    current?: number
    pageSize?: number
  },
  store: QueryStoreType<R>
): Promise<UseResult<R>> {
  setPage(config, store)
  return store.run()
}

export function refresh<R, P>(
  myConfig: QueryConfig<R, P>,
  store: StoreType<R>,
  request: RequestType<P> | string,
  currentRequest: RequestResult | undefined,
  config?: RefreshConfigType
) {
  myConfig = {
    ...myConfig,
    loading: false,
    status: false,
    ...(config ?? {}),
    refresh: true
  }
  if (!currentRequest) {
    return store.run(undefined, myConfig)
  } else {
    return doRequest<R, P>(currentRequest, store, myConfig, (res) =>
      setResData(res, myConfig, store, request)
    )
  }
}

export function cancel(
  currentRequest: RequestResult | undefined,
  message?: string
) {
  if (currentRequest) {
    if (currentRequest.type === 'axios') {
      // eslint-disable-next-line no-unused-expressions
      currentRequest.source?.cancel(message)
    }
  }
}

export function getRequestFun<R, P>(
  myConfig: QueryConfig<R, P>,
  store: StoreType<R>,
  request: RequestType<P> | string,
  currentRequest: RequestResult | undefined,
  body?: Partial<P>,
  config?: QueryRunConfig
): Promise<UseResult<R>> {
  myConfig = { ...myConfig, ...config }
  // 清除
  autoClear(store, myConfig.autoClear)

  // 获取缓存
  const { cache, active } = getStoreCacheData<R, P>(myConfig, request, store)

  // 如果有缓存 并且缓存有效
  if (!config?.refresh && cache && active) {
    return getCacheRequest<R, P>(myConfig, cache, store)
  } else {
    // 设置body
    updateDefaultBody<P>(store, myConfig.defaultBody, body)
    // 处理分页
    let _body = handlePageBody(store, myConfig.usePage)
    // 获取准备提交的请求体
    _body = getPostBody(_body, myConfig.postBody)
    // 获取请求体
    currentRequest = getRequest(request, _body, myConfig.method)
    // 发送请求
    return doRequest<R, P>(currentRequest, store, myConfig, (res) =>
      setResData(res, myConfig, store, request)
    )
  }
}

// 设置返回数据
function setResData<R, P>(
  res: UseResult<R>,
  myConfig: QueryConfig<R, P>,
  store: StoreType<R>,
  request: RequestType<P> | string
) {
  if (res.success) {
    if (myConfig.isDefaultSet) {
      store.setData(res.data)
      if (myConfig.usePage) {
        ;(store as QueryStoreType).total = res.total ?? 0
      }
    }
    if (myConfig?.status && store?.status !== ViewState.error) {
      store.isEmpty =
        !res.data || (res.data && res.data instanceof Array && !res.data.length)
    }
    // 记录最后时间
    store.lastRequestTime = new Date().getTime()

    // 处理缓存
    setStoreCacheData(myConfig, request, store, res)
  } else if (!res.isCancel) {
    store.error = { message: res.message, code: res.code, status: res.status }
  }
}
