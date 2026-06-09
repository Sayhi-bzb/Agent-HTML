import { spawn } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import readline from "node:readline"

const threadListLimit = 25
const requestTimeoutMs = 120_000

let clientPromise = null

function getCodexPathEntries(env = process.env) {
  const entries = String(env.PATH ?? env.Path ?? "")
    .split(path.delimiter)
    .filter((entry) => entry.trim().length > 0)

  if (process.platform === "win32") {
    const npmGlobalBin = env.APPDATA
      ? path.join(env.APPDATA, "npm")
      : path.join(os.homedir(), "AppData", "Roaming", "npm")
    entries.push(npmGlobalBin)
  }

  return Array.from(new Set(entries))
}

export function resolveCodexCommand(env = process.env) {
  const configuredCommand = env.AGENT_HTML_CODEX_COMMAND?.trim()
  if (configuredCommand) {
    return configuredCommand
  }

  const commandNames =
    process.platform === "win32" ? ["codex.cmd", "codex.exe", "codex"] : ["codex"]

  for (const entry of getCodexPathEntries(env)) {
    for (const commandName of commandNames) {
      const candidate = path.join(entry, commandName)
      if (fs.existsSync(candidate)) {
        return candidate
      }
    }
  }

  return process.platform === "win32" ? "codex.cmd" : "codex"
}

function createCodexProcessEnv(env = process.env) {
  if (process.platform !== "win32") {
    return env
  }

  return {
    ...env,
    PATH: getCodexPathEntries(env).join(path.delimiter),
  }
}

export function createCodexSpawnOptions(env = process.env) {
  return {
    env: createCodexProcessEnv(env),
    shell: false,
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  }
}

function readObject(value) {
  return typeof value === "object" && value !== null ? value : null
}

function readString(value, keys) {
  let current = value

  for (const key of keys) {
    const object = readObject(current)
    if (!object) {
      return null
    }
    current = object[key]
  }

  if (typeof current === "string") {
    return current
  }
  if (typeof current === "number" || typeof current === "boolean") {
    return String(current)
  }
  return null
}

function readArrayFromKeys(value, keys) {
  const object = readObject(value)
  if (!object) {
    return null
  }

  for (const key of keys) {
    const child = object[key]
    if (Array.isArray(child)) {
      return child
    }
  }

  return null
}

function readThreadId(value) {
  const result = readObject(value)
  const thread = readObject(result?.thread)

  return (
    (typeof thread?.id === "string" && thread.id) ||
    (typeof result?.threadId === "string" && result.threadId) ||
    (typeof result?.id === "string" && result.id) ||
    null
  )
}

function readTurnId(value) {
  const result = readObject(value)
  const turn = readObject(result?.turn)

  return typeof turn?.id === "string" ? turn.id : null
}

