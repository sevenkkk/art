import React from 'react'
import { ChangeEvent, useEffect } from 'react'
import { resso, useFetch } from 'art'
import '../fetch-valtio-setup'

export const store = resso({
  tabsList: ['popular', 'realTime', 'month'],
  index: 0,
  count: 0
})

export const Default = () => {
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
export const ListDiv = ({ type }: ListDivPros) => {
  const store = useFetch<LiveMode[], { type: string }>(
    /* (body) => query(body),*/
    '/app/live/streamer/ranking/list',
    {
      /*postData: (data: LiveMode[]) => (data.map((item, index) => ({...item, no: index}))),
		convertRes: (res) => {
			const {success, errorCode, errorMessage, payload, count} = res.data || {};
			return {success, code: errorCode, message: errorMessage, data: payload, count: count || 0};
		},*/
      defaultBody: { type: type },
      // isDefaultSet: false,
      pagination: true,
      loading: true,
      // manual: true,
      // method: 'get',
      // loadingDelayMs: 3000,
      // debounceMs: 1000,
      // throttleMs:1000,
      // pollingIntervalMs: 1000,
      // refreshOnWindowFocus: true,
      // refreshOnWindowFocusTimespanMs: 5000,
      // cache: () => [type],
      onSuccess: () => {
        console.log(store)
      }
    },
    [type]
  )

  /*const submit = useSubmit<{ status: string }>('/health', {
    manual: false,
    convertRes: (res) => ({ success: true, data: res.data.status })
  })*/

  const { data, isBusy, run } = store

  useEffect(() => {
    // store.run().then((data) => console.log(data))
    store.cancel()
  }, [])

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
}
