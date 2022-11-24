import { FetchStoreType } from '../model'
import { PluginReturn } from '../utils/plugin-utils'

export function ResultPlugin<TData, TBody>(): PluginReturn<TData, TBody> {
  // 初始化状态
  const state = {
    originData: undefined,
    data: undefined
  }

  // 设置data
  const setData = (store: FetchStoreType, data?: TData) => {
    store.data = data
  }

  return {
    state,
    method: { setData }
  }
}
