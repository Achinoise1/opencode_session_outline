import type { TuiDialogSelectOption, TuiPlugin, TuiPluginModule } from "@opencode-ai/plugin/tui"
import { parseOptions } from "./config.js"
import { jumpToMessageAsync } from "./jump.js"
import { createOutlineItems } from "./outline.js"
import type { OutlineItem } from "./types.js"

const pluginID = "opencode-session-outline"
const commandName = "opencode.sessionOutline.open"

const tui: TuiPlugin = async (api, options) => {
  const config = parseOptions(options)

  const openOutline = () => {
    const current = api.route.current
    if (current.name !== "session") {
      api.ui.toast({ variant: "warning", message: "Session outline is only available in a session." })
      return
    }

    const sessionID = current.params?.sessionID
    if (typeof sessionID !== "string") {
      api.ui.toast({ variant: "warning", message: "Unable to determine the current session." })
      return
    }
    const items = createOutlineItems({
      sessionID,
      messages: api.state.session.messages(sessionID),
      parts: (messageID) => api.state.part(messageID),
      truncate: config.truncate,
    })

    if (items.length === 0) {
      api.ui.toast({ variant: "info", message: "No user questions found in this session." })
      return
    }

    api.ui.dialog.setSize(config.dialogSize)
    api.ui.dialog.replace(() =>
      api.ui.DialogSelect<OutlineItem>({
        title: "Current Session Questions",
        placeholder: "Search questions...",
        options: items.map(toOption),
        onSelect: (option) => {
          api.ui.dialog.clear()
          void jumpToMessageAsync(api, option.value.messageID).then((result) => {
            if (result === "missing") {
              api.ui.toast({
                variant: "warning",
                message: "That message is not currently rendered. Scroll nearer to it and try again.",
              })
            } else if (result === "unavailable") {
              api.ui.toast({ variant: "warning", message: "Unable to jump in this OpenCode TUI view." })
            }
          })
        },
      }),
    )
  }

  const unregister = api.keymap.registerLayer({
    commands: [
      {
        name: commandName,
        title: "Current Session Outline",
        category: "Navigation",
        namespace: "palette",
        slashName: config.command,
        run: openOutline,
      },
    ],
    bindings: [
      {
        key: config.openKey,
        desc: "Current session outline",
        group: "Navigation",
        cmd: commandName,
      },
    ],
  })

  api.lifecycle.onDispose(unregister)
}

function toOption(item: OutlineItem): TuiDialogSelectOption<OutlineItem> {
  return {
    title: `#${item.index} ${item.title}`,
    value: item,
    description: item.timeCreated ? new Date(item.timeCreated).toLocaleString() : undefined,
  }
}

export default {
  id: pluginID,
  tui,
} satisfies TuiPluginModule
