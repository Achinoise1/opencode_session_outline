import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { jumpToMessage } from "../src/jump.js"

type Node = {
  id?: string
  y: number
  scrollBy?: (delta: number) => void
  getChildren: () => Node[]
}

function node(input: Omit<Node, "getChildren"> & { children?: Node[] }): Node {
  const children = input.children ?? []
  return {
    ...input,
    getChildren: () => children,
  }
}

describe("jumpToMessage", () => {
  it("finds a rendered message under a scroll node", () => {
    let scrolled = 0
    const root = node({
      y: 0,
      children: [
        node({
          y: 10,
          scrollBy: (delta) => {
            scrolled = delta
          },
          children: [node({ id: "msg_test", y: 42 })],
        }),
      ],
    })

    const result = jumpToMessage({ renderer: { root } } as never, "msg_test")

    assert.equal(result, "ok")
    assert.equal(scrolled, 31)
  })

  it("returns missing when the target is absent", () => {
    const root = node({ y: 0, children: [node({ y: 1, scrollBy: () => {}, children: [] })] })
    assert.equal(jumpToMessage({ renderer: { root } } as never, "msg_missing"), "missing")
  })
})
