import { FetchConfig, FetchStoreType } from '../model'
import { PluginReturn } from '../utils/plugin-utils'

export function ResultPlugin<TData, TBody>(
  config?: FetchConfig<TData, TBody>
): PluginReturn<TData, TBody> {
  // 初始化状态
  const state: { originData?: TData; data?: TData } = {
    originData: undefined,
    data: undefined
  }

  const getPlaceholderData = () => {
    if (config?.placeholderData) {
      if (typeof config?.placeholderData === 'function') {
        return (config?.placeholderData as () => TData)()
      }
    }
    return config?.placeholderData as TData | undefined
  }

  const _placeholderData = getPlaceholderData()

  // 设置data
  const setData = (store: FetchStoreType, data?: TData) => {
    // 如果请求数据为空
    if (!data || (data instanceof Array && !data.length)) {
      // 无数据是显示的内容
      if (_placeholderData) {
        store.data = _placeholderData
        return
      }
    }
    store.data = data
  }

  /**
   *  设置默认值
   */
  const setInitialData = () => {
    if (config?.initialData) {
      if (typeof config?.initialData === 'function') {
        const initData: TData = (config?.initialData as () => TData)()
        state.data = initData
        state.data = initData
      } else {
        state.data = config?.initialData
        state.data = config?.initialData
      }
    }
    if (!state.data && _placeholderData) {
      state.data = _placeholderData
    }
  }

  // 初始化
  setInitialData()

  return {
    state,
    method: { setData }
  }
}
