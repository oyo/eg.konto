type NodeContent = NodeContentItem | NodeContentItem[]
type NodeContentItem = HTMLElement | number | string | SVGElement | Text

const append = (n: HTMLElement | SVGElement, c: NodeContent) => {
  ;(Array.isArray(c) ? c : [c]).forEach((ci) =>
    n.appendChild(
      ci instanceof HTMLElement || ci instanceof SVGElement || ci instanceof Text
        ? ci
        : document.createTextNode(ci as string),
    ),
  )
  return n
}

export const N = (tag: string, c?: NodeContent, att?: Record<string, string>) => {
  const n = document.createElement(tag)
  if (att)
    Object.entries(att).forEach(([k, v]) => {
      n.setAttribute(k, v)
    })
  if (!c) return n
  return append(n, c)
}

export const addEvents = (
  node: HTMLElement | SVGElement,
  evts: Record<string, (e: Event) => void>,
) => {
  Object.keys(evts).forEach((key) => {
    node.addEventListener(key, evts[key])
  })
  return node
}

export const debounce = <T extends unknown[]>(callback: (...args: T) => void, delay: number) => {
  let timeoutTimer: ReturnType<typeof setTimeout>

  return (...args: T) => {
    clearTimeout(timeoutTimer)
    timeoutTimer = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}
