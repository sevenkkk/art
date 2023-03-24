import { CachedData, UseResult } from './model'
import { AxiosInstance, AxiosStatic } from './fetch/axios/axios'
import resso from './obs/resso'

export type ResultType = UseResult | Promise<UseResult>

export interface TemplateConfigOptions {
  baseURL?: string
  axios?: {
    axios: AxiosStatic // axios 对象
    instance?: AxiosInstance // axios 实例
    instanceCallback?: (instance: AxiosInstance) => void // axios 创建实例回调
  }
  observable?: any // 监听者对象
  showErrorMessage?: (res: UseResult) => void // 显示错误信息
  showSuccessMessage?: (res: UseResult) => void // 显示成功消息
  startLoading?: () => void
  endLoading?: () => void
  convertRes?: (res: any) => ResultType
  convertError?: (resError: any, defaultResult: UseResult) => UseResult
  convertPage?: (current: number, pageSize: number) => any
  handleHttpError?: <T>(resError: T) => void
  localCache?: boolean
  setCacheData?: (key: string, data: CachedData) => void
  clearCacheData?: (key: string) => void
  getCacheData?: <TData, TBody>(
    key: string
  ) => CachedData<TData, TBody> | undefined
}

export class Art {
  static axiosInstance?: AxiosInstance

  static axios?: AxiosStatic

  // Default global configuration
  static config: TemplateConfigOptions = {
    observable: resso,
    showErrorMessage: (res) => {
      console.log(res)
    },
    showSuccessMessage: (res) => {
      console.log(res)
    },
    convertPage: (page, pageSize) => {
      return { page, pageSize }
    },
    convertRes: async (res: Response): Promise<UseResult> => {
      const { data, count } = await res.json()
      return { success: res.ok, data, total: count }
    },
    localCache: true,
    setCacheData: (key: string, data: CachedData) => {
      localStorage.setItem(key, JSON.stringify(data))
    },
    getCacheData: <TData, TBody>(key: string) => {
      const data = localStorage.getItem(key)
      if (data) {
        return JSON.parse(data) as CachedData<TData, TBody>
      }
      return undefined
    }
  }

  /**
   * Set global configuration
   * @param config
   */
  static setup(config?: TemplateConfigOptions): void {
    if (config) {
      this.config = { ...this.config, ...config }
      if (this.config.axios) {
        const { instance, instanceCallback, axios } = this.config.axios
        this.axios = axios
        if (instance) {
          this.axiosInstance = this.config.axios.instance
          if (instanceCallback) {
            instanceCallback(this.axiosInstance!)
          }
        } else {
          this.axiosInstance = axios.create({
            baseURL: this.config.baseURL
          })
        }
      }
    }
  }
}
