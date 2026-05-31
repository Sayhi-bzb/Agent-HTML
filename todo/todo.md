# Thread Panel Architecture TODO

## Goal

让 thread panel 具备独立 window 的架构基础，但不要一步直接跳到 native window。先把 panel UI、数据协议、宿主生命周期拆开，避免把 workspace controller、Codex state、pet UI、Tauri window lifecycle 搅在一起。

## Upgrade Rhythm

### Phase 1: Surface 解耦

目标：先把 thread panel 从 pet 里解出来，但仍然留在 app 内。

- 抽 `ThreadPanelSurface`
- 输入只接受纯数据 snapshot
- 输出只通过 action callbacks / dispatch
- `PetThreadPanelContent` 变成 surface 的 app-hosted wrapper
- 不引入 Tauri window

成功标准：thread panel UI 不再依赖 `WorkspaceGhostPet` 的内部结构，pet 只是一个打开入口。

### Phase 2: Bridge 协议化

目标：把现在的 React closure props 变成明确协议。

- 定义 `ThreadPanelSnapshot`
- 定义 `ThreadPanelAction`
- 建 `ThreadPanelBridge`
- app 内 host 也通过 bridge 消费 snapshot、dispatch action
- action 包括 submit prompt、new thread、resume thread、rename thread、close、interrupt、search open state

成功标准：thread panel 不直接知道 workspace controller，只知道 snapshot/action。

### Phase 3: App 内 Window Host

目标：先做“窗口语义”，但仍在同一个 React root 内。

- 独立位置、尺寸、层级
- 可关闭、可拖动、可 resize
- 不再依附 pet popover
- 仍不走 Tauri native window

成功标准：用户感知上它已经像独立 panel/window；工程上仍简单，可调试，状态同步无跨进程问题。

### Phase 4: Native Window Host

目标：在协议稳定后再接 Tauri secondary window。

- 新增 `thread-panel` window label / route
- `ThreadPanelWindowApp` 作为新 React root
- bridge 从 in-memory 改成 Tauri event/command transport
- 主窗口负责 publish snapshot
- 子窗口 dispatch actions 回主窗口
- 处理主窗口关闭、project 切换、thread stale、window restore/focus

成功标准：native window 只是另一个 host，不复制 thread panel 业务逻辑。

## Principle

```txt
UI surface -> protocol bridge -> app window host -> native window host
```

不要现在直接开 `WebviewWindow`。那会把 UI、workspace controller、Codex state、window lifecycle 绑定在一起。每一阶段都应该可以独立验证，并且停在一个有产品价值的状态。
