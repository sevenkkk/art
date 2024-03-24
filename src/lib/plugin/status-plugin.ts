import { ErrorType, FetchStatus, FetchStoreType } from '../model'
import { PluginReturn, StoreType } from '../utils/plugin-utils'
import { ID } from '../utils/ID'

export function StatusPlugin<TData, TBody>(): PluginReturn<
  StoreType<FetchStoreType<TData, TBody>>
> {
  // 初始化状态
  const state = {
    key: ID.generate(),
    status: 'idle',
    isLoading: false,
    isError: false,
    isSuccess: false,
    isEmpty: false,
    error: undefined
  }

  // 设置状态
  const setStatus = (
    store: StoreType<FetchStoreType>,
    status: FetchStatus,
    error?: ErrorType
  ) => {
    const status1 = {
      status,
      isLoading: status === 'loading',
      isError: status === 'error',
      isSuccess: status === 'success'
    }
    if (error) {
      store({ ...status1, error })
    } else {
      store(status1)
    }
  }

  return {
    state,
    method: { setStatus }
  }
}
