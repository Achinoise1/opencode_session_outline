# opencode-session-outline

OpenCode TUI plugin for jumping between user questions in the current session.

## Status

This is a first-pass plugin implementation. It focuses on a stable `/outline` command instead of a persistent floating sidebar.

## Usage

Configure the plugin in `opencode.jsonc`:

```jsonc
{
  "plugin": [
    [
      "C:/Users/WillowWei/Documents/code/opencode_session_outline/dist/src/index.js",
      {
        "openKey": "<leader>o",
        "command": "outline",
        "truncate": 72,
        "dialogSize": "large"
      }
    ]
  ]
}
```

Then restart OpenCode and run:

```txt
/outline
```

or press the configured keybinding.

## Behavior

- Lists user messages from the active session.
- Shows a searchable `DialogSelect` picker.
- Selecting an item attempts to scroll the message view to that user message.
- If the target message is not currently rendered by the TUI, the plugin shows a warning toast.

## Known Limitations

OpenCode does not currently expose a stable public `scrollToMessage(messageID)` API for TUI plugins. The jump implementation therefore uses a best-effort renderer tree scan. This can fail when a message is outside the rendered window or when OpenCode internals change.
