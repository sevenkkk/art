import { UseResult } from './model'
import { AxiosInstance, AxiosStatic } from './axios/axios'

export interface TemplateConfigOptions {
  baseURL?: string
  axios?: {
    axios: AxiosStatic | any
    instanceCallback: (instance: AxiosInstance) => void
  }
  showErrorMessage?: (res: UseResult) => void
  showSuccessMessage?: (res: UseResult) => void
  startLoading?: () => void
  endLoading?: () => void
  convertRes?: (res: any) => UseResult
  convertError?: (resError: any) => UseResult
  handlePage?: (current: number, pageSize: number) => any
  handleHttpError?: <T>(resError: T) => void
}

export class Art {
  static axios?: AxiosInstance

  // Default global configuration
  static config: TemplateConfigOptions = {
    showErrorMessage: (res) => {
      console.log(res)
    },
    showSuccessMessage: (res) => {
      console.log(res)
    },
    handlePage: (page, pageSize) => {
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
      if (this.config.axios?.axios) {
        this.axios = this.config.axios.axios.create({
          baseURL: this.config.baseURL
        })
        if (this.config.axios.instanceCallback) {
          this.config.axios.instanceCallback(this.axios!)
        }
      }
    }
  }
}
