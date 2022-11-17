import React from 'react'
import { ChangeEvent, memo, useEffect } from 'react'
import resso from 'resso'
import { useQuery, useSubmit } from 'art'

export const store = resso({
  tabsList: ['popular', 'realTime', 'month'],
  index: 0,
  count: 0
})

export const Tabs = () => {
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
export const ListDiv = memo(({ type }: ListDivPros) => {
  const store = useQuery<LiveMode[], { type: string }>(
    '/app/live/streamer/ranking/list',
    {
      /*postData: (data: LiveMode[]) => (data.map((item, index) => ({...item, no: index}))),
		convertRes: (res) => {
			const {success, errorCode, errorMessage, payload, count} = res.data || {};
			return {success, code: errorCode, message: errorMessage, data: payload, count: count || 0};
		},*/
      defaultBody: { type: type },
      // isDefaultSet: false,
      usePage: true,
      // method: 'get',
      // loadingDelayMs: 3000,
      // debounceMs: 1000,
      // throttleMs:1000,
      // pollingIntervalMs: 1000,
      // refreshOnWindowFocus: true,
      // refreshOnWindowFocusTimespanMs: 5000,
      cache: () => [type],
      onSuccess: () => {}
    },
    [type]
  )

  const submit = useSubmit<{ status: string }>('/health', {
    manual: false,
    convertRes: (res) => ({ success: true, data: res.data.status })
  })

  const { data, isBusy, run, error } = store

  const { data: healthData } = submit

  console.log(healthData)

  console.log(error)

  useEffect(() => {
    setTimeout(() => {
      store.cancel()
    }, 100)
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

      <button onClick={() => store.setPage({ current: 2 })}>
        点击获取第二页
      </button>
    </>
  )
})
