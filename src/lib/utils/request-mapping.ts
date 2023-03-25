export class RequestMapping {
  static requestMap: Map<string, () => Promise<any>> = new Map()

  static put(key: string, request: () => Promise<any>) {
    this.requestMap.set(key, request)
    return key
  }

  static del(key: string) {
    this.requestMap.delete(key)
  }

  static empty() {
    return this.requestMap.size === 0
  }
}
