import { A } from './compontents/A'
import { B } from './compontents/B'
import { memo } from 'react'
import { AxiosResponse } from 'axios'
import { Tabs } from './compontents/Tabs'
import { Art, UseResult } from 'art'
import React from 'react'

Art.setup({
  baseURL: 'https://api-t.bagel7777.com',
  convertPage: (current, pageSize) => {
    return { page: current, pageSize }
  },
  convertRes: (res: AxiosResponse): UseResult => {
    const { success, errorCode, errorMessage, payload, count } = res.data || {}
    return {
      success,
      code: errorCode,
      message: errorMessage,
      data: payload,
      total: count
    }
  }
})

function App() {

  return (
    <>
      {/*<Child/>*/}
      <Tabs />
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-ignore
const Child = memo(() => {
  return (
    <>
      <A />
      <B />
    </>
  )
})

export default App
