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

export type RequestType<T = unknown> = (body: T) => Promise<any>
export type BaseConfig<R = unknown, P = unknown> = {
  status?: boolean // 是否更新状态
  loading?: boolean // 是否loading
  isDefaultSet?: boolean // 是否默认设置data
  startLoading?: () => void // 开始loading回调
  endLoading?: () => void // 结束loading回调
  defaultBody?: DefaultBodyType<P> // 默认请求体
  method?: Method // 方法
  postBody?: (body: QueryBody<P>) => any // 转换body
  autoClear?: boolean // 是否自动清空
  showMessage?: boolean // 是否显示成功失败消息
  showErrorMessage?: boolean // 是否显示错误消息
  showSuccessMessage?: boolean // 是否显示成功消息
  onSuccess?: (data: R, res: UseResult<R>, cache: boolean) => void
  onError?: (res: UseResult<R>) => void // 失败回调
  onComplete?: (res: UseResult<R>) => void // 完成回调
  convertRes?: (res: any) => UseResult<R> // 请求响应体转换
  postData?: (data: any) => R // data转换
  loadingDelayMs?: number // 延迟loading时间
  debounceMs?: number // 防抖时间
  throttleMs?: number // 节流时间
  cache?: boolean | string | ((body?: P) => string[]) // 缓存key
  cacheTime?: number // 设置缓存数据回收时间 默认缓存数据 5 分钟后回收
  staleTime?: number // 缓存数据保持新鲜时间
}

export type ErrorType = {
  message?: string // 错误消息
  code?: string // 错误code
  status?: number // 状态
  info?: any // 详细信息系
}

export type StorePageConfig = {
  pagination?: boolean // 是否分页
  pageSize?: number // 每页个数
}

export type SubmitConfig<R = unknown, P = unknown> = BaseConfig<R, P> &
  QueryRunConfig

export type QueryConfig<R = unknown, P = unknown> = BaseConfig<R, P> &
  QueryRunConfig &
  StorePageConfig

export type RefreshConfigType = { status?: boolean; loading?: boolean }

export type QueryRunConfig = RefreshConfigType & {
  refresh?: boolean // 是否刷新
  replaceBody?: boolean // 替换body
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
  key: string // key
  status: ViewState // 状态
  isBusy: boolean // 正在加载
  isError: boolean // 发生错误
  isEmpty?: boolean // 空数据
  setStatus: (status: ViewState) => void // 设置状态
  lastRequestTime?: number // 最后请求时间
  error?: ErrorType // 错误状态
}

export type QueryBodyStoreType<P> = {
  body?: Partial<P> // 请求体
  setBody: (body: Partial<P>, replace?: boolean) => void // 设置请求体
}

export type QueryDataStoreType<R = unknown> = {
  originData?: any // 请求数据原始值
  data?: R // 请求数据当前值
  setData: (data?: R) => void // 设置当前data
}

export type QueryPageStoreType<R = unknown> = {
  current?: number // 当前页码
  pageSize?: number // 分页数量
  total: number // 总数
  offset?: string // 偏移量
  setPage: (config: { current?: number; pageSize?: number }) => void // 设置页码
  setPageRun: (config: {
    current?: number
    pageSize?: number
  }) => Promise<UseResult<R>>
  loadMore?: () => Promise<UseResult<R>> // 加载更多
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
