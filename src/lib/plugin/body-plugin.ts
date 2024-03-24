import { FetchStoreType } from '../model'
import { PluginReturn, StoreType } from '../utils/plugin-utils'

export function BodyPlugin<TData, TBody>(): PluginReturn<
  StoreType<FetchStoreType<TData, TBody>>
> {
  // 初始化状态
  const state = {
    body: undefined
  }

  // 设置body
  const setBody = (
    store: StoreType<FetchStoreType>,
    inBody: Partial<TBody>,
    replace = false
  ): void => {
    const { body } = store
    if (body && !replace) {
      store.body = { ...inBody, ...store.body }
    } else {
      store.body = inBody
    }
  }

  return {
    state,
    method: { setBody }
  }
}
