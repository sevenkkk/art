export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK'

/**
 * API request status
 */
export enum ViewState {
  idle,
  busy,
  error
}

/**
 * API return value object
 */
export interface UseResult<T = unknown> {
  success?: boolean
  data?: T
  message?: string
  code?: string
  status?: number
  total?: number
  isCancel?: boolean
  other?: any
}

export type GetDefaultBody<T> = () => Partial<T>
export type DefaultBodyType<T> = GetDefaultBody<T> | Partial<T>

export type RequestType<T = unknown> = (body?: Partial<T>) => Promise<any>
export type BaseConfig<R = unknown, P = unknown> = {
  status?: boolean
  loading?: boolean
  isDefaultSet?: boolean
  startLoading?: () => void
  endLoading?: () => void
  defaultBody?: DefaultBodyType<P> // 默认请求体
  method?: Method // 方法
  postBody?: (body: QueryBody<P>) => any // 转换body
  autoClear?: boolean // 自动清空
  showMessage?: boolean // 是否显示成功失败消息
  showErrorMessage?: boolean // 是否显示错误消息
  showSuccessMessage?: boolean // 是否显示成功消息
  onSuccess?: (data: R, res: UseResult<R>, cache: boolean) => void
  onError?: (res: UseResult<R>) => void
  onComplete?: (res: UseResult<R>) => void
  convertRes?: (res: any) => UseResult<R>
  postData?: (data: any) => R
  loadingDelayMs?: number
  debounceMs?: number
  throttleMs?: number
  cache?: boolean | string | ((body?: P) => string[])
  cacheTime?: number // 设置缓存数据回收时间 默认缓存数据 5 分钟后回收
  staleTime?: number // 缓存数据保持新鲜时间
}

export type ErrorType = {
  message?: string
  code?: string
  status?: number
  info?: any
}

export type StorePageConfig = {
  usePage?: boolean
  pageSize?: number
}

export type SubmitConfig<R = unknown, P = unknown> = BaseConfig<R, P> &
  QueryRunConfig

export type QueryConfig<R = unknown, P = unknown> = BaseConfig<R, P> &
  QueryRunConfig &
  StorePageConfig

export type RefreshConfigType = { status?: boolean; loading?: boolean }

export type QueryRunConfig = RefreshConfigType & {
  refresh?: boolean
  replaceBody?: boolean
}

export type HooksConfig<R = unknown, P = unknown> = SubmitConfig<R, P> & {
  manual?: boolean // 是否手动触发
  pollingIntervalMs?: number
  refreshOnWindowFocus?: boolean
  refreshOnWindowFocusMode?: 'run' | 'refresh'
  refreshOnWindowFocusTimespanMs?: number // 重新请求间隔，单位为毫秒
}

export type QueryHooksConfig<R, P> = QueryConfig<R, P> & HooksConfig<R, P>

export type BaseQueryStoreType = {
  key: string
  status: ViewState
  isBusy: boolean
  isError: boolean
  isEmpty?: boolean
  setStatus: (status: ViewState) => void
  lastRequestTime?: number
  error?: ErrorType // 错误状态
}

export type QueryBodyStoreType<P> = {
  body?: Partial<P>
  setBody: (body: Partial<P>, replace?: boolean) => void
}

export type QueryDataStoreType<R = unknown> = {
  originData?: any
  data?: R
  setData: (data?: R) => void
}

export type QueryPageStoreType<R = unknown> = {
  current?: number
  pageSize?: number
  total: number
  offset?: string
  setPage: (config: { current?: number; pageSize?: number }) => void
  setPageRun: (config: {
    current?: number
    pageSize?: number
  }) => Promise<UseResult<R>>
  loadMore?: () => Promise<UseResult<R>>
}

export type QueryRunStoreType<R, P> = {
  cancel: (message?: string) => void
  run: (body?: Partial<P>, config?: QueryRunConfig) => Promise<UseResult<R>>
  refresh: (config?: RefreshConfigType) => Promise<UseResult<R>>
  clear: () => void
}

export type StoreType<R = unknown, P = unknown> =
  | QueryStoreType<R, P>
  | SubmitStoreType<R, P>

export type QueryStoreType<R = unknown, P = unknown> = BaseQueryStoreType &
  QueryBodyStoreType<P> &
  QueryDataStoreType<R> &
  QueryPageStoreType<R> &
  QueryRunStoreType<R, P>

export type SubmitStoreType<R = unknown, P = unknown> = BaseQueryStoreType &
  QueryBodyStoreType<P> &
  QueryDataStoreType<R> &
  QueryRunStoreType<R, P>

export type PaginationType = {
  current: number
  pageSize: number
  total: number
  offset?: string
}

export type CachedData<TData = unknown, TBody = unknown> = {
  data: TData
  body: TBody
  pagination?: PaginationType
  time: number
}

export type RequestResult = {
  type: 'axios'
  request: () => Promise<any>
  source?: any
}

export type QueryBody<P> = Partial<P> & { current?: number; pageSize?: number }