function readScalar(value) {
  if (typeof value === "string") {
    return value
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return undefined
}

function normalizeTextContent(value) {
  const scalar = readScalar(value)
  if (scalar) {
    return scalar
  }

  if (Array.isArray(value)) {
    const text = value
      .map(normalizeTextContent)
      .filter((item) => Boolean(item?.trim()))
      .join("\n")
    return text || undefined
  }

  const object = readObject(value)
  if (!object) {
    return undefined
  }

  return (
    readString(object, ["text"]) ??
    readString(object, ["content"]) ??
    readString(object, ["value"]) ??
    readString(object, ["summary"]) ??
    undefined
  )
}

function normalizeCommand(value) {
  const scalar = readScalar(value)
  if (scalar) {
    return scalar
  }

  if (Array.isArray(value)) {
    return value
      .map(readScalar)
      .filter((part) => Boolean(part))
      .join(" ")
  }

  return undefined
}

function stringifyCompact(value) {
  const scalar = readScalar(value)
  if (scalar) {
    return scalar
  }
  if (value === undefined || value === null) {
    return undefined
  }
  try {
    return JSON.stringify(value)
  } catch {
    return undefined
  }
}

function clampOutput(text) {
  const maxOutputLength = 6000

  if (!text || text.length <= maxOutputLength) {
    return text
  }

  return text.slice(text.length - maxOutputLength)
}

function readStatus(value) {
  return (
    readString(value, ["status"]) ??
    readString(value, ["turn", "status"]) ??
    readString(value, ["item", "status"]) ??
    undefined
  )
}

function normalizeTranscriptItem(rawItem, fallbackIndex = 0) {
  const item = readObject(rawItem)
  if (!item) {
    return null
  }

  const type = readString(item, ["type"]) ?? "unknown"
  const id =
    readString(item, ["id"]) ??
    readString(item, ["itemId"]) ??
    `${type}_${fallbackIndex}`
  const contentText =
    readString(item, ["text"]) ??
    normalizeTextContent(item.content) ??
    normalizeTextContent(item.input)
  const summaryText =
    normalizeTextContent(item.summary) ?? normalizeTextContent(item.content)

  return {
    aggregatedOutput: clampOutput(
      readString(item, ["aggregatedOutput"]) ??
        readString(item, ["output"]) ??
        normalizeTextContent(item.output)
    ),
    argumentsText: stringifyCompact(item.arguments),
    command: normalizeCommand(item.command),
    contentText,
    cwd: readString(item, ["cwd"]) ?? undefined,
    id,
    phase: readString(item, ["phase"]) ?? undefined,
    query:
      readString(item, ["query"]) ??
      readString(item, ["action", "query"]) ??
      normalizeTextContent(readObject(item.action)?.queries),
    resultText:
      normalizeTextContent(item.result) ?? normalizeTextContent(item.error),
    server: readString(item, ["server"]) ?? undefined,
    status: readStatus(item),
    summaryText,
    tool: readString(item, ["tool"]) ?? undefined,
    type,
  }
}

export function normalizeThreadTranscriptTurns(value) {
  const turns =
    readArrayFromKeys(value, ["data", "turns", "items"]) ??
    (Array.isArray(value) ? value : [])

  return turns.flatMap((rawTurn, turnIndex) => {
    const turn = readObject(rawTurn)
    if (!turn) {
      return []
    }

    const id =
      readString(turn, ["id"]) ??
      readString(turn, ["turnId"]) ??
      `turn_${turnIndex}`
    const rawItems =
      readArrayFromKeys(turn, ["items", "summaries", "events"]) ?? []

    return [
      {
        id,
        items: rawItems
          .map((rawItem, itemIndex) =>
            normalizeTranscriptItem(rawItem, itemIndex)
          )
          .filter((item) => item !== null),
        status: readStatus(turn),
      },
    ]
  })
}

export function readThreads(value) {
  const result = readObject(value)
  const rawThreads =
    (Array.isArray(result?.data) && result.data) ||
    (Array.isArray(result?.threads) && result.threads) ||
    (Array.isArray(result?.items) && result.items) ||
    (Array.isArray(value) && value) ||
    []

  return rawThreads
    .map((rawThread) => {
      const thread = readObject(rawThread)
      const id = typeof thread?.id === "string" ? thread.id : null
      if (!id) {
        return null
      }

      return {
        createdAt:
          readString(thread, ["createdAt"]) ??
          readString(thread, ["created_at"]) ??
          readString(thread, ["created"]) ??
          undefined,
        id,
        name:
          readString(thread, ["name"]) ?? readString(thread, ["title"]) ?? null,
        preview: readString(thread, ["preview"]) ?? undefined,
        status: readString(thread, ["status"]) ?? null,
        updatedAt:
          readString(thread, ["updatedAt"]) ??
          readString(thread, ["updated_at"]) ??
          readString(thread, ["lastUpdatedAt"]) ??
          undefined,
      }
    })
    .filter((thread) => thread !== null)
}

export function createThreadListParams(root) {
  return {
    cwd: root,
    limit: threadListLimit,
    sortKey: "updated_at",
    sourceKinds: ["appServer", "vscode", "cli"],
  }
}

export function createInitializeParams() {
  return {
    capabilities: {
      experimentalApi: true,
    },
    clientInfo: {
      name: "agent_html_canvas",
      title: "AgentHTML Canvas",
      version: "0.1.0",
    },
  }
}

export function isEmptyRolloutError(error) {
  const message = error instanceof Error ? error.message : String(error)
  return (
    message.includes("rollout") &&
    message.includes("is empty")
  )
}

class CodexJsonlClient {
  constructor() {
    this.nextId = 1
    this.pending = new Map()
    this.notifications = []
    this.process = spawn(resolveCodexCommand(), ["app-server"], {
      ...createCodexSpawnOptions(),
    })
    this.stderr = ""

    const lines = readline.createInterface({
      input: this.process.stdout,
    })

    lines.on("line", (line) => this.handleLine(line))
    this.process.stderr.on("data", (chunk) => {
      this.stderr = `${this.stderr}${chunk.toString()}`
    })
    this.process.on("exit", () => {
      const error = new Error(
        this.stderr.trim() || "codex app-server process exited."
      )

      for (const pending of this.pending.values()) {
        pending.reject(error)
      }
      this.pending.clear()
      clientPromise = null
    })
    this.process.on("error", (error) => {
      for (const pending of this.pending.values()) {
        pending.reject(error)
      }
      this.pending.clear()
      clientPromise = null
    })
  }

  handleLine(line) {
    let message

    try {
      message = JSON.parse(line)
    } catch {
      return
    }

    if (typeof message.id === "number" || typeof message.id === "string") {
      const pending = this.pending.get(message.id)
      if (!pending) {
        return
      }

      clearTimeout(pending.timeout)
      this.pending.delete(message.id)

      if (message.error) {
        pending.reject(
          new Error(
            typeof message.error.message === "string"
              ? message.error.message
              : JSON.stringify(message.error)
          )
        )
        return
      }

      pending.resolve(message.result ?? {})
      return
    }

    if (typeof message.method === "string") {
      this.notifications.push(message)
      this.notifications = this.notifications.slice(-500)
    }
  }

  send(message) {
    this.process.stdin.write(`${JSON.stringify(message)}\n`)
  }

  request(method, params = {}) {
    const id = this.nextId
    this.nextId += 1

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`${method} timed out.`))
      }, requestTimeoutMs)

      this.pending.set(id, { reject, resolve, timeout })
      this.send({ id, method, params })
    })
  }

  notify(method, params = {}) {
    this.send({ method, params })
  }

  notificationsForThread(threadId) {
    return this.notifications.filter((notification) => {
      const params = readObject(notification.params)
      return (
        readString(params, ["threadId"]) === threadId ||
        readString(params, ["thread", "id"]) === threadId ||
        readString(params, ["item", "threadId"]) === threadId
      )
    })
  }

  stop() {
    this.process.kill()
  }
}

