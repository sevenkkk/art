import { PluginReturn } from '../utils/plugin-utils'
import { FetchStoreType, MutationStoreType } from '../model'

export function MutationResultPlugin<TData, TBody>(): PluginReturn<
  MutationStoreType<TData, TBody>
> {
  // 初始化状态
  const state: { originData?: TData; data?: TData } = {
    originData: undefined,
    data: undefined
  }

  const setData = (store: FetchStoreType, data?: TData) => {
    store.data = data
  }

  return {
    state,
    method: { setData }
  }
}
