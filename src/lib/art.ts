import { UseResult } from './model'
import { AxiosInstance, AxiosStatic } from './fetch/axios/axios'
import resso from './obs/resso'

export type ResultType = UseResult | Promise<UseResult>

export interface TemplateConfigOptions {
  baseURL?: string
  axios?: {
    axios: AxiosStatic
    instance?: AxiosInstance
    instanceCallback?: (instance: AxiosInstance) => void
  }
  observable?: any
  showErrorMessage?: (res: UseResult) => void
  showSuccessMessage?: (res: UseResult) => void
  startLoading?: () => void
  endLoading?: () => void
  convertRes?: (res: any) => ResultType
  convertError?: (resError: any, defaultResult: UseResult) => UseResult
  convertPage?: (current: number, pageSize: number) => any
  handleHttpError?: <T>(resError: T) => void
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
      return { success: res.ok, data: await res.json() }
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