async function createInitializedClient() {
  const client = new CodexJsonlClient()

  await client.request("initialize", createInitializeParams())
  client.notify("initialized", {})

  return client
}

function getClient() {
  if (!clientPromise) {
    clientPromise = createInitializedClient()
  }

  return clientPromise
}

export async function listCodexThreads({ root }) {
  const client = await getClient()
  return listCodexThreadsWithRequest({
    request: (method, params) => client.request(method, params),
    root,
  })
}

export async function listCodexThreadsWithRequest({ request, root }) {
  const result = await request("thread/list", createThreadListParams(root))

  return {
    cwd: root,
    threads: readThreads(result),
  }
}

export async function startCodexTurn({ prompt, root, threadId }) {
  const client = await getClient()
  return startCodexTurnWithRequest({
    prompt,
    request: (method, params) => client.request(method, params),
    root,
    threadId,
  })
}

export async function startCodexTurnWithRequest({
  prompt,
  request,
  root,
  threadId,
}) {
  let activeThreadId = threadId
  let startedNewThread = false

  if (activeThreadId) {
    await request("thread/resume", {
      cwd: root,
      threadId: activeThreadId,
    })
  } else {
    activeThreadId = readThreadId(
      await request("thread/start", {
        cwd: root,
        serviceName: "agent_html",
      })
    )
    startedNewThread = true
  }

  if (!activeThreadId) {
    throw new Error("Codex did not return a thread id.")
  }

  const turn = await request("turn/start", {
    input: [
      {
        text: prompt,
        type: "text",
      },
    ],
    threadId: activeThreadId,
  })

  return {
    startedNewThread,
    threadId: activeThreadId,
    turnId: readTurnId(turn),
  }
}

export async function readCodexThreadTranscript({ threadId }) {
  const client = await getClient()
  const turns = []
  let cursor = null

  do {
    let result

    try {
      result = await client.request("thread/turns/list", {
        cursor,
        itemsView: "full",
        limit: 50,
        sortDirection: "asc",
        threadId,
      })
    } catch (error) {
      if (turns.length === 0 && isEmptyRolloutError(error)) {
        return {
          notifications: client.notificationsForThread(threadId),
          threadId,
          turns: [],
        }
      }

      throw error
    }

    turns.push(...normalizeThreadTranscriptTurns(result))
    cursor = readString(result, ["nextCursor"])
  } while (cursor)

  return {
    notifications: client.notificationsForThread(threadId),
    threadId,
    turns,
  }
}

export async function stopCodexBridge() {
  if (!clientPromise) {
    return
  }

  const client = await clientPromise.catch(() => null)
  client?.stop()
  clientPromise = null
}
