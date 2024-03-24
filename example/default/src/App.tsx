import React, { useEffect } from 'react'
import { ChangeEvent } from 'react'
import { useQuery } from 'art'
import './fetch-setup'

import resso from 'resso'
import { Sport } from './types'

export const store = resso({
  tabsList: ['popular', 'realTime', 'month'],
  index: 0,
  count: 0
})

store({})

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
export const ListDiv = ({ type }: ListDivPros) => {
  const store = useQuery<
    Sport[],
    {
      gameType: number,
      scrollType: number
    }
  >(
    ({ gameType })=>`/app/game/sport/match/list/${gameType}`,
    {
      defaultBody: {
        gameType: 3,
        scrollType: 1
      },
      manual: true,
      cache: true,
      // revalidate: 10,
      onSuccess: () => {
        console.log(store)
      }
      /*initialData: () => {
        return [
          {
            streamID: "test001",
            userName: "test001",
            no: 1,
            nickname: type
          }
        ];
      },
      placeholderData: [
        {
          streamID: "placeholderData",
          userName: "placeholderData",
          no: 1,
          nickname: type
        }
      ]*/
    },
    [type]
  )

  const { data, query } = store

  console.log(data)

  useEffect(() => {
    query({ gameType: 3 })
  }, [])
  const handleChange = (event: ChangeEvent) => {
    // @ts-ignore
    const type = event.target.value
    // query({ type })
  }

  return (
    <>
      {/*{isLoading && <div>loading</div>}*/}
      {(data ?? []).map((item) => (
        <div key={item.lotteryID}>
          <span>{item.lotteryName}:</span>
          {/*<button onClick={() => store.setIndex(i)}>设置当前active{i}</button>*/}
        </div>
      ))}

      <button onClick={() => store.refresh({ status: false })}>点击刷新</button>
      <button onClick={() => store.cancel()}>点击取消请求</button>
      <input onChange={handleChange} />

      {/*<button onClick={() => store.setPageQuery({ current: 2 })}>
        点击获取第二页
      </button>*/}
      <button onClick={() => store.clear()}>清除</button>
    </>
  )
}

export default App
