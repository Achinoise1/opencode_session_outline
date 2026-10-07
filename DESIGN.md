# OpenCode Session Outline Design

## Problem

Long OpenCode sessions are hard to navigate. The user wants a current-session question outline similar to a document table of contents, with quick jumping to each Q/A pair.

## Phase 1: External TUI Plugin

Phase 1 intentionally avoids OpenCode core changes. The plugin provides a `/outline` command and optional keybinding that opens a searchable list of the current session's user questions.

### Goals

- Work as an external OpenCode TUI plugin.
- Read the active `sessionID` from `api.route.current`.
- Extract all `user` messages from `api.state.session.messages(sessionID)` and `api.state.part(messageID)`.
- Show the questions in `api.ui.DialogSelect`.
- Jump to the selected user message on enter.
- Keep extraction and configuration as pure functions with unit tests.

### Non-Goals

- No cross-session search.
- No semantic/vector search.
- No LLM-generated summaries.
- No persistent floating sidebar in the first version.
- No guarantee that very old, non-rendered messages can be jumped to.

### User Flow

```txt
User runs /outline or presses <leader>o
Plugin opens Current Session Questions picker
User filters and selects a question
Picker closes
Plugin attempts to scroll to the selected user message
Plugin shows a toast if the message is not currently rendered
```

### Data Model

```ts
type OutlineItem = {
  index: number
  sessionID: string
  messageID: string
  title: string
  timeCreated?: number
}
```

Each `user` message starts one Q/A pair. The first version displays the first textual part from that user message, normalized and truncated.

### Jump Strategy

OpenCode currently has no public `scrollToMessage(messageID)` API for TUI plugins. Phase 1 uses a best-effort strategy:

- Scan renderer root descendants for renderables with an id/name matching the message id.
- Find a nearby scroll container.
- Scroll until the target is visible or report failure.

This logic is isolated in `src/jump.ts` so it can be replaced if OpenCode exposes a stable API later.

### Risks

- Renderer internals may change.
- The target message may not be rendered for long sessions.
- Different terminals may affect keybinding ergonomics.
- TUI plugin APIs are evolving between OpenCode versions.

## Phase 2: OpenCode Core Support

If Phase 1 proves useful, the stable solution is an OpenCode core API such as:

```ts
tui.scrollToMessage({ sessionID, messageID })
```

or built-in commands:

```txt
messages_next_user
messages_previous_user
messages_jump_to
session_outline
```

With that API, the plugin can focus on UI and no longer depend on renderer tree scanning.
