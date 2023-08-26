import { getObserver } from '../obs/observer'

export type PluginReturn<S> = {
  state?: Record<string, any>
  method?: {
    [key: string]: (store: S, ...args: unknown[]) => void
  }
}

type MethodType<T extends unknown> = (store: T, ...args: unknown[]) => void

/**
 *  方法第一项注入store
 * @param method 方法对象
 * @param getStore 获取store
 */
export const getMethodInjectStore = <
  S,
  T extends Record<string, MethodType<S>>
>(
  method: T,
  getStore: () => S
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

export const handlePlugins = <S>(pluginList: PluginReturn<S>[]) => {
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
    }, {}) as Record<string, MethodType<S>>

  return { state: state ?? {}, method }
}

export const getMyStore = <S>(pluginList: PluginReturn<S>[]) => {
  const { state, method } = handlePlugins(pluginList)
  const store: S = getObserver()<S>({
    ...state,
    ...getMethodInjectStore(method, () => store)
  })
  return store
}
