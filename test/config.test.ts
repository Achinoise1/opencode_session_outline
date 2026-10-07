import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { parseOptions } from "../src/config.js"

describe("parseOptions", () => {
  it("uses defaults for empty input", () => {
    assert.deepEqual(parseOptions(undefined), {
      command: "outline",
      openKey: "<leader>o",
      truncate: 72,
      dialogSize: "large",
    })
  })

  it("accepts valid option overrides", () => {
    assert.deepEqual(parseOptions({ command: "qa", openKey: "ctrl+o", truncate: 24, dialogSize: "xlarge" }), {
      command: "qa",
      openKey: "ctrl+o",
      truncate: 24,
      dialogSize: "xlarge",
    })
  })

  it("ignores invalid option overrides", () => {
    assert.deepEqual(parseOptions({ command: "", openKey: "   ", truncate: -1, dialogSize: "huge" }), {
      command: "outline",
      openKey: "<leader>o",
      truncate: 72,
      dialogSize: "large",
    })
  })
})
