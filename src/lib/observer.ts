import resso from './resso'
import { Art } from './art'

export function getObserver(): <T = any>(data: T) => T {
  return Art.config.observable ?? resso
}
