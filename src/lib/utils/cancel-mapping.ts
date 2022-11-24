export class CancelMapping {
  cancelMap: Map<string, () => void> = new Map()

  putCancel(key: string, cancel: () => void) {
    this.cancelMap.set(key, cancel)
    return key
  }

  delCancel(key: string) {
    this.cancelMap.delete(key)
  }

  cancelAll() {
    this.cancelMap.forEach((item) => {
      item()
    })
    this.cancelMap.clear()
  }
}
