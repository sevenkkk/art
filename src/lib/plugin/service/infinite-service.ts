import {
  RequestResult,
  RequestType,
  UseResult,
  FetchStatus,
  QueryInfiniteStoreType,
  FetchStatusStoreType,
  QueryInfiniteConfig,
  ErrorType
} from '../../model'
import { Art } from '../../art'

import { RequestMapping } from '../../utils/request-mapping'
import { ID } from '../../utils/ID'
import { StoreType } from '../../utils/plugin-utils'
import {
  getError,
  handleCallback,
  handleEndLoading,
  handleMessage,
  handleRequestCatch,
  handleStartLoading,
  isPromiseLike,
  resultDataIsSame,
  setStoreCacheData,
  waitTime
} from './fetch-service'

/**
 * 发送请求接口
 * @param request 请求对象
 * @param store store
 * @param config 配置项目
 * @param baseRequest 原始请求
 */
export async function doRequestByInfiniteQuery<T extends Array<unknown>, P>(
  request: RequestResult,
  store: StoreType<QueryInfiniteStoreType<T, P>>,
  config: QueryInfiniteConfig<T, P>,
  baseRequest: RequestType<P>
): Promise<UseResult<T>> {
  // 处理开始loading
  handleStartLoading(config)

  const key = `request_${ID.generate()}`

  if (config.loading) {
    RequestMapping.put(key, request.request)
  }

  const setStatus = async (status: FetchStatus, res?: UseResult<T>) => {
    const loadingWait = async () => {
      if (status === 'loading' && config.loadingDelayMs) {
        await waitTime(config.loadingDelayMs)
      }
    }

    if (config?.status) {
      await loadingWait()
      store.setStatus(status, getError(res))
    }
  }

  // 发送请求
  let myRes: UseResult<T>

  let retryCount = config.retry ? config.retry : (config.retryInterval ? 999999999 : 0)
  const requestFun = async () => {
    let result1: UseResult<T>
    // 请求接口
    const res = await request.request()

    const convertRes = config.convertRes ?? Art.config.convertRes

    // 转换数据
    if (convertRes) {
      const result = convertRes(res, request.type)
      if (isPromiseLike(result)) {
        result1 = (await result) as UseResult<T>
      } else {
        result1 = result as UseResult<T>
      }
    } else {
      result1 = res
    }

    const lastRequestTime = new Date().getTime()
    if (result1.success) {
      // 设置原始值
      let postData = result1.data
      // 转换成前端想要的数据格式
      if (config.postData) {
        postData = config.postData(result1.data)
      }
      const status: Partial<FetchStatusStoreType> = {
        status: 'success',
        isSuccess: true,
        isError: false,
        isLoading: false,
        error: undefined
      }
      if (config.isDefaultSet) {
        if (!resultDataIsSame(postData, store.data)) {
          const nextToken = config.getNextToken
            ? config.getNextToken(res)
            : undefined
          const hasNextPage = config.hasNextPage
            ? config.hasNextPage(res)
            : config.getNextToken
              ? !!nextToken
              : result1.data?.length === store.pageSize
          const pageTokens = config.getNextToken
            ? nextToken
              ? [...store.pageTokens.splice(0, store.current), nextToken]
              : store.pageTokens.splice(0, store.current)
            : [undefined]
          store({
            lastRequestTime,
            data: postData,
            current: 1,
            total: result1.total ?? 0,
            pageTokens,
            hasNextPage,
            isLoadingNextPage: false,
            isErrorNextPage: false,
            ...status
          })
        } else {
          store({ isLoading: false })
        }
      } else {
        store({
          lastRequestTime,
          ...status,
          current: 1,
          isLoadingNextPage: false,
          isErrorNextPage: false
        })
      }
      result1.data = postData
      // 处理缓存
      setStoreCacheData(config, baseRequest, store, result1)
    } else {
      store({
        lastRequestTime,
        isError: true,
        isSuccess: false,
        current: 1,
        isLoading: false,
        isLoadingNextPage: false,
        isErrorNextPage: false,
        status: 'error',
        error: getError(res)
      })
    }
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
    if (!myRes.success) {
      // 设置状态
      await setStatus('error', myRes)
    }
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
 */
export async function doRequestByInfinite<T extends Array<unknown>, P>(
  request: RequestResult,
  store: StoreType<QueryInfiniteStoreType<T, P>>,
  config: QueryInfiniteConfig<T, P>
): Promise<UseResult<T>> {
  const setStatus = async (status: FetchStatus, error?: ErrorType) => {
    const loadingWait = async () => {
      if (status === 'loading' && config.loadingDelayMs) {
        await waitTime(config.loadingDelayMs)
      }
    }

    if (config?.status) {
      await loadingWait()
      if (error) {
        store({
          isLoadingNextPage: status === 'loading',
          isErrorNextPage: status === 'error',
          error
        })
      } else {
        store({
          isLoadingNextPage: status === 'loading',
          isErrorNextPage: status === 'error'
        })
      }
    }
  }

  // 发送请求
  let myRes: UseResult<T>

  let retryCount = config.retry ? config.retry : (config.retryInterval ? 999999999 : 0)
  const requestFun = async () => {
    let result1: UseResult<T>
    // 请求接口
    const res = await request.request()

    const convertRes = config.convertRes ?? Art.config.convertRes

    // 转换数据
    if (convertRes) {
      const result = convertRes(res, request.type)
      if (isPromiseLike(result)) {
        result1 = (await result) as UseResult<T>
      } else {
        result1 = result as UseResult<T>
      }
    } else {
      result1 = res
    }
    const lastRequestTime = new Date().getTime()
    if (result1.success) {
      // 设置原始值
      let postData = result1.data
      // 转换成前端想要的数据格式
      if (config.postData) {
        postData = config.postData(result1.data)
      }
      const status: Partial<QueryInfiniteStoreType<T>> = {
        isLoadingNextPage: false,
        isErrorNextPage: false
      }
      const nextToken = config.getNextToken
        ? config.getNextToken(res)
        : undefined
      const hasNextPage = config.hasNextPage
        ? config.hasNextPage(res)
        : config.getNextToken
          ? !!nextToken
          : result1.data?.length === store.pageSize
      const pageTokens = config.getNextToken
        ? nextToken
          ? [...store.pageTokens.splice(0, store.current), nextToken]
          : store.pageTokens.splice(0, store.current)
        : [undefined]
      const infinite = config.infinite ?? false
      if (config.isDefaultSet) {
        store({
          data: infinite
            ? ([
              ...((store.data ?? []) as Array<any>),
              ...((postData ?? []) as Array<any>)
            ] as any)
            : ((postData ?? []) as Array<any>),
          ...status,
          total: result1.total ?? 0,
          hasNextPage,
          pageTokens
        })
      } else {
        store({
          ...status
        })
      }
      result1.data = postData
    } else {
      store({
        lastRequestTime,
        isError: true,
        isSuccess: false,
        isLoading: false,
        status: 'error',
        error: { message: res.message, code: res.code, status: res.status }
      })
    }
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
    if (!myRes.success) {
      // 设置状态
      await setStatus('error', getError(myRes))
    }
  }

  // 处理回调
  handleCallback<T, P>(config, myRes)

  return myRes
}
