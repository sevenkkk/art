import { Art } from '../../art'
import { AxiosError, AxiosRequestConfig, Method } from './axios'

export function getAxiosRequest(
  method: Method,
  url: string,
  body: any,
  customConfig?: any
) {
  const source = Art.axios?.CancelToken.source()
  const config = { cancelToken: source?.token, ...(customConfig ?? {}) }
  const request = () => _getAxiosRequest(method, url, body, config)
  return { request, cancel: () => source?.cancel() }
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
          success: false,
          status: response.status,
          isCancel: false,
          ...Art.config.convertError(response, defaultResult)
        }
      } else {
        return defaultResult
      }
    } else {
      return {
        success: false,
        status: 500,
        code: '',
        message: 'unknown error',
        isCancel: false
      }
    }
  }
}
