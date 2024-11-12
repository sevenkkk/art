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
  return {
    request,
    cancel: () => {
      controller.abort('user cancel')
    }
  }
}

export function _getFetchRequest(
  method: Method,
  url: string,
  body: any,
  requestInit?: RequestInit
): Promise<any> {
  let input = url
  if (!url.startsWith('/') && !url.startsWith('http')) {
    input = `/${input}`
  }
  if (Art.config.baseURL && !input.startsWith('http')) {
    input = `${Art.config.baseURL}${input}`
  }
  const myFetch = Art.config.fetch?.fetch ?? fetch
  const baseInit = Art.config.fetch?.requestInit
    ? Art.config.fetch!.requestInit(input, method, body)
    : {}
  return myFetch(input, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    },
    ...baseInit,
    ...(requestInit ?? {}),
    method: method
  }).then((res) => {
    if (
      Art.config.fetch?.errorStatus?.some((status) => res.status === status)
    ) {
      throw res
    }
    return res
  })
}

export function handleFetchError(e: any) {
  if (e instanceof Response) {
    return {
      success: false,
      status: e.status,
      message: e.statusText,
      isCancel: false
    }
  }
  if (
    (typeof e === 'object' &&
      e instanceof DOMException &&
      e.message.includes('The user aborted a request')) ||
    (typeof e === 'string' && e === 'user cancel')
  ) {
    return { success: false, isCancel: true, message: 'user cancel' }
  } else {
    return {
      success: false,
      status: 1000,
      code: 'UNKNOWN_ERROR',
      message: e instanceof Error ? e.message ?? e.stack : 'Unknown Error',
      isCancel: false
    }
  }
}
