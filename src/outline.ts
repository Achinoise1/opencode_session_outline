import type { MessageLike, OutlineItem, PartLike } from "./types.js"

export function createOutlineItems(input: {
  sessionID: string
  messages: readonly MessageLike[]
  parts: (messageID: string) => readonly PartLike[]
  truncate: number
}): OutlineItem[] {
  let index = 0
  const items: OutlineItem[] = []
  for (const message of input.messages) {
    if (message.role !== "user") continue
    index += 1
    const title = extractQuestionTitle(input.parts(message.id), input.truncate) || `User message #${index}`
    items.push({
      index,
      sessionID: input.sessionID,
      messageID: message.id,
      title,
      timeCreated: message.time?.created,
    })
  }
  return items
}

export function extractQuestionTitle(parts: readonly PartLike[], maxLength: number) {
  for (const part of parts) {
    const text = textFromPart(part)
    const normalized = normalizeText(text)
    if (normalized) return truncateText(normalized, maxLength)
  }
  return ""
}

export function normalizeText(input: string | undefined) {
  return (input ?? "").replace(/\s+/g, " ").trim()
}

export function truncateText(input: string, maxLength: number) {
  if (maxLength <= 0 || input.length <= maxLength) return input
  if (maxLength === 1) return "…"
  return `${input.slice(0, maxLength - 1)}…`
}

function textFromPart(part: PartLike) {
  if (typeof part.text === "string") return part.text
  if (part.type === "text" && part.data && typeof part.data === "object") {
    const data = part.data as Record<string, unknown>
    if (typeof data.text === "string") return data.text
  }
  return undefined
}
