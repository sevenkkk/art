import * as React from 'react'
import { Art, TemplateConfigOptions } from './art'

let init = false

type Props = {
  children: React.ReactNode
  config?: TemplateConfigOptions
}

export function ArtProvider({ children, config }: Props) {
  if (!init) {
    init = true
    Art.setup(config)
  }

  return <>{children}</>
}
