import { Art, UseResult } from 'art'
import { makeAutoObservable } from 'mobx'

Art.setup({
  baseURL: 'https://api-t.bagel7777.com',
  observable: makeAutoObservable,
  convertPage: (current, pageSize) => {
    return { page: current, pageSize }
  },
  convertRes: async (res: Response): Promise<UseResult> => {
    const { errorCode, errorMessage, payload, count } = (await res.json()) || {}
    return {
      success: res.ok,
      data: payload,
      code: errorCode,
      message: errorMessage,
      total: count
    }
  }
})
