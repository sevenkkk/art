import { UseResult } from './model'
import { AxiosInstance, AxiosStatic } from './axios/axios'

export interface TemplateConfigOptions {
  baseURL?: string
  httpType?: 'axios'
  axios?: {
    instance: AxiosInstance
    instanceCallback: (instance: AxiosInstance) => void
  }
  showErrorMessage?: (res: UseResult) => void
  showSuccessMessage?: (res: UseResult) => void
  startLoading?: () => void
  endLoading?: () => void
  convertRes?: (res: any) => UseResult
  convertError?: (resError: any, defaultResult: UseResult) => UseResult
  handlePage?: (current: number, pageSize: number) => any
  handleHttpError?: <T>(resError: T) => void
}

export class Art {
  static axiosInstance?: AxiosInstance

  static getAxiosInstance() {
    if (this.axiosInstance) {
      return this.axiosInstance
    } else {
      return this.getAxios()
    }
  }

  static axios?: AxiosStatic

  static getAxios() {
    if (this.axios) {
      return this.axios
    } else {
      this.axios = require('axios').default
      if (!this.axios) {
        throw new Error('Need to add axios dependency')
      }
      return this.axios
    }
  }

  // Default global configuration
  static config: TemplateConfigOptions = {
    httpType: 'axios',
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
      if (this.config.httpType === 'axios') {
        if (this.config.axios?.instance) {
          this.axiosInstance = this.config.axios.instance
          if (this.config.axios.instanceCallback) {
            this.config.axios.instanceCallback(this.axios!)
          }
        } else {
          this.axiosInstance = this.getAxios().create({
            baseURL: this.config.baseURL
          })
        }
      }
    }
  }
}
