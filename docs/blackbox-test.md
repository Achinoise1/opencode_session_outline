# 黑盒测试说明

本文档用于验证 `opencode-session-outline` 插件在真实 OpenCode TUI 环境中的行为。

## 1. 自动化检查

进入项目目录：

```powershell
cd C:\Users\WillowWei\Documents\code\opencode_session_outline
```

执行：

```powershell
npm run typecheck
```
```powershell
npm run build
```
```powershell
npm test
```

期望结果：

```txt
typecheck 通过
build 通过
tests 8
pass 8
fail 0
```

如果重新安装依赖时 npm 官方源超时，可以使用镜像：

```powershell
npm install --registry=https://registry.npmmirror.com
```

## 2. 启用插件

这是一个 **TUI 插件**，而不是 server 插件。TUI 插件必须注册在独立的
`tui.json` 文件中（schema 为 `https://opencode.ai/tui.json`），**不能**放进
`opencode.json`/`opencode.jsonc` 顶层的 `"plugin"` 数组。顶层 `"plugin"`
数组是给 server 插件用的（必须导出 `server()`），如果把只有 `tui()` 导出的
插件放进去，OpenCode 会报错并拒绝加载：

```txt
failed to load plugin
error="Plugin ... must default export an object with server()"
```

打开或创建：

```txt
C:\Users\WillowWei\.config\opencode\tui.json
```

（也可以用项目级的 `.opencode/tui.json`）

写入：

```jsonc
{
  "$schema": "https://opencode.ai/tui.json",
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

修改配置后，需要完全退出并重启 OpenCode。插件不会热加载。

## 3. 手动测试 `/outline`

打开一个已有 session，最好该 session 中包含多轮用户提问。

输入：

```txt
/outline
```

期望行为：

- 弹出标题为 `Current Session Questions` 的选择框。
- 选择框列出当前 session 中所有用户问题。
- 每项格式类似 `#1 ...`、`#2 ...`。
- 默认会过滤 `continue`、`retry`、`继续`、`重试` 等低信息量控制型输入；如果所有输入都属于这类内容，则回退显示全部用户输入，避免空列表。
- 可以输入关键词过滤。
- 选择某个问题后，弹窗关闭。
- 如果目标消息当前已被 TUI 渲染，插件会尝试跳转到该问题位置。
- 如果目标消息太旧或当前没有被 TUI 渲染，会显示 warning toast。

## 4. 手动测试快捷键

在 session 页面按配置的快捷键：

```txt
<leader>o
```

期望行为与 `/outline` 命令一致。

## 5. 建议测试场景

### 普通 session

前置条件：

- 当前 session 中有 3 条以上用户问题。

操作：

```txt
/outline
```

期望结果：

- 列表展示所有用户问题。
- 选择任一问题后尝试跳转。

### 首页场景

前置条件：

- 当前位于 OpenCode 首页，而不是 session 页面。

操作：

```txt
/outline
```

期望结果：

- 插件提示该功能只能在 session 中使用。

### 长 session 场景

前置条件：

- 当前 session 很长，包含较早的历史消息。

操作：

- 执行 `/outline`。
- 选择很早的问题。

期望结果：

- 如果目标消息已渲染，尝试跳转。
- 如果目标消息未渲染，显示“消息未渲染，无法跳转”相关提示。

### 标题截断配置

修改配置：

```jsonc
{
  "truncate": 20
}
```

重新构建并重启 OpenCode：

```powershell
npm run build
```

期望结果：

- `/outline` 中的问题标题会按较短长度截断。

## 6. 故障排查

检查构建产物是否存在：

```powershell
Test-Path "C:\Users\WillowWei\Documents\code\opencode_session_outline\dist\src\index.js"
```

如果返回 `False`，执行：

```powershell
npm run build
```

如果 `/outline` 没有出现，检查：

- 插件是否注册在 `tui.json` 中，而不是 `opencode.json`/`opencode.jsonc` 顶层的 `plugin` 数组。
- `tui.json` 中的插件路径是否正确。
- 路径是否使用 `/`，或 Windows 反斜杠是否已正确转义。
- OpenCode 是否完全重启过。
- 当前是否在 session 页面测试。
- `tui.json` 的 JSON 语法是否正确。
- 查看 `~/.local/share/opencode/log/opencode.log`，搜索 `failed to load plugin` 或 `failed to load tui plugin`，确认插件是否被成功加载。

## 7. 测试边界

自动化测试主要验证：

- 配置解析。
- 当前 session 问题目录提取。
- 标题归一化和截断。

黑盒测试主要验证：

- 插件是否能被 OpenCode 加载。
- `/outline` 命令是否出现并可执行。
- 选择框是否正确展示当前 session 的用户问题。
- 筛选、选择、关闭弹窗是否正常。
- 跳转失败时是否有明确提示。

实际跳转行为依赖 OpenCode TUI 的实时 renderer tree，因此必须在真实 OpenCode TUI 中验证。
