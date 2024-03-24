import {
  CachedData,
  DefaultBodyType,
  FetchBody,
  FetchRunConfig,
  GetDefaultBody,
  Method,
  RequestMode,
  RequestResult,
  RequestType,
  UseResult,
  QueryConfig,
  FetchConfig,
  FetchStoreType,
  QueryStoreType,
  RequestTypeFunction,
  RequestTypePromise,
  ErrorType,
  RequestPageBody
} from '../../model'
import { Art } from '../../art'
import {
  clearCache,
  createCacheKey,
  getCache,
  setCache
} from '../../utils/cache'
import { getAxiosRequest, handleAxiosError } from '../../fetch/axios'
import { RequestMapping } from '../../utils/request-mapping'
import { getFetchRequest, handleFetchError } from '../../fetch/default'
import { CancelablePromise } from '../../utils/cancelable-promise'
import { StoreType } from '../../utils/plugin-utils'

/**
 * 处理默认请求体
 * @param store 状态管理
 * @param replaceBody 是否重置
 * @param defaultBody 默认请求内容
 * @param body 动态请求参数
 */
export function updateDefaultBody<P>(
  store: FetchStoreType<any, P>,
  replaceBody?: boolean,
  defaultBody?: DefaultBodyType<P>,
  body?: Partial<P>
) {
  if (replaceBody) {
    store.body = body
    return
  }
  let _body
  if (defaultBody) {
    let _defaultBody
    if (typeof defaultBody === 'function') {
      _defaultBody = (defaultBody as GetDefaultBody<P>)()
    } else {
      _defaultBody = defaultBody
    }
    _body = { ...(store.body ?? {}), ..._defaultBody, ...(body ?? {}) }
  } else if (store.body || body) {
    _body = { ...(store.body ?? {}), ...(body ?? {}) }
  }
  store.body = _body
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

export function isPromiseLike<T>(it: unknown): it is PromiseLike<T> {
  return it instanceof Promise || typeof (it as any)?.then === 'function'
}

export const getError = (res?: UseResult): ErrorType | undefined => {
  if (res) {
    return { message: res.message, code: res.code, status: res.status }
  }
  return undefined
}

// 处理消息
export function handleMessage<T, P>(config: FetchConfig<T, P>, res: UseResult) {
  if (
    res.success &&
    (config.showSuccessMessage || config.showMessage) &&
    Art.config.showSuccessMessage
  ) {
    if (config.successMessage) {
      res.message = config.successMessage
    }
    Art.config.showSuccessMessage(res)
  } else if (
    !res.success &&
    (config.showErrorMessage || config.showMessage) &&
    Art.config.showErrorMessage
  ) {
    if (config.errorMessage) {
      res.message = config.errorMessage
    }
    Art.config.showErrorMessage(res)
  }
}

// 处理回调
export function handleCallback<T, P>(
  config: FetchConfig<T, P>,
  res: UseResult<T>
) {
  // 请求结束
  if (res.success) {
    if (config.onSuccess) {
      config.onSuccess(res.data!, false, res.isSame)
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
export function handleRequestCatch(e: any, mode: RequestMode): UseResult {
  let result
  if (mode === 'axios') {
    result = handleAxiosError(e)
  } else if (mode === 'default') {
    result = handleFetchError(e)
  } else if (Art.config.handleCustomHttpError) {
    result = Art.config.handleCustomHttpError(e)
  }

  if (Art.config.handleHttpError) {
    Art.config.handleHttpError(e)
  }
  console.log(e)
  return result ?? { success: false }
}

export function fetchCancel(
  store: StoreType<FetchStoreType>,
  abortController: AbortController,
  currentRequest?: RequestResult
) {
  if (currentRequest?.cancel) {
    currentRequest?.cancel!()
  }
  abortController.abort()
  store.setStatus('idle')
}

/**
 * 创建请求
 * @param request 请求或者地址
 * @param body 请求阐述
 * @param method 方法
 * @param fetchConfig 更多配置项目
 * @param page 分页信息
 */
export function getRequest(
  request: RequestType,
  body?: any,
  method?: Method,
  fetchConfig?: any,
  page?: RequestPageBody
): RequestResult {
  let _request: (() => Promise<any>) | undefined

  let _cancel: (() => void) | undefined
  let type: RequestMode = 'default'
  let _body = body

  if (page) {
    // @ts-ignore
    _body = { ...page, ...(_body ?? {}) }
  }

  let url: string | undefined
  if (typeof request === 'function') {
    const result = (request as RequestTypeFunction | RequestTypePromise)(_body)
    if (isPromiseLike(result)) {
      type = 'customize'
      _request = () => result
    } else {
      url = result
    }
  } else {
    url = request as string
  }
  if (url) {
    const isPathParams = url.includes('{') && url.includes('}')
    const _method = method ?? (isPathParams ? 'GET' : _body ? 'POST' : 'GET')
    const isPost = method === 'POST' || method === 'post'
    if (_body && typeof _body === 'object' && isPathParams) {
      Object.keys(body).forEach((key) => {
        // @ts-ignore
        url = url.replace(new RegExp('\\{' + key + '\\}', 'g'), _body[key])
      })
    }

    if (Art.config.axios) {
      type = 'axios'
      const { request, cancel } = getAxiosRequest(
        _method,
        url,
        _body ?? (isPost ? {} : undefined),
        fetchConfig
      )
      _request = request
      _cancel = cancel
    } else {
      const { request, cancel } = getFetchRequest(
        _method,
        url,
        _body ?? (isPost ? {} : undefined),
        fetchConfig
      )
      _request = request
      _cancel = cancel
    }
  }
  return {
    request: _request!,
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

export function createRequest<R, P>(
  config: {
    throttleMs?: number
    debounceMs?: number
  },
  abortController: AbortController,
  requestFun: (
    body?: Partial<P>,
    config?: FetchRunConfig
  ) => Promise<UseResult<R>>,
  body?: Partial<P>,
  runConfig?: FetchRunConfig
) {
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
  store: StoreType<FetchStoreType<R, P>>,
  res: UseResult<R>
) {
  if (!config.cache && res.data) {
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

  setCache<R, P>(key, {
    body: store.body as P,
    data: res.data!,
    time: new Date().getTime()
    // pagination
  })
}

export function getStoreCacheData<R, P>(
  config: QueryConfig<R, P>,
  request: RequestType<P>,
  store?: StoreType<FetchStoreType<R, P>>
) {
  if (!config.cache && (config.revalidate ?? 0) > 0) {
    config.cache = true
  }
  if (!config.cache) {
    return { cache: undefined, active: false }
  }

  const key = getCacheKey(config, request, store)

  const cache = getCache<R, P>(key)

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
  cache: CachedData<R, P>,
  store: StoreType<QueryStoreType<R, P>>
): Promise<UseResult<R>> {
  if (config.onSuccess) {
    config.onSuccess(cache.data!, true)
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

  if (!resultDataIsSame(cache.data, store.data)) {
    store({ data: cache.data, body: cache.body })
  }

  // 控制新鲜度, 如果过期新鲜度
  const revalidate = config.revalidate ?? 0
  if (
    revalidate >= 0 &&
    new Date().getTime() - cache.time > revalidate * 1000
  ) {
    store.query(undefined, {
      loading: config.cacheLoading ?? config.loading,
      status: config.cacheStatus ?? false,
      refresh: true
    })
  }
  return new Promise((resolve) => resolve({ data: cache.data, success: true }))
}

export function resultDataIsSame<T>(newData: T, oldData?: T) {
  try {
    if (oldData && newData) {
      return JSON.stringify(newData) === JSON.stringify(oldData)
    }
  } catch (e) {}
  return false
}

export function getCacheKey<R, P>(
  config: QueryConfig<R, P>,
  request: RequestType<P>,
  store?: StoreType<FetchStoreType<R, P>>
) {
  let key

  if (config.cache === true || typeof config.cache === 'function') {
    if (typeof request === 'function') {
      if (store?.body) {
        const _request = request(store.body as any)
        if (typeof _request === 'string') {
          key = _request
        } else {
          throw new Error(
            'When request is a function, the configuration item cache can only be a string'
          )
        }
      } else {
        throw new Error(
          'When request is a function, the configuration item cache can only be a string'
        )
      }
    }
  }

  if (typeof config.cache === 'string') {
    key = createCacheKey(request as string, config.cache)
  } else if (store && typeof config.cache === 'function') {
    const suffix = config.cache(store.body as P)
    key = createCacheKey(request as string, suffix)
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

/**
 * 清理数据
 * @param store
 * @param config
 * @param request
 */
export function clearLocalData<TData, TBody>(
  store: StoreType<QueryStoreType>,
  config: QueryConfig<TData, TBody>,
  request: RequestType<TBody>
) {
  const key = getCacheKey(config, request, store)
  if (key) {
    clearCache(key)
  }
}
