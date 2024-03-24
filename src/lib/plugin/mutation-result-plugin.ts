import { PluginReturn, StoreType } from '../utils/plugin-utils'
import { FetchStoreType, MutationStoreType } from '../model'

export function MutationResultPlugin<TData, TBody>(): PluginReturn<
  StoreType<MutationStoreType<TData, TBody>>
> {
  // 初始化状态
  const state: { originData?: TData; data?: TData } = {
    originData: undefined,
    data: undefined
  }

  const setData = (store: StoreType<FetchStoreType>, data?: TData) => {
    store.data = data
  }

  return {
    state,
    method: { setData }
  }
}
