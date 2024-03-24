import React, { PropsWithChildren, useRef } from 'react'
import { Art, ArtConfigOptions } from './art'

type Props = PropsWithChildren<{
  config?: ArtConfigOptions
}>

export function ArtProvider({ children, config }: Props) {
  const init = useRef(false)

  if (!init.current) {
    init.current = true
    Art.setup(config)
  }

  return <div>{children}</div>
}
