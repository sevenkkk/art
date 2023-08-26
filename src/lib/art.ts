import { CachedData, UseResult } from './model'
import { AxiosInstance, AxiosStatic } from './fetch/axios/axios'
import resso from './obs/resso'

export type ResultType = UseResult | Promise<UseResult>

const _localStorage: any =
  typeof window !== 'undefined' ? localStorage : undefined

export interface ArtConfigOptions {
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
  convertError?: (res: any, defaultResult: UseResult) => Partial<UseResult>
  convertPage?: (current: number, pageSize: number) => any
  handleHttpError?: (resError: any) => void
  localCache?: boolean
  setCacheData?: (key: string, data: CachedData) => void
  clearCacheData?: (key: string) => void
  checkRetry?: <TData>(res: UseResult<TData>) => boolean
  getCacheData?: <TData, TBody>(
    key: string
  ) => CachedData<TData, TBody> | undefined
}

export class Art {
  static axiosInstance?: AxiosInstance

  static axios?: AxiosStatic

  // Default global configuration
  static config: ArtConfigOptions = {
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
    checkRetry: (res) => {
      return !(res.status === 400 || res.status === 401 || res.status === 403)
    },
    localCache: true,
    setCacheData: (key: string, data: CachedData) => {
      if (_localStorage) {
        localStorage.setItem(key, JSON.stringify(data))
      }
    },
    clearCacheData: (key) => {
      if (_localStorage) {
        localStorage.removeItem(key)
      }
    },
    getCacheData: <TData, TBody>(key: string) => {
      if (_localStorage) {
        const data = localStorage.getItem(key)
        if (data) {
          return JSON.parse(data) as CachedData<TData, TBody>
        }
      }
      return undefined
    }
  }

  /**
   * Set global configuration
   * @param config
   */
  static setup(config?: ArtConfigOptions): void {
    if (config) {
      this.config = { ...this.config, ...config }
      if (this.config.axios) {
        const { instance, instanceCallback, axios } = this.config.axios
        this.axios = axios
        if (instance) {
          this.axiosInstance = this.config.axios.instance
        } else {
          this.axiosInstance = axios.create({
            baseURL: this.config.baseURL
          })
        }
        if (instanceCallback) {
          instanceCallback(this.axiosInstance!)
        }
      }
    }
  }
}
