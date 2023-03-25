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
export type FetchStatus = 'idle' | 'error' | 'loading' | 'success'

/**
 * API return value object
 */
export interface UseResult<TData = unknown> {
  success?: boolean
  data?: TData
  message?: string
  code?: string
  status?: number
  total?: number
  isCancel?: boolean
  other?: any
}

export type GetDefaultBody<TBody> = () => Partial<TBody>
export type DefaultBodyType<TBody> = GetDefaultBody<TBody> | Partial<TBody>

export type RequestType<T = unknown> = (body: T) => Promise<any>
export type BaseConfig<TData = unknown, TBody = unknown> = {
  status?: boolean // 是否更新状态
  loading?: boolean // 是否loading
  isDefaultSet?: boolean // 是否默认设置data
  startLoading?: () => void // 开始loading回调
  endLoading?: () => void // 结束loading回调
  defaultBody?: DefaultBodyType<TBody> // 默认请求体
  method?: Method // 方法
  postBody?: (body: FetchBody<TBody>) => any // 转换body
  autoClear?: boolean // 是否自动清空
  showMessage?: boolean // 是否显示成功失败消息
  showErrorMessage?: boolean // 是否显示错误消息
  showSuccessMessage?: boolean // 是否显示成功消息
  onSuccess?: (data: TData, res: UseResult<TData>, cache: boolean) => void
  onError?: (res: UseResult<TData>) => void // 失败回调
  onComplete?: (res: UseResult<TData>) => void // 完成回调
  convertRes?: (res: any) => Promise<UseResult<TData>> // 请求响应体转换
  postData?: (data: any) => TData // data转换
  loadingDelayMs?: number // 延迟loading时间
  debounceMs?: number // 防抖时间
  throttleMs?: number // 节流时间
  cache?: boolean | string | ((body?: TBody) => string[]) // 缓存key
  cacheTime?: number // 设置缓存数据回收时间 默认缓存数据 5 分钟后回收
  staleTime?: number // 缓存数据保持新鲜时间
  submit?: boolean // 是否是提交请求
  initialData?: TData | (() => TData) // 初始化data
  placeholderData?: TData | (() => TData) // 没数据时默认data
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

export type FetchConfig<TData = unknown, TBody = unknown> = BaseConfig<
  TData,
  TBody
> &
  FetchRunConfig &
  StorePageConfig

export type RefreshConfigType = { status?: boolean; loading?: boolean }

export type FetchRunConfig = RefreshConfigType & {
  refresh?: boolean // 是否刷新
  replaceBody?: boolean // 替换body
}

export type HooksFetchConfig<TData = unknown, TBody = unknown> = FetchConfig<
  TData,
  TBody
> & {
  manual?: boolean // 是否手动触发
  pollingIntervalMs?: number
  refreshOnWindowFocus?: boolean
  refreshOnWindowFocusMode?: 'run' | 'refresh'
  refreshOnWindowFocusTimespanMs?: number // 重新请求间隔，单位为毫秒
}

export type FetchStatusStoreType = {
  key: string // key
  status: FetchStatus // 状态
  isLoading: boolean // 是否正在加载
  isError: boolean // 是否错误
  isSuccess: boolean // 是否成功
  isEmpty: boolean // 空数据
  error?: ErrorType // 错误状态
  setStatus: (status: FetchStatus) => void // 设置状态
}

export type FetchBodyStoreType<TBody> = {
  body?: Partial<TBody> // 请求体
  setBody: (body: Partial<TBody>, replace?: boolean) => void // 设置请求体
}

export type FetchDataStoreType<TData = unknown> = {
  originData?: any // 请求数据原始值
  data?: TData // 请求数据当前值
  setData: (data?: TData) => void // 设置当前data
}

export type FetchPageStoreType<TData = unknown> = {
  current?: number // 当前页码
  pageSize?: number // 分页数量
  total: number // 总数
  offset?: string // 偏移量
  setPage: (config: { current?: number; pageSize?: number }) => void // 设置页码
  setPageRun: (config: { current?: number; pageSize?: number }) => void
  setPageRunSync: (config: {
    current?: number
    pageSize?: number
  }) => Promise<UseResult<TData>>
  loadMore?: () => Promise<UseResult<TData>> // 加载更多
}

export type FetchRunStoreType<TData, TBody> = {
  lastRequestTime?: number // 最后请求时间
  cancel: (message?: string) => void
  runSync: (
    body?: Partial<TBody>,
    config?: FetchRunConfig
  ) => Promise<UseResult<TData>>
  run: (body?: Partial<TBody>, config?: FetchRunConfig) => void
  refreshSync: (config?: RefreshConfigType) => Promise<UseResult<TData>>
  refresh: (config?: RefreshConfigType) => void
  clear: () => void
}

export type FetchStoreType<
  TData = unknown,
  TBody = unknown
> = FetchStatusStoreType &
  FetchBodyStoreType<TBody> &
  FetchDataStoreType<TData> &
  FetchPageStoreType<TData> &
  FetchRunStoreType<TData, TBody>

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

export type RequestMode = 'customize' | 'default' | 'axios'

export type RequestResult = {
  type: RequestMode
  request: () => Promise<any>
  cancel?: () => void
}

export type FetchBody<TBody> = Partial<TBody> & {
  current?: number
  pageSize?: number
}
