import { CachedData } from './model'

const dataCache: Map<string, CachedData> = new Map()

export function createCacheKey(key?: string, ids?: string[]) {
  const prefix = 'key'
  return `${prefix}_${key}` + ids?.map((id) => `_${id}`)
}

export function setCache<TData, TBody>(
  key: string,
  data: CachedData<TData, TBody>
) {
  dataCache.set(key, data)
}

export function getCache<TData, TBody>(
  key: string
): CachedData<TData, TBody> | undefined {
  return dataCache.get(key) as CachedData<TData, TBody> | undefined
}

export function clearCache(key: string) {
  dataCache.delete(key)
}
