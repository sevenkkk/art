import 'whatwg-fetch'
import { Art, ArtConfigOptions } from './lib/art'
import {
  makeQuery,
  makeMutation,
  useQuery,
  useMutation,
  makePagination,
  usePagination
} from './lib/fetch'

import { useAutoQuery, useAutoMutate } from './lib/hooks'

export * from './lib/art-provider'
export * from './lib/model'
export {
  Art,
  ArtConfigOptions,
  makeQuery,
  makeMutation,
  makePagination,
  useQuery,
  useMutation,
  usePagination,
  useAutoQuery,
  useAutoMutate
}
