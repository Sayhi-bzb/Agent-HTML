# AHTML Desktop Roadmap

## Product Direction

AHTML Desktop is an artifact-first workbench, not an IDE. A user selects a
project directory; the app connects its `agent-html/` workspace, starts the
Canvas runtime, and opens the existing artifact inspection and prompt flow.

The current Canvas constitution remains authoritative for workspace, artifact,
host, and protocol behavior:

- [`apps/docs/content/docs/index.mdx`](apps/docs/content/docs/index.mdx)
- [`apps/docs/content/docs/architecture.mdx`](apps/docs/content/docs/architecture.mdx)
- [`apps/docs/content/docs/design-system.mdx`](apps/docs/content/docs/design-system.mdx)

Historical App and Runtime code under `_archive` is reference only.

## Target Shape

```text
Tauri desktop shell
  -> workspace selection and session lifecycle
  -> authenticated Canvas runtime sidecar
  -> existing React Canvas host
  -> <project>/agent-html
```

Tauri owns the application window, project selection, permissions, recent
workspaces, sidecar supervision, settings, and updates. The Node sidecar keeps
Vite compilation, artifact discovery, guard checks, source mutation, and agent
pipeline integration. The React host remains the Canvas operating frame.

The app bundles its runtime. Opening a workspace must not depend on a project
`npm run` script, package manager, local Node installation, or
`agent-html/node_modules`.

## Desktop Visual Contract

Desktop chrome is token-led and borderless by default.

- Establish hierarchy with spacing, alignment, typography, density, and
  foreground emphasis before adding a surface treatment.
- Do not use colored cards, decorative background blocks, routine borders,
  gradients, or shadow depth to group ordinary content.
- Consume semantic CSS variables such as `--background`, `--foreground`,
  `--muted-foreground`, `--accent`, `--ring`, and `--destructive` directly or
  through an existing primitive's semantic mapping.
- Own desktop structural values centrally as `--canvas-desktop-*` tokens. Do
  not scatter local width, spacing, radius, color, shadow, or layer scales.
- Reserve token-driven boundaries for behavior that needs them: focus-visible,
  selected, invalid, destructive, and transient overlay states, or a spatial
  ambiguity that spacing and alignment cannot resolve.
- Keep Tailwind utilities compositional. New product composition must not add
  raw palette utilities, literal colors, component-local `color-mix`, or local
  primitive restyling.
- Desktop UI primitives belong to the packaged app. Desktop code must not
  import from a user-selected `agent-html/components/ui` directory.

Before Desktop UI implementation, update the canonical Canvas and Host design
routes to replace their current border-led hierarchy direction with this
token-led default. Preserve visible keyboard focus, non-color-only state
communication, and accessible contrast.

## Delivery Sequence

### 0. Lock Owners And Boundaries

- Add Desktop ownership without moving artifact layout or protocol behavior
  into the app shell.
- Define source owners for the Tauri shell, Desktop renderer, runtime bridge,
  session state, and shared contracts.
- Update current design routes and executable boundary checks before adding
  Desktop composition.
- Keep the CLI development path operational throughout Desktop work.

**Exit:** architecture, style ownership, and package boundaries have one
documented owner each; archive code is not part of the dependency graph.

### 1. Stabilize The Runtime Contract

- Replace fixed Host API calls with a client configured by runtime base URL and
  authenticated session.
- Add a machine-readable runtime-ready event containing protocol version,
  project root, URL, and process identity.
- Define health, graceful shutdown, log location, and App/Runtime compatibility
  contracts.
- Add per-launch authentication for Host APIs and runtime modules without
  exposing the credential in persisted workspace files.
- Preserve `npx agent-html dev` as the standalone development entrypoint.

**Exit:** a controller can start the runtime on a random port, authenticate,
render an artifact, read health, and shut it down without parsing human log
text.

### 2. Add The Tauri Workspace Session

- Create the Tauri 2 application and package the runtime as a managed sidecar.
- Implement folder selection and normalize either a project root or a directly
  selected `agent-html/` directory to one project root.
- Model `idle`, `opening`, `initializing`, `starting`, `ready`, `failed`, and
  `closing` session states.
- Validate workspace presence and use the existing initialization contract when
  the user elects to create `agent-html/`.
- Persist recent workspaces outside project source; handle moved, missing, and
  inaccessible paths explicitly.
- Stop watchers, Vite, agent bridges, and child processes before switching
  workspaces or exiting.

**Exit:** users can open, initialize, close, reopen, and switch workspaces with
one runtime per active window and no orphan process.

### 3. Complete The Desktop Product Surface

- Build Workspace Home with Open Folder, Create Workspace, and recent workspace
  rows.
