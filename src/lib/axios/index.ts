import { Art } from '../art'
import { AxiosError, AxiosRequestConfig, Method } from './axios'

export function getAxiosRequest(method: Method, url: string, body: any) {
  const source = Art.axios!.CancelToken.source()
  const request = () =>
    _getAxiosRequest(method, url, body, { cancelToken: source.token })
  return { request, source }
}

export function _getAxiosRequest(
  method: Method,
  url: string,
  body: any,
  config?: AxiosRequestConfig
): Promise<any> {
  switch (method) {
    case 'POST':
    case 'post':
      return Art.axiosInstance!.post(url, body, config)
    case 'PUT':
    case 'put':
      return Art.axiosInstance!.put(url, body, config)
    case 'DELETE':
    case 'delete':
      return Art.axiosInstance!.delete(url, config)
    default:
      return Art.axiosInstance!.get(url, config)
  }
}

export function handleAxiosError(e: any) {
  if (Art.axios?.isCancel(e)) {
    return { success: false, isCancel: true, message: e.message }
  } else {
    const response = e.response
    if (response) {
      const axiosRes = e as AxiosError
      const defaultResult = {
        success: false,
        status: response.status,
        code: axiosRes.code,
        message: axiosRes.message,
        isCancel: false
      }
      if (Art.config.convertError) {
        return {
          message: axiosRes.message,
          ...Art.config.convertError(response, defaultResult),
          success: false,
          status: response.status,
          isCancel: false
        }
      } else {
        return defaultResult
      }
    } else {
      console.log(e)
      throw new Error(e)
    }
  }
}
