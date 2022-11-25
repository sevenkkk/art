import Toast from 'light-toast'
import { Art, UseResult } from 'art'
import axios, { AxiosResponse } from 'axios'

Art.setup({
  baseURL: 'https://api-t.bagel7777.com',
  axios: {
    axios
  },
  convertPage: (current, pageSize) => {
    return { page: current, pageSize }
  },
  convertRes: async (res: AxiosResponse): Promise<UseResult> => {
    const { success, errorCode, errorMessage, payload, count } = res.data || {}
    return {
      success,
      code: errorCode,
      message: errorMessage,
      data: payload,
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
