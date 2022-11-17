import React, { useEffect } from 'react'
// @ts-ignore
const document: any = window ? window.document : undefined
const visible = 'visible'

/**
 * 检查浏览器标签切换
 */
export const useBrowserPageChange = () => {
  const [visibilityChange, setVisibilityChange] = React.useState<boolean>(false)

  const getHiddenProp = () => {
    if (!document) {
      return null
    }
    const prefixes = ['webkit', 'moz', 'ms', 'o']

    // if 'hidden' is natively supported just return it
    if ('hidden' in document) {
      return 'hidden'
    }

    // otherwise loop over all the known prefixes until we find one
    for (let i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'Hidden' in document) return prefixes[i] + 'Hidden'
    }

    // otherwise it's not supported
    return null
  }

  const getVisibilityState = () => {
    const prefixes = ['webkit', 'moz', 'ms', 'o']
    if ('visibilityState' in document) return 'visibilityState'
    for (let i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'VisibilityState' in document)
        return prefixes[i] + 'VisibilityState'
    }
    // otherwise it's not supported
    return null
  }

  useEffect(() => {
    const eventName =
      (getHiddenProp() ?? '').replace(/[H|h]idden/, '') + 'visibilitychange'
    if (getHiddenProp()) {
      document.addEventListener(
        eventName,
        function () {
          setVisibilityChange(document[getVisibilityState() ?? ''] === visible)
        },
        false
      )
    }
    return () => {
      document.removeEventListener(eventName, function () {
        setVisibilityChange(document[getVisibilityState() ?? ''] === visible)
      })
    }
  }, [getHiddenProp()])

  return { visibilityChange }
}
