import { FetchStoreType } from '../model'

export type PluginReturn<TData, TBody> = {
  state?: Record<string, any>
  method?: {
    [key: string]: (
      store: FetchStoreType<TData, TBody>,
      ...args: unknown[]
    ) => void
  }
}

type MethodType<TData = unknown, TBody = unknown> = (
  store: FetchStoreType<TData, TBody>,
  ...args: unknown[]
) => void

/**
 *  方法第一项注入store
 * @param method 方法对象
 * @param getStore 获取store
 */
export const getMethodInjectStore = <T extends Record<string, MethodType>>(
  method: T,
  getStore: () => FetchStoreType
) => {
  const result = {} as any
  Object.keys(method).forEach((key: keyof T) => {
    const initVal = method[key]
    if (initVal instanceof Function) {
      result[key] = (...args: unknown[]) => {
        const store = getStore()
        return initVal(store, ...args)
      }
    }
  })
  return result
}

export const handlePlugins = <TData, TBody>(
  pluginList: PluginReturn<TData, TBody>[]
) => {
  const state = pluginList
    .map((item) => item.state)
    .reduce(
      (previousValue, currentValue) => ({ ...previousValue, ...currentValue }),
      {}
    )

  const method = pluginList
    .map((item) => item.method)
    .reduce((previousValue, currentValue) => {
      return { ...previousValue, ...currentValue }
    }, {}) as Record<string, MethodType>

  return { state, method }
}
