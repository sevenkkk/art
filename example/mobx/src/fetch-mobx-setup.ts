import { Art, UseResult } from 'art'
import { configure, makeAutoObservable } from "mobx";

configure({
  enforceActions: "never",
})

Art.setup({
  baseURL: 'https://api.ez-sourcing.com/',
  observable: makeAutoObservable,
  convertPage: (current, pageSize) => {
    return { page: current, pageSize }
  },
  convertRes: async (res: Response): Promise<UseResult> => {
    const { code, errorMessage, data, count } = (await res.json()) || {}
    return {
      success: res.ok,
      data: data,
      code: code,
      message: errorMessage,
      total: count
    }
  }
})
