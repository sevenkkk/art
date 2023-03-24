import { CachedData } from '../model'
import { Art } from '../art'

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
  if (Art.config?.localCache && Art.config?.setCacheData) {
    Art.config.setCacheData(key, data)
  }
}

export function getCache<TData, TBody>(
  key: string
): CachedData<TData, TBody> | undefined {
  let data = dataCache.get(key) as CachedData<TData, TBody> | undefined
  if (!data && Art.config?.localCache && Art.config?.getCacheData) {
    data = Art.config.getCacheData<TData, TBody>(key)
  }
  return data
}

export function clearCache(key: string) {
  dataCache.delete(key)
  if (Art.config?.localCache && Art.config?.clearCacheData) {
    Art.config.clearCacheData(key)
  }
}
