import React, { PropsWithChildren } from 'react'
import { Art, ArtConfigOptions } from './art'

let init = false

type Props = PropsWithChildren<{
  config?: ArtConfigOptions
}>

export function ArtProvider({ children, config }: Props) {
  if (!init) {
    init = true
    Art.setup(config)
  }

  return <div>{children}</div>
}
