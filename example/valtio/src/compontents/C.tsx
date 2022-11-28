import { eventListStore } from './test.hooks'
import React from 'react'

export const C = () => {
  const { run, data } = eventListStore
  console.log('randerC', data)
  return (
    <div>
      C<button onClick={() => run()}>点击C</button>
    </div>
  )
}
