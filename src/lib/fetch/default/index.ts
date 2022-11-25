import { Method } from '../../model'
import { Art } from '../../art'

export function getFetchRequest(
  method: Method,
  url: string,
  body: any,
  customConfig?: any
) {
  const request = () => _getFetchRequest(method, url, body, customConfig)
  return { request }
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
