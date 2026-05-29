import { loader } from "fumadocs-core/source"
import { docs, meta } from "@source/server"

export const source = loader({
  baseUrl: "/docs",
  source: {
    files: docs,
    meta,
  },
})
