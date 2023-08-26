import 'whatwg-fetch'
import { Art, ArtConfigOptions } from './lib/art'
import {
  makeQuery,
  makeMutation,
  useQuery,
  useMutation,
  makePagination,
  usePagination,
  makeInfinite,
  useInfinite
} from './lib/fetch'

import { useAutoQuery, useAutoMutate } from './lib/hooks'
import resso from './lib/obs/resso'

export * from './lib/art-provider'
export * from './lib/model'
export {
  Art,
  ArtConfigOptions,
  resso,
  makeQuery,
  makeMutation,
  makePagination,
  makeInfinite,
  useQuery,
  useMutation,
  usePagination,
  useInfinite,
  useAutoQuery,
  useAutoMutate
}
