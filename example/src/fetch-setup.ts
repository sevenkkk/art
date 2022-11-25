import Toast from 'light-toast'
import { Art, UseResult } from 'art'

Art.setup({
  baseURL: 'https://api-t.bagel7777.com',
  /*  axios: {
    axios
  },*/
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
  },
  startLoading: () => {
    Toast.loading('')
  },
  endLoading: () => {
    Toast.hide()
  }
})
