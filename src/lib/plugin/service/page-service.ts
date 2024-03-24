import { QueryConfig, QueryPageConfig } from '../../model'

export function getQueryPageConfig<TData, TBody>(
  config?: QueryPageConfig<TData, TBody>
): QueryConfig<TData, TBody> {
  // 初始化默认配置
  const defaultConfig: Partial<QueryPageConfig<TData, TBody>> = {
    status: true,
    loading: false,
    isDefaultSet: true,
    autoClear: false,
    cacheTime: 300000,
    revalidate: 0,
    retry: 3,
    showMessage: false,
    showSuccessMessage: false,
    showErrorMessage: true,
    pageSize: 10,
    current: 1
  }
  // 得到当前配置
  return { ...defaultConfig, ...(config ?? {}) }
}
