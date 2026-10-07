import type { SessionOutlineOptions } from "./types.js"

const defaultOptions: SessionOutlineOptions = {
  command: "outline",
  openKey: "<leader>o",
  truncate: 72,
  dialogSize: "large",
}

const dialogSizes = new Set(["medium", "large", "xlarge"])

export function parseOptions(input: unknown): SessionOutlineOptions {
  if (!input || typeof input !== "object" || Array.isArray(input)) return defaultOptions
  const raw = input as Record<string, unknown>
  return {
    command: readString(raw.command, defaultOptions.command),
    openKey: readString(raw.openKey, defaultOptions.openKey),
    truncate: readPositiveInteger(raw.truncate, defaultOptions.truncate),
    dialogSize: readDialogSize(raw.dialogSize, defaultOptions.dialogSize),
  }
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback
}

function readPositiveInteger(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback
}

function readDialogSize(value: unknown, fallback: SessionOutlineOptions["dialogSize"]) {
  return typeof value === "string" && dialogSizes.has(value) ? (value as SessionOutlineOptions["dialogSize"]) : fallback
}
