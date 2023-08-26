import {
  CachedData,
  DefaultBodyType,
  FetchBody,
  FetchRunConfig,
  GetDefaultBody,
  Method,
  RefreshConfigType,
  RequestMode,
  RequestResult,
  RequestType,
  UseResult,
  FetchStatus,
  QueryConfig,
  MutationConfig,
  FetchConfig,
  FetchStoreType,
  QueryStoreType,
  QueryPageStoreType,
  QueryPageConfig,
  RequestTypeFunction,
  RequestTypePromise,
  QueryInfiniteStoreType
} from '../model'
import { Art } from '../art'
import { clearCache, createCacheKey, getCache, setCache } from '../utils/cache'
import { getAxiosRequest, handleAxiosError } from '../fetch/axios'
import { RequestMapping } from '../utils/request-mapping'
import { ID } from '../utils/ID'
import { getFetchRequest, handleFetchError } from '../fetch/default'
import { CancelablePromise } from '../utils/cancelable-promise'

/**
 * 处理默认请求体
 * @param store 状态管理
 * @param defaultBody 默认请求内容
 * @param body 动态请求参数
 */
export function updateDefaultBody<P>(
  store: FetchStoreType<any, P>,
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
 */
export function handlePageBody<R, P>(store: QueryStoreType<R, P>): any {
  let _body = store.body as any
  const _store = store as QueryPageStoreType<R, P>
  if (Art.config.convertPage) {
    _body = {
      ...(_body ?? {}),
      ...Art.config.convertPage(_store.current!, _store.pageSize!)
    }
  } else {
    _body = {
      ...(_body ?? {}),
      current: _store.current,
      pageSize: _store.pageSize
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
  body?: FetchBody<P>,
  postBody?: (body: FetchBody<P>) => any
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
export function getQueryConfig<TData, TBody>(
  config?: QueryConfig<TData, TBody>
): QueryConfig<TData, TBody> {
  // 初始化默认配置
  const defaultConfig: Partial<QueryConfig<TData, TBody>> = {
    status: true,
    loading: false,
    isDefaultSet: true,
    autoClear: false,
    cacheTime: 300000,
    revalidate: 0,
    retry: 3,
    showMessage: false,
    showSuccessMessage: false,
    showErrorMessage: true
  }
  // 得到当前配置
  return { ...defaultConfig, ...(config ?? {}) }
}

export function getQueryPageConfig<TData, TBody>(
  config?: QueryPageConfig<TData, TBody>
): QueryConfig<TData, TBody> {
  // 初始化默认配置
  const defaultConfig: Partial<QueryPageConfig<TData, TBody>> = {
    status: true,
    loading: false,
    isDefaultSet: true,
    autoClear: false,
    cacheTime: 300000,
    revalidate: 0,
    retry: 3,
    showMessage: false,
    showSuccessMessage: false,
    showErrorMessage: true,
    pageSize: 10,
    current: 1
  }
  // 得到当前配置
  return { ...defaultConfig, ...(config ?? {}) }
}

/**
 * 获取当前配置项目
 * @param config
 */
export function getMutationConfig<R, P>(
  config?: MutationConfig<R, P>
): MutationConfig<R, P> {
  // 初始化默认配置
  const defaultConfig: Partial<MutationConfig<R, P>> = {
    status: true,
    loading: false,
    isDefaultSet: true,
    showMessage: true,
    showSuccessMessage: true,
    showErrorMessage: true
  }
  // 得到当前配置
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
  if (config.loading) {
    if (config.startLoading) {
      config.startLoading()
    } else if (Art.config.startLoading && RequestMapping.empty()) {
      Art.config.startLoading()
    }
  }
}

/**
 * 处理结束loading
 * @param config
 */
export function handleEndLoading(config: {
  loading?: boolean
  endLoading?: () => void
}) {
  if (config.loading) {
    if (config.endLoading) {
      config.endLoading()
    } else if (Art.config.endLoading && RequestMapping.empty()) {
      Art.config.endLoading()
    }
  }
}

function isPromiseLike<T>(it: unknown): it is PromiseLike<T> {
  return it instanceof Promise || typeof (it as any)?.then === 'function'
}

/**
 * 发送请求接口
 * @param request 请求对象
 * @param store store
 * @param config 配置项目
 * @param setData 设置数据
 */
export async function doRequest<T, P>(
  request: RequestResult,
  store: FetchStoreType<T, P>,
  config: FetchConfig<T, P>,
  setData: (res: UseResult<T>) => void
): Promise<UseResult<T>> {
  // 处理开始loading
  handleStartLoading(config)

  const key = `request_${ID.generate()}`

  if (config.loading) {
    RequestMapping.put(key, request.request)
  }

  const setStatus = async (status: FetchStatus) => {
    const loadingWait = async () => {
      if (status !== 'loading' && config.loadingDelayMs) {
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

  let retryCount = config.retry ?? 0
  const requestFun = async () => {
    let result1: UseResult<T>
    // 请求接口
    const res = await request.request()

    const convertRes = config.convertRes ?? Art.config.convertRes

    // 转换数据
    if (convertRes) {
      const result = convertRes(res)
      if (isPromiseLike(result)) {
        result1 = (await result) as UseResult<T>
      } else {
        result1 = result as UseResult<T>
      }
    } else {
      result1 = res
    }

    if (result1.success) {
      // 设置原始值
      store.originData = result1.data
      // 转换成前端想要的数据格式
      if (config.postData) {
        result1.data = config.postData(result1.data)
      }
    }
    setData(result1)
    return result1
  }

  const retryFun = async (): Promise<UseResult<T>> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          retryCount--
          resolve(await requestFun())
        } catch (e) {
          // 处理异常
          myRes = handleRequestCatch(e, request.type) as UseResult<T>
          if (!myRes.isCancel && retryCount > 0) {
            resolve(await retryFun())
          } else {
            resolve(myRes)
          }
        }
      }, (config.retryInterval ?? 1) * 1000)
    })
  }

  try {
    // 设置状态
    await setStatus('loading')
    myRes = await requestFun()
    // 设置状态
    await setStatus(myRes.success ? 'success' : 'error')
  } catch (e) {
    // 处理异常
    myRes = handleRequestCatch(e, request.type) as UseResult<T>
    if (!myRes.isCancel) {
      const checkRetry = config.checkRetry ?? Art.config.checkRetry
      if (retryCount > 0 && (!checkRetry || checkRetry(myRes))) {
        myRes = await retryFun()
      }
    }
    // 设置状态
    await setStatus(
      myRes.success ? 'success' : myRes.isCancel ? 'success' : 'error'
    )
  }

  if (config.loading) {
    RequestMapping.del(key)
  }

  // 处理回调
  handleCallback<T, P>(config, myRes)

  // 处理消息
  handleMessage<T, P>(config, myRes)

  // 结束loading
  handleEndLoading(config)

  return myRes
}

/**
 * 发送请求接口
 * @param request 请求对象
 * @param store store
 * @param config 配置项目
 * @param setData 设置数据
 */
export async function doRequestByInfinite<T, P>(
  request: RequestResult,
  store: QueryInfiniteStoreType<T, P>,
  config: FetchConfig<T, P>,
  setData: (res: UseResult<T>) => void
): Promise<UseResult<T>> {
  const setStatus = async (status: FetchStatus) => {
    const loadingWait = async () => {
      if (status !== 'loading' && config.loadingDelayMs) {
        await waitTime(config.loadingDelayMs)
      }
    }

    if (config?.status) {
      await loadingWait()
      store.isLoadingNextPage = status === 'loading'
      store.isErrorNextPage = status === 'error'
    }
  }

  // 发送请求
  let myRes: UseResult<T>

  let retryCount = config.retry ?? 0
  const requestFun = async () => {
    let result1: UseResult<T>
    // 请求接口
    const res = await request.request()

    const convertRes = config.convertRes ?? Art.config.convertRes

    // 转换数据
    if (convertRes) {
      const result = convertRes(res)
      if (isPromiseLike(result)) {
        result1 = (await result) as UseResult<T>
      } else {
        result1 = result as UseResult<T>
      }
    } else {
      result1 = res
    }

    if (result1.success) {
      // 设置原始值
      store.originData = result1.data
      // 转换成前端想要的数据格式
      if (config.postData) {
        result1.data = config.postData(result1.data)
      }
    }
    setData(result1)
    return result1
  }

  const retryFun = async (): Promise<UseResult<T>> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          retryCount--
          resolve(await requestFun())
        } catch (e) {
          // 处理异常
          myRes = handleRequestCatch(e, request.type) as UseResult<T>
          if (!myRes.isCancel && retryCount > 0) {
            resolve(await retryFun())
          } else {
            resolve(myRes)
          }
        }
      }, (config.retryInterval ?? 1) * 1000)
    })
  }

  try {
    // 设置状态
    await setStatus('loading')
    myRes = await requestFun()
    // 设置状态
    await setStatus(myRes.success ? 'success' : 'error')
  } catch (e) {
    // 处理异常
    myRes = handleRequestCatch(e, request.type) as UseResult<T>
    if (!myRes.isCancel) {
      const checkRetry = config.checkRetry ?? Art.config.checkRetry
      if (retryCount > 0 && (!checkRetry || checkRetry(myRes))) {
        myRes = await retryFun()
      }
    }
    // 设置状态
    await setStatus(
      myRes.success ? 'success' : myRes.isCancel ? 'success' : 'error'
    )
  }

  // 处理回调
  handleCallback<T, P>(config, myRes)

  return myRes
}

