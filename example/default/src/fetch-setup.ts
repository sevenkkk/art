import Toast from 'light-toast'
import { Art, UseResult } from 'art'

Art.setup({
  baseURL: 'https://api.ez-sourcing.com/',
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
  },
  startLoading: () => {
    Toast.loading('')
  },
  endLoading: () => {
    Toast.hide()
  }
})
