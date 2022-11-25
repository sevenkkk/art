import { A } from './compontents/A'
import { B } from './compontents/B'
import { memo } from 'react'
import React from 'react'
import { CustomAxios } from './compontents/custom-axios'

function App() {
  return (
    <>
      {/*<Child/>*/}
      {/* <CustomFetch />*/}
      <CustomAxios />
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
