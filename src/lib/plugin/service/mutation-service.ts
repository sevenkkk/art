import { MutationConfig } from '../../model'

/**
 * 获取当前配置项目
 * @param config
 */
export function getMutationConfig<R, P>(
  config?: MutationConfig<R, P>
): MutationConfig<R, P> {
  // 初始化默认配置
  const defaultConfig: Partial<MutationConfig<R, P>> = {
    status: true,
    loading: false,
    isDefaultSet: true,
    showMessage: true,
    showSuccessMessage: true,
    showErrorMessage: true
  }
  // 得到当前配置
  return { ...defaultConfig, ...(config ?? {}) }
}
