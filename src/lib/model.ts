import { ResultType } from './art'

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
  success: boolean
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

export type RequestType<TBody = unknown> =
  | RequestTypePromise<TBody>
  | string
  | RequestTypeFunction<TBody>
export type RequestTypePromise<T = unknown> = (body: T) => Promise<any>
export type RequestTypeFunction<T = unknown> = (body: T) => string
export type FetchConfig<TData = unknown, TBody = unknown> = {
  status?: boolean // 是否更新状态
  loading?: boolean // 是否loading
  isDefaultSet?: boolean // 是否默认设置data
  startLoading?: () => void // 开始loading回调
  endLoading?: () => void // 结束loading回调
  defaultBody?: DefaultBodyType<TBody> // 默认请求体
  method?: Method // 方法
  postBody?: (body: FetchBody<TBody>) => any // 转换body
  showMessage?: boolean // 是否显示成功失败消息
  showErrorMessage?: boolean // 是否显示错误消息
  showSuccessMessage?: boolean // 是否显示成功消息
  onSuccess?: (data: TData, res: UseResult<TData>, cache: boolean) => void
  onError?: (res: UseResult<TData>) => void // 失败回调
  onComplete?: (res: UseResult<TData>) => void // 完成回调
  convertRes?: (res: any) => ResultType // 请求响应体转换
  postData?: (data: any) => TData // data转换
  loadingDelayMs?: number // 延迟loading时间
  debounceMs?: number // 防抖时间
  throttleMs?: number // 节流时间
  retry?: number // 重试次数
  checkRetry?: <TData>(res: UseResult<TData>) => boolean // 是否重试
  retryInterval?: number // 重试时间s
}

export type BaseQueryConfig<TData = unknown, TBody = unknown> = {
  autoClear?: boolean // 是否自动清空
  cache?: boolean | string | ((body?: TBody) => string[]) // 缓存key
  cacheTime?: number // 单位秒。设置缓存数据回收时间 默认缓存数据 5 分钟后回收
  revalidate?: number // 单位秒。重新验证
  initialData?: TData | (() => TData) // 初始化data
  placeholderData?: TData | (() => TData) // 没数据时默认data
  initializeCache?: boolean // 初始化缓存
}

export type ErrorType = {
  message?: string // 错误消息
  code?: string // 错误code
  status?: number // 状态
  info?: any // 详细信息系
}

export type StorePageConfig = {
  current?: number // 起始页码
  pageSize?: number // 每页个数
}

export type StoreInfiniteConfig<TData> = {
  pageSize?: number // 每页个数
  nextPageRequestBody: (
    lastPage: UseResult<TData[]>,
    page: StorePageConfig
  ) => Record<string, any>
}

export type QueryConfig<TData = unknown, TBody = unknown> = FetchConfig<
  TData,
  TBody
> &
  FetchRunConfig &
  BaseQueryConfig

export type MutationConfig<TData = unknown, TBody = unknown> = FetchConfig<
  TData,
  TBody
>

export type QueryPageConfig<TData = unknown, TBody = unknown> = FetchConfig<
  TData,
  TBody
> &
  FetchRunConfig &
  BaseQueryConfig &
  StorePageConfig

export type QueryInfiniteConfig<TData = unknown, TBody = unknown> = FetchConfig<
  TData,
  TBody
> &
  FetchRunConfig &
  BaseQueryConfig &
  StoreInfiniteConfig<TData>
export type RefreshConfigType = { status?: boolean; loading?: boolean }

export type FetchRunConfig = RefreshConfigType & {
  refresh?: boolean // 是否刷新
  replaceBody?: boolean // 替换body
}

export type HooksBaseConfig = {
  manual?: boolean // 是否手动触发
  pollingIntervalMs?: number
  refreshOnWindowFocus?: boolean
  refreshOnWindowFocusMode?: 'run' | 'refresh'
  refreshOnWindowFocusTimespanMs?: number // 重新请求间隔，单位为毫秒
}

export type HooksQueryConfig<TData = unknown, TBody = unknown> = QueryConfig<
  TData,
  TBody
> &
  HooksBaseConfig

export type HooksMutationConfig<
  TData = unknown,
  TBody = unknown
> = MutationConfig<TData, TBody> & HooksBaseConfig

export type HooksInfiniteConfig<
  TData = unknown,
  TBody = unknown
> = QueryInfiniteConfig<TData, TBody> & HooksBaseConfig

export type FetchStatusStoreType = {
  key: string // key
  status: FetchStatus // 状态
  isLoading: boolean // 是否正在加载
  isError: boolean // 是否错误
  isSuccess: boolean // 是否成功
  error?: ErrorType // 错误状态
  setStatus: (status: FetchStatus) => void // 设置状态
  lastRequestTime?: number // 最后请求时间
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
  setPage: (config: { current?: number; pageSize?: number }) => void // 设置页码
  setPageQuery: (config: { current?: number; pageSize?: number }) => void
  setPageQuerySync: (config: {
    current?: number
    pageSize?: number
  }) => Promise<UseResult<TData>>
}

export type FetchInfiniteStoreType<TData = unknown> = {
  data: TData[]
  lastPage?: UseResult<TData[]>
  current: number
  pageSize?: number // 分页数量
  total: number // 总数
  hasNextPage: boolean
  isLoadingNextPage: boolean
  isErrorNextPage: boolean
  queryNextPage?: () => Promise<UseResult<TData[]>> // 加载更多
}

export type FetchStoreType<
  TData = unknown,
  TBody = unknown
> = FetchStatusStoreType &
  FetchBodyStoreType<TBody> &
  FetchDataStoreType<TData> & {
    postBody: (
      postBody?: (body: FetchBody<TBody>) => any,
      nextPageRequestBody?: () => Record<string, any>
    ) => any
    setRes: (res: UseResult<TData>) => void
    lastRequestTime?: number // 最后请求时间
    cancel: (message?: string) => void
    clear: () => void
  }

export type QueryStoreType<TData = unknown, TBody = unknown> = FetchStoreType<
  TData,
  TBody
> & {
  querySync: (
    body?: Partial<TBody>,
    config?: FetchRunConfig
  ) => Promise<UseResult<TData>>
  query: (body?: Partial<TBody>, config?: FetchRunConfig) => void
  refreshSync: (config?: RefreshConfigType) => Promise<UseResult<TData>>
  refresh: (config?: RefreshConfigType) => void
}

export type MutationStoreType<
  TData = unknown,
  TBody = unknown
> = FetchStoreType<TData, TBody> & {
  mutateSync: (
    body?: Partial<TBody>,
    config?: FetchRunConfig
  ) => Promise<UseResult<TData>>
  mutate: (body?: Partial<TBody>, config?: FetchRunConfig) => void
}

export type QueryPageStoreType<
  TData = unknown,
  TBody = unknown
> = QueryStoreType<TData, TBody> & FetchPageStoreType<TData>

export type QueryInfiniteStoreType<
  TData = unknown,
  TBody = unknown
> = QueryStoreType<TData, TBody> &
  Omit<QueryStoreType, 'data'> &
  FetchInfiniteStoreType<TData>

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
