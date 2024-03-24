import Toast from 'light-toast'
import { Art, UseResult } from 'art'

Art.setup({
  convertPage: (current, pageSize) => {
    return { page: current, pageSize }
  },
  convertRes: async (res: Response): Promise<UseResult> => {
    const { code, errorMessage, payload, count } = (await res.json()) || {}
    return {
      success: res.ok,
      data: payload,
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
