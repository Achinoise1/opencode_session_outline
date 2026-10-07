import type { TuiDialogProps } from "@opencode-ai/plugin/tui"

export type OutlineItem = {
  index: number
  sessionID: string
  messageID: string
  title: string
  timeCreated?: number
}

export type SessionOutlineOptions = {
  command: string
  openKey: string
  truncate: number
  dialogSize: NonNullable<TuiDialogProps["size"]>
}

export type MessageLike = {
  id: string
  role: string
  time?: {
    created?: number
  }
}

export type PartLike = {
  type?: string
  text?: string
  data?: unknown
}

export type JumpResult = "ok" | "missing" | "unavailable"
