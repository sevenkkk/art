export const CancelablePromise = <T>(
  executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
  ) => void,
  abortSignal: AbortSignal
) => {
  // 记录reject和resolve方法
  let _reject: any = null
  let _resolve: any = null
  let _isExecResolve = false
  // 创建和执行Promise
  const cancelablePromise = new Promise<T>((resolve, reject) => {
    _reject = reject
    _resolve = (value: T) => {
      _isExecResolve = true
      resolve(value)
    }
    return executor(_resolve, reject)
  })
  // 监听Signal的abourt事件
  abortSignal.addEventListener('abort', () => {
    if (_isExecResolve) {
      return
    }
    // 抛出错误
    _reject({ message: 'cancel' })
  })
  return cancelablePromise
}
