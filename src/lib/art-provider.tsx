import React, { ReactNode } from 'react'
import { Art, TemplateConfigOptions } from './art'

let init = false

type Props = {
  children: ReactNode
  config?: TemplateConfigOptions
}

export function ArtProvider({ children, config }: Props) {
  if (!init) {
    init = true
    Art.setup(config)
  }

  return <div>{children}</div>
}