- Build boot and recovery surfaces for validation, initialization, runtime
  startup, compilation, crash, permission, and compatibility failures.
- Add a compact workspace switcher to the existing Canvas frame without
  competing with artifact content.
- Add minimal settings for language, theme, agent pipeline, external editor,
  updates, logs, and version information.
- Reuse accessible primitives for controls, dialogs, command surfaces, loading,
  and feedback. Hand-author only AHTML-specific composition and state behavior.

**Exit:** every session state has one primary action, a recovery path, keyboard
navigation, stable focus behavior, and no unexplained blank or loading surface.

### 4. Harden Agent Collaboration

- Preserve the existing `artifactEntry + blockId + implementationPath +
  interactionSnapshot` prompt contract.
- Surface agent availability, active thread, turn progress, failure, and retry
  without making agent infrastructure the primary workspace navigation.
- Keep artifact source outside privileged Desktop, filesystem, shell, MCP, and
  host APIs.
- Enforce canonical project paths, symlink-safe containment, destructive action
  confirmation or recovery, and authenticated local requests.
- Retain guard feedback and artifact hot refresh across agent changes.

**Exit:** a user can target a block, send a request, observe progress, inspect
the resulting artifact, and recover from agent or runtime failure without
leaving the workspace.

### 5. Release The Desktop App

- Build signed Windows, macOS, and Linux packages with the matching runtime
  sidecar and resources.
- Add automatic update metadata, release-channel compatibility, and safe update
  recovery.
- Verify first launch, recent workspace migration, offline startup, clean quit,
  crash cleanup, and uninstall behavior.
- Publish package size, startup time, artifact-ready time, and idle resource
  budgets as release gates.

**Exit:** a clean machine can install AHTML Desktop, open a portable workspace,
run an artifact, collaborate through a block prompt, update the app, and remove
it without requiring external runtime setup.

## Planned Contracts

The Desktop session state is explicit and serializable:

```ts
type WorkspaceSession =
  | { status: "idle" }
  | { status: "opening" | "initializing" | "starting"; root: string }
  | {
      status: "ready"
      root: string
      runtimeUrl: string
      protocolVersion: number
    }
  | { status: "failed"; root?: string; error: WorkspaceError }
  | { status: "closing"; root: string }
```

The runtime handshake and API client must be versioned. Credentials are
per-launch, scoped to the selected runtime, and cleared on close. Desktop
preference persistence must not become artifact or workspace source state.

## Verification Gates

- Open an existing workspace and render every discovered artifact.
- Initialize a missing workspace without overwriting an existing directory.
- Recover from inaccessible paths, stale recent entries, occupied ports,
  compile failures, sidecar crashes, and incompatible protocol versions.
- Switch projects without leaking watchers, servers, threads, or preferences.
- Reject unauthorized local API calls and paths outside the selected workspace.
- Preserve CLI, artifact protocol, guard, theme, prompt, and interaction-state
  regression suites.
- Verify keyboard-only operation, visible focus, screen-reader names, reduced
  motion, selectable content, and light/dark contrast.
- Add a Desktop style-ownership check that rejects raw colors, palette
  utilities, unowned visual constants, and unapproved border declarations in
  product composition.

## Implementation Status

Stages 0–4 are implemented. The Desktop shell owns workspace selection,
explicit session and recovery states, preferences, runtime supervision, and
the compact Canvas frame. The bundled Node runtime owns the existing CLI,
registry, Guard, Codex bridge, and React Canvas Host behind a versioned,
authenticated loopback contract.

The Linux release candidate builds as a 135 MB Deb. A clean extracted-package
smoke test initializes a new project, starts the packaged authenticated runtime,
passes health, and shuts down gracefully. Desktop tests, accessibility and
style ownership checks, TypeScript builds, Rust checks, CLI runtime/security
tests, documentation builds, and package-content validation pass.

The packaged Tauri/WebKit E2E opens a recent workspace through the real
renderer and Rust IPC, verifies Settings focus, reaches the authenticated
Canvas, detects a forced sidecar crash, recovers through Retry, switches
workspaces through graceful shutdown, and leaves no runtime or driver process.

Stage 5 remains release-bound: Windows and macOS packages, platform signing,
and an automatic-update feed require CI runners and release credentials not
stored in this repository. The app does not claim automatic updates until that
signed channel exists.

## V1 Non-Goals

- Embedded code editor, terminal, file tree, or language server
- Git client or source-control workflow
- Accounts, cloud storage, or workspace synchronization
- Multiple simultaneous project runtimes in one window
- Multi-agent orchestration or agent-private project directories
- Rewriting the Vite and Node Canvas runtime in Rust
