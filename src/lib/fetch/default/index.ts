import { Method } from '../../model'
import { Art } from '../../art'

export function getFetchRequest(
  method: Method,
  url: string,
  body: any,
  customConfig?: any
) {
  const controller = new AbortController()
  const config = { signal: controller.signal, ...(customConfig ?? {}) }
  const request = () => _getFetchRequest(method, url, body, config)
  return { request, cancel: () => controller.abort() }
}

export function _getFetchRequest(
  method: Method,
  url: string,
  body: any,
  requestInit?: RequestInit
): Promise<any> {
  const input = Art.config.baseURL + url
  return fetch(input, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...(requestInit ?? {}),
    method: method,
    body: JSON.stringify(body)
  })
}

export function handleFetchError(e: any) {
  if (
    typeof e === 'object' &&
    e instanceof DOMException &&
    e.message.includes('The user aborted a request')
  ) {
    return { success: false, isCancel: true, message: e.message }
  } else {
    console.log(e)
    throw new Error(e)
  }
}
