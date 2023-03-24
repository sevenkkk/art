import { FetchStatus, FetchStoreType } from '../model'
import { PluginReturn } from '../utils/plugin-utils'
import { ID } from '../utils/ID'

export function StatusPlugin<TData, TBody>(): PluginReturn<TData, TBody> {
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
  const setStatus = (store: FetchStoreType, status: FetchStatus) => {
    store.status = status
    store.isLoading = status === 'loading'
    store.isError = status === 'error'
    store.isSuccess = status === 'success'
  }

  return {
    state,
    method: { setStatus }
  }
}
