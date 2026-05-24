import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "agent-html-example-dev-route",
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (request.url === "/agent-html") {
            response.statusCode = 302
            response.setHeader("Location", "/agent-html/")
            response.end()
            return
          }

          next()
        })
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
