import { UseResult } from './model'
import { AxiosInstance, AxiosStatic } from './axios/axios'
import resso from './resso'

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
  convertRes?: (res: any) => UseResult
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
    convertRes: (resBody: any): UseResult<any> => {
      const { success, errorCode, errorMessage, payload, count } = resBody || {}
      return {
        success,
        code: errorCode,
        message: errorMessage,
        data: payload,
        total: count
      }
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
