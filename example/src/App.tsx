import { A } from './compontents/A'
import { B } from './compontents/B'
import { memo } from 'react'
import { AxiosResponse } from 'axios'
import { Tabs } from './compontents/Tabs'
import { Art, UseResult } from 'art'
import React from 'react'
import { makeAutoObservable } from 'mobx'

export const store = makeAutoObservable({ count: 0, text: 'hello' })

Art.setup({
  baseURL: 'https://api-t.bagel7777.com',
  handlePage: (current, pageSize) => {
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
  const { count } = store // destructure at top first 🥷
  console.log(count)

  return (
    <>
      {count}
      <button onClick={() => store.count++}>+</button>
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
