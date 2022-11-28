import React from 'react'
import { ChangeEvent } from 'react'
import { useFetch } from 'art'
import './fetch-mobx-setup'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react'

export const store = makeAutoObservable({
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

/*const query = (body: { type: string }) => {
  return fetch('https://api-t.bagel7777.com/app/live/streamer/ranking/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
    body: JSON.stringify(body)
  })
}*/
export const ListDiv = observer(({ type }: ListDivPros) => {
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

  const { data, isBusy, run } = store

  const handleChange = (event: ChangeEvent) => {
    // @ts-ignore
    run({ type: event.target.value }).then()
  }

  return (
    <>
      {isBusy && <div>loading</div>}
      {data?.map((item) => (
        <div key={item.no}>
          <span>{item.no}:</span>
          <span>{item.userName}</span>
          {/*<button onClick={() => store.setIndex(i)}>设置当前active{i}</button>*/}
        </div>
      ))}

      <button onClick={() => store.refresh()}>点击刷新</button>
      <input onChange={handleChange} />

      <button onClick={() => store.setPageRun({ current: 2 })}>
        点击获取第二页
      </button>
    </>
  )
})

export default observer(App)
