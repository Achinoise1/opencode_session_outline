import type { TuiPluginApi } from "@opencode-ai/plugin/tui"
import type { JumpResult } from "./types.js"

type RenderableLike = {
  id?: unknown
  name?: unknown
  y?: unknown
  scrollBy?: unknown
  getChildren?: unknown
}

export function jumpToMessage(api: TuiPluginApi, messageID: string): JumpResult {
  const renderer = api.renderer as unknown as { root?: unknown }
  const root = renderer.root as RenderableLike | undefined
  if (!root) return "unavailable"

  for (const targetID of targetIDs(messageID)) {
    const hit = findRenderableTarget(root, targetID)
    if (!hit) continue
    const targetY = typeof hit.target.y === "number" ? hit.target.y : 0
    const scrollY = typeof hit.scroll.y === "number" ? hit.scroll.y : 0
    const scrollBy = hit.scroll.scrollBy as ((amount: number) => void) | undefined
    if (typeof scrollBy !== "function") return "unavailable"
    scrollBy.call(hit.scroll, targetY - scrollY - 1)
    return "ok"
  }

  return "missing"
}

export function jumpToMessageAsync(api: TuiPluginApi, messageID: string, timeout = 1_000): Promise<JumpResult> {
  const started = Date.now()
  return new Promise((resolve) => {
    const tick = () => {
      const result = jumpToMessage(api, messageID)
      if (result !== "missing" || Date.now() - started >= timeout) {
        resolve(result)
        return
      }
      setTimeout(tick, 50)
    }
    setTimeout(tick, 50)
  })
}

function targetIDs(messageID: string) {
  return [messageID, `text-${messageID}`, `message-${messageID}`]
}

function findRenderableTarget(
  node: unknown,
  targetID: string,
  scroll?: RenderableLike,
): { target: RenderableLike; scroll: RenderableLike } | undefined {
  if (!isRenderableLike(node)) return undefined
  const nextScroll = isScrollNode(node) ? node : scroll
  if (matchesID(node, targetID) && nextScroll) return { target: node, scroll: nextScroll }

  for (const child of childrenOf(node)) {
    const result = findRenderableTarget(child, targetID, nextScroll)
    if (result) return result
  }
  return undefined
}

function isScrollNode(renderable: RenderableLike) {
  return typeof renderable.scrollBy === "function"
}

function matchesID(renderable: RenderableLike, targetID: string) {
  return renderable.id === targetID || renderable.name === targetID
}

function childrenOf(renderable: RenderableLike): RenderableLike[] {
  const getChildren = renderable.getChildren as (() => unknown[]) | undefined
  if (typeof getChildren === "function") return getChildren.call(renderable).filter(isRenderableLike)

  const children = (renderable as { children?: unknown }).children
  if (Array.isArray(children)) return children.filter(isRenderableLike)
  if (children && typeof children === "object" && Symbol.iterator in children) {
    return Array.from(children as Iterable<unknown>).filter(isRenderableLike)
  }
  return []
}

function isRenderableLike(value: unknown): value is RenderableLike {
  return !!value && typeof value === "object"
}
