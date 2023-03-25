import React from 'react'
import { ChangeEvent } from 'react'
import { resso, useFetch } from 'art'
import './fetch-axios-setup'

export const store = resso({
  tabsList: ['popular', 'realTime', 'month'],
  index: 0,
  count: 0
})

const App = () => {
  const { tabsList, index, count } = store

  return (
    <div>
      Tabs
      {tabsList.map((item: string, i: number) => (
        <button key={item} onClick={() => (store.index = i)}>
          item
        </button>
      ))}
      <button onClick={() => store.count++}>点击count+1 {count}</button>
      <ListDiv type={tabsList[index]} />
    </div>
  )
}

type ListDivPros = {
  type: string
}

type LiveMode = {
  streamID: string
  userName: string
  nickname: string
  no: number
}

export const ListDiv = ({ type }: ListDivPros) => {
  const store = useFetch<LiveMode[], { type: string }>(
    '/app/live/streamer/ranking/list',
    {
      defaultBody: { type: type },
      pagination: true,
      loading: true,
      onSuccess: () => {
        console.log(store)
      }
    },
    [type]
  )

  const { data, isLoading, run } = store

  const handleChange = (event: ChangeEvent) => {
    // @ts-ignore
    const type = event.target.value
    run({ type })
  }

  return (
    <>
      {isLoading && <div>loading</div>}
      {data?.map((item, index) => (
        <div key={index}>
          <span>{item.no}:</span>
          <span>{item.userName}</span>
          {/*<button onClick={() => store.setIndex(i)}>设置当前active{i}</button>*/}
        </div>
      ))}

      <button onClick={() => store.refresh({ status: true })}>点击刷新</button>
      <input onChange={handleChange} />

      <button onClick={() => store.setPageRun({ current: 2 })}>
        点击获取第二页
      </button>
    </>
  )
}
export default App