// 处理消息
function handleMessage<T, P>(config: FetchConfig<T, P>, res: UseResult) {
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
function handleCallback<T, P>(config: FetchConfig<T, P>, res: UseResult<T>) {
  // 请求结束
  if (res.success) {
    if (config.onSuccess) {
      config.onSuccess(res.data!, res, false)
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
 * @param mode 请求模式
 */
function handleRequestCatch(e: any, mode: RequestMode): UseResult {
  let result
  if (mode === 'axios') {
    result = handleAxiosError(e)
  } else {
    result = handleFetchError(e)
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
 * @param fetchConfig 更多配置项目
 */
export function getRequest(
  request: RequestType,
  body?: any,
  method?: Method,
  fetchConfig?: any
): RequestResult {
  let _request: () => Promise<any>

  let _cancel: (() => void) | undefined
  let type: RequestMode = 'default'

  if (isPromiseLike(request)) {
    type = 'customize'
    _request = () => (request as RequestTypePromise)(body)
  } else {
    let url: string | undefined
    if (typeof request === 'function') {
      url = (request as RequestTypeFunction)(body)
    } else {
      url = request as string
    }
    const isPathParams = url.includes('{') && url.includes('}')
    const _method = method ?? (isPathParams ? 'GET' : body ? 'POST' : 'GET')
    const isPost = method === 'POST' || method === 'post'
    if (body && typeof body === 'object' && isPathParams) {
      Object.keys(body).forEach((key) => {
        // @ts-ignore
        url = url.replace(new RegExp('\\{' + key + '\\}', 'g'), body[key])
      })
    }

    if (Art.config.axios) {
      type = 'axios'
      const { request, cancel } = getAxiosRequest(
        _method,
        url,
        body ?? (isPost ? {} : undefined),
        fetchConfig
      )
      _request = request
      _cancel = cancel
    } else {
      const { request, cancel } = getFetchRequest(
        _method,
        url,
        body ?? (isPost ? {} : undefined),
        fetchConfig
      )
      _request = request
      _cancel = cancel
    }
  }
  return {
    request: _request,
    type,
    cancel: _cancel
  }
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

// 防抖函数
export function debounce<R, P>(
  request: (
    body?: Partial<P>,
    config?: FetchRunConfig
  ) => Promise<UseResult<R>>,
  abortController: AbortController,
  ms?: number
) {
  let timeout: any
  return (
    body?: Partial<P>,
    config?: FetchRunConfig
  ): Promise<UseResult<R>> => {
    clearTimeout(timeout)
    return CancelablePromise<UseResult<R>>((resolve, reject) => {
      if (ms) {
        timeout = setTimeout(async () => {
          const res = request(body, config)
          resolve(res)
        }, ms)
      } else {
        request(body, config).then(resolve).catch(reject)
      }
    }, abortController.signal)
  }
}

// 节流函数
export function throttle<R, P>(
  request: (
    body?: Partial<P>,
    config?: FetchRunConfig
  ) => Promise<UseResult<R>>,
  abortController: AbortController,
  waitMs: number
) {
  let timeout: any
  let old = 0
  return (
    body?: Partial<P>,
    config?: FetchRunConfig
  ): Promise<UseResult<R>> => {
    return CancelablePromise<UseResult<R>>((resolve, reject) => {
      const now = new Date().valueOf()
      if (!old) {
        old = now
      }
      if (now - old > waitMs) {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }
        request(body, config).then(resolve).catch(reject)
        old = now
      } else if (!timeout) {
        timeout = setTimeout(() => {
          old = new Date().valueOf()
          timeout = null
          request(body, config).then(resolve).catch(reject)
        }, waitMs)
      }
    }, abortController.signal)
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
  request: RequestType<P>,
  store: FetchStoreType<R, P>,
  res: UseResult<R>
) {
  if (!config.cache) {
    return
  }

  const key = getCacheKey(config, request, store)

  // TODO 分页逻辑之后处理
  // let pagination: PaginationType | undefined
  // try {
  //   if (config.pagination) {
  //     const { current, pageSize, total, offset } = store as FetchStoreType<R, P>
  //     pagination = { current: current!, pageSize: pageSize!, total, offset }
  //   }
  // } catch (e) {}

  setCache<UseResult<R>, P>(key, {
    body: store.body as P,
    data: res,
    time: new Date().getTime()
    // pagination
  })
}

export function getStoreCacheData<R, P>(
  config: QueryConfig<R, P>,
  request: RequestType<P>,
  store?: FetchStoreType<R, P>
) {
  if (!config.cache && (config.revalidate ?? 0) > 0) {
    config.cache = true
  }
  if (!config.cache) {
    return { cache: undefined, active: false }
  }

  const key = getCacheKey(config, request, store)

  const cache = getCache<UseResult<R>, P>(key)

  if (cache) {
    if ((config.cacheTime ?? 0) > 0) {
      const cacheTime = config.cacheTime! * 1000
      if (cacheTime < 0 || new Date().getTime() - cache.time <= cacheTime) {
        return { cache, active: true }
      } else {
        clearCache(key)
      }
    }
    return { cache, active: true }
  }
  return { cache: undefined, active: false }
}

export function getCacheRequest<R, P>(
  config: QueryConfig<R, P>,
  cache: CachedData<UseResult<R>, P>,
  store: QueryStoreType<R, P>
): Promise<UseResult<R>> {
  const res = cache.data
  if (config.onSuccess) {
    config.onSuccess(res.data!, res, true)
  }
  // if (cache.pagination) {
  //   try {
  //     const _store = store as FetchStoreType<R, P>
  //     const { current, pageSize, total, offset } = cache.pagination
  //     _store.current = current
  //     _store.pageSize = pageSize
  //     _store.total = total
  //     _store.offset = offset
  //   } catch (e) {}
  // }
  store.data = cache.data.data
  store.body = cache.body

  // 控制新鲜度, 如果过期新鲜度
  const revalidate = config.revalidate ?? 0
  if (
    revalidate >= 0 &&
    new Date().getTime() - cache.time > revalidate * 1000
  ) {
    store.query(undefined, { loading: false, status: false, refresh: true })
  }
  return new Promise((resolve) => resolve(res))
}

export function getCacheKey<R, P>(
  config: QueryConfig<R, P>,
  request: RequestType<P>,
  store?: FetchStoreType<R, P>
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
  } else if (store && typeof config.cache === 'function') {
    const ids = config.cache(store.body as P)
    key = createCacheKey(request as string, ids)
  } else {
    key = createCacheKey(request as string)
  }
  // TODO 分页逻辑之后处理
  // if (store && config.pagination) {
  //   const { current, pageSize } = store as FetchStoreType<R, P>
  //   return `${key}_${current}_${pageSize}`
  // }
  return key
}

export function doRefresh<R, P>(
  myConfig: QueryConfig<R, P>,
  store: QueryStoreType<R>,
  config?: RefreshConfigType
) {
  myConfig = {
    ...myConfig,
    loading: false,
    status: false,
    ...(config ?? {}),
    refresh: true
  }
  return store.querySync(undefined, myConfig)
}

// 设置返回数据
export function setResData<TData, TBody>(
  res: UseResult<TData>,
  myConfig: FetchConfig<TData, TBody>,
  store: FetchStoreType<TData>,
  request: RequestType<TBody>
) {
  if (res.success) {
    if (myConfig.isDefaultSet) {
      store.setRes(res)
    }
    // 记录最后时间
    store.lastRequestTime = new Date().getTime()
    // 处理缓存
    setStoreCacheData(myConfig, request, store, res)
  } else if (!res.isCancel) {
    store.error = { message: res.message, code: res.code, status: res.status }
  }
}

export function setResDataByInfinite<TData, TBody>(
  res: UseResult<TData>,
  myConfig: FetchConfig<TData, TBody>,
  store: FetchStoreType<TData>,
) {
  if (res.success) {
    if (myConfig.isDefaultSet) {
      store.setRes(res)
    }
    // 记录最后时间
    store.lastRequestTime = new Date().getTime()
  } else if (!res.isCancel) {
    store.error = { message: res.message, code: res.code, status: res.status }
  }
}

/**
 * 清理数据
 * @param store
 * @param config
 * @param request
 */
export function clearData<TData, TBody>(
  store: QueryStoreType,
  config: QueryConfig<TData, TBody>,
  request: RequestType<TBody>
) {
  store.originData = undefined
  store.data = undefined
  store.body = undefined
  const key = getCacheKey(config, request, store)
  if (key) {
    clearCache(key)
  }
}
