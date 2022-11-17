import { Art } from '../art'
import { AxiosError, AxiosRequestConfig, Method } from './axios'

export function getAxiosRequest(
  method: Method,
  url: string,
  body: any,
  config?: AxiosRequestConfig
): Promise<any> {
  switch (method) {
    case 'POST':
    case 'post':
      return Art.axios!.post(url, body, config)
    case 'PUT':
    case 'put':
      return Art.axios!.put(url, body, config)
    case 'DELETE':
    case 'delete':
      return Art.axios!.delete(url, config)
    default:
      return Art.axios!.get(url, config)
  }
}

export function handleError(e: any) {
  if (Art.config.axios?.axios.isCancel(e)) {
    return { success: false, isCancel: true, message: e.message }
  } else {
    const response = e.response
    if (response) {
      const axiosRes = e as AxiosError
      if (Art.config.convertError) {
        return {
          message: axiosRes.message,
          ...Art.config.convertError(response),
          success: false,
          status: response.status,
          isCancel: false
        }
      } else {
        return {
          success: false,
          status: response.status,
          code: axiosRes.code,
          message: axiosRes.message,
          isCancel: false
        }
      }
    } else {
      throw new Error(e)
    }
  }
}
