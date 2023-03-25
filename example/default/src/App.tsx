import React from "react";
import { ChangeEvent } from "react";
import { resso, useFetch } from "art";
import "./fetch-setup";

export const store = resso({
  tabsList: ["popular", "realTime", "month"],
  index: 0,
  count: 0
});

const App = () => {
  const { tabsList, index, count } = store;

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
  );
};

type ListDivPros = {
  type: string
}


type TestModel = {
  accId: string
  goodsImg: GoodsImgModel[]
}

type GoodsImgModel = {
  id: string
  fileName: string
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
  const store = useFetch<TestModel>(
    "/duxing/api/chaoyu_index_queryGoodsDetails_v1",
    {
      defaultBody: {
        "goodsId": "143610019661802561",
        "language": "chineseZh"
      },
      pagination: true,
      onSuccess: () => {
        console.log(store);
      },
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
  );

  const { data, isLoading, run } = store;

  console.log('12321321');

  const handleChange = (event: ChangeEvent) => {
    // @ts-ignore
    const type = event.target.value;
    run({ type });
  };

  return (
    <>
      {isLoading && <div>loading</div>}
      {data?.goodsImg?.map((item) => (
        <div key={item.id}>
          <span>{item.fileName}:</span>
          {/*<button onClick={() => store.setIndex(i)}>设置当前active{i}</button>*/}
        </div>
      ))}

      <button onClick={() => store.refresh({ status: false })}>点击刷新</button>
      <button onClick={() => store.cancel()}>点击取消请求</button>
      <input onChange={handleChange} />

      <button onClick={() => store.setPageRun({ current: 2 })}>
        点击获取第二页
      </button>
    </>
  );
};

export default App;
