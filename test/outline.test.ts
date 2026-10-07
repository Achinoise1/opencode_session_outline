import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { createOutlineItems, extractQuestionTitle, normalizeText, truncateText } from "../src/outline.js"

describe("outline extraction", () => {
  it("normalizes whitespace", () => {
    assert.equal(normalizeText("  hello\n\tworld  "), "hello world")
  })

  it("truncates with ellipsis", () => {
    assert.equal(truncateText("abcdef", 4), "abc…")
  })

  it("extracts text part titles", () => {
    assert.equal(extractQuestionTitle([{ type: "text", text: " first line\nsecond line " }], 20), "first line second l…")
  })

  it("extracts user messages as outline items", () => {
    const parts = new Map([
      ["u1", [{ type: "text", text: "What is merge-tree?" }]],
      ["a1", [{ type: "text", text: "Answer" }]],
      ["u2", [{ type: "text", text: "How to delete a local branch?" }]],
    ])

    assert.deepEqual(createOutlineItems({
      sessionID: "ses_test",
      messages: [
        { id: "u1", role: "user", time: { created: 1 } },
        { id: "a1", role: "assistant", time: { created: 2 } },
        { id: "u2", role: "user", time: { created: 3 } },
      ],
      parts: (messageID) => parts.get(messageID) ?? [],
      truncate: 80,
    }), [
      {
        index: 1,
        sessionID: "ses_test",
        messageID: "u1",
        title: "What is merge-tree?",
        timeCreated: 1,
      },
      {
        index: 2,
        sessionID: "ses_test",
        messageID: "u2",
        title: "How to delete a local branch?",
        timeCreated: 3,
      },
    ])
  })

  it("falls back for empty user messages", () => {
    assert.equal(
      createOutlineItems({
        sessionID: "ses_test",
        messages: [{ id: "u1", role: "user" }],
        parts: () => [],
        truncate: 80,
      })[0]?.title,
      "User message #1",
    )
  })
})
