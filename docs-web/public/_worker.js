export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (
      pathname === "/example" ||
      pathname === "/example/" ||
      pathname.startsWith("/example/")
    ) {
      return new Response("Not Found", {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=utf-8",
        },
      })
    }

    return env.ASSETS.fetch(request)
  },
}
