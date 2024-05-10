import {
  RefreshConfigType,
  QueryConfig,
  QueryStoreType,
  RequestResult,
  FetchStoreType,
  FetchConfig,
  RequestType,
  UseResult,
  FetchStatus,
  FetchStatusStoreType
} from '../../model'
import { StoreType } from '../../utils/plugin-utils'
import { ID } from '../../utils/ID'
import { RequestMapping } from '../../utils/request-mapping'
import { Art } from '../../art'
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
    retry: 0,
    showMessage: false,
    showSuccessMessage: false,
    showErrorMessage: true
  }
  // 得到当前配置
  return { ...defaultConfig, ...(config ?? {}) }
}

export function doRefresh<R, P>(
  myConfig: QueryConfig<R, P>,
  store: StoreType<QueryStoreType<R>>,
  config?: RefreshConfigType
) {
  myConfig = {
    ...myConfig,
    loading: false,
    status: false,
    ...(config ?? {}),
    refresh: true
  }
  return store.query(undefined, myConfig)
}

/**
 * 发送请求接口
 * @param request 请求对象
 * @param store store
 * @param config 配置项目
 * @param baseRequest 原始请求
 */
export async function doRequest<T, P>(
  request: RequestResult,
  store: StoreType<FetchStoreType<T, P>>,
  config: FetchConfig<T, P>,
  baseRequest?: RequestType<P>
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
    retryCount--
    let result1: UseResult<T>
    request.isFetch = true
    // 请求接口
    const res = await request.request()

    request.isFetch = false

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
      result1.isSame = true
      const isSome = resultDataIsSame(postData, store.data)
      if (config.isDefaultSet) {
        if (!isSome) {
          store({
            lastRequestTime,
            originData: result1.data,
            data: postData,
            ...status
          })
        } else {
          store({
            lastRequestTime,
            ...status
          })
        }
      } else {
        store({
          lastRequestTime,
          ...status
        })
      }
      result1.data = postData
      if (baseRequest) {
        // 处理缓存
        setStoreCacheData(config, baseRequest, store, result1)
      }
    } else {
      store({
        lastRequestTime,
        isError: true,
        isSuccess: false,
        isLoading: false,
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
          resolve(await requestFun())
        } catch (e) {
          console.log(e)
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
