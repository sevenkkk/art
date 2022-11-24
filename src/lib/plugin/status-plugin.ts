import { FetchStoreType, ViewState } from '../model'
import { PluginReturn } from '../utils/plugin-utils'
import { ID } from '../utils/ID'

export function StatusPlugin<TData, TBody>(): PluginReturn<TData, TBody> {
  // 初始化状态
  const state = {
    key: ID.generate(),
    isBusy: false,
    isError: false,
    status: ViewState.idle,
    isEmpty: undefined,
    error: undefined
  }

  // 设置状态
  const setStatus = (store: FetchStoreType, status: ViewState) => {
    store.status = status
    store.isError = status === ViewState.error
    store.isBusy = status === ViewState.busy
  }

  return {
    state,
    method: { setStatus }
  }
}
