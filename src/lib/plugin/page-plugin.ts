import { FetchConfig, FetchStoreType, UseResult } from '../model'
import { PluginReturn } from '../utils/plugin-utils'

export const PagePlugin = <TData, TBody>(
  config?: FetchConfig<TData, TBody>
): PluginReturn<TData, TBody> => {
  // 初始化状态
  const state = {
    current: config?.pagination ? 1 : undefined,
    pageSize: config?.pagination ? config?.pageSize ?? 10 : undefined,
    total: 0,
    offset: undefined
  }

  // 设置页码
  const setPage = (
    store: FetchStoreType<TData>,
    config: {
      current?: number
      pageSize?: number
      autoRun?: boolean
    }
  ): void => {
    const { current, pageSize } = config ?? {}
    if (current) {
      store.current = current
    }
    if (pageSize) {
      store.pageSize = pageSize
    }
  }

  // 设置页面并且查询
  const setPageRun = (
    store: FetchStoreType<TData>,
    config: {
      current?: number
      pageSize?: number
    }
  ): Promise<UseResult<TData>> => {
    setPage(store, config)
    return store.run()
  }

  // 清理数据
  const clear = (store: FetchStoreType<TData>) => {
    store.total = 0
    store.current = 1
  }

  return {
    state,
    method: {
      setPage,
      setPageRun,
      clear
    }
  }
}
