import { Art } from '../../art'
import { type AxiosRequestConfig, type Method } from 'axios'

export function getAxiosRequest(
  method: Method,
  url: string,
  body: any,
  customConfig?: any
) {
  const source = Art.axios?.CancelToken.source()
  const config = {
    cancelToken: source?.token,
    baseURL: Art.config.baseURL,
    ...(customConfig ?? {})
  }
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
  if (e.response) {
    if (Art.axios?.isCancel(e)) {
      return { success: false, isCancel: true, message: e.message }
    }
    const axiosRes = e as any
    const response = axiosRes.response
    const defaultResult = {
      success: false,
      status: response?.status,
      code: axiosRes.code,
      message: axiosRes.message,
      isCancel: false
    }
    if (Art.config.convertError) {
      return {
        message: axiosRes.message,
        success: false,
        status: response?.status,
        isCancel: false,
        ...Art.config.convertError(response, defaultResult)
      }
    } else {
      return defaultResult
    }
  }
  return {
    success: false,
    status: 1000,
    code: e?.code ?? 'UNKNOWN_ERROR',
    message: e instanceof Error ? e.message ?? e.stack : 'Unknown Error',
    isCancel: false
  }
}
