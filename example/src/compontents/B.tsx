import { C } from './C'
import React from 'react'
import { eventListStore } from './test.hooks'

export const B = () => {
  console.log('renderB')
  const { run, data, total } = eventListStore

  console.log(data)
  console.log(total)

  console.log('renderB', data)
  return (
    <div>
      B<button onClick={() => run()}>点击</button>
      <C></C>
    </div>
  )
}
