import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { JumpResult } from "./types.js"

type RenderableLike = {
  id?: unknown
  name?: unknown
  y?: unknown
  scrollY?: unknown
  scrollBy?: unknown
  children?: unknown
  parent?: unknown
}

export function jumpToMessage(api: TuiPluginApi, messageID: string): JumpResult {
  const renderer = api.renderer as unknown as { root?: unknown }
  const root = renderer.root as RenderableLike | undefined
  if (!root) return "unavailable"

  const target = findRenderable(root, messageID)
  if (!target) return "missing"

  const scroller = findScroller(target)
  if (!scroller) return "unavailable"

  const targetY = typeof target.y === "number" ? target.y : 0
  const scrollY = typeof scroller.scrollY === "number" ? scroller.scrollY : 0
  const delta = targetY - scrollY
  const scrollBy = scroller.scrollBy as ((amount: number) => void) | undefined
  if (typeof scrollBy !== "function") return "unavailable"
  scrollBy.call(scroller, delta)
  return "ok"
}

function findRenderable(root: RenderableLike, targetID: string): RenderableLike | undefined {
  const queue: RenderableLike[] = [root]
  const seen = new Set<RenderableLike>()
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || seen.has(current)) continue
    seen.add(current)
    if (matchesID(current, targetID)) return current
    for (const child of childrenOf(current)) queue.push(child)
  }
  return undefined
}

function matchesID(renderable: RenderableLike, targetID: string) {
  return renderable.id === targetID || renderable.name === targetID
}

function childrenOf(renderable: RenderableLike): RenderableLike[] {
  const children = renderable.children
  if (Array.isArray(children)) return children.filter(isRenderableLike)
  if (children && typeof children === "object" && Symbol.iterator in children) {
    return Array.from(children as Iterable<unknown>).filter(isRenderableLike)
  }
  return []
}

function findScroller(target: RenderableLike): RenderableLike | undefined {
  let current: RenderableLike | undefined = target
  while (current) {
    if (typeof current.scrollBy === "function") return current
    current = isRenderableLike(current.parent) ? current.parent : undefined
  }
  return undefined
}

function isRenderableLike(value: unknown): value is RenderableLike {
  return !!value && typeof value === "object"
}
