export default {
  fetch(request, env) {
    const url = new URL(request.url)

    if (url.hostname === "agent-html.pages.dev") {
      url.hostname = "agent-html.org"
      return Response.redirect(url.toString(), 301)
    }

    return env.ASSETS.fetch(request)
  },
}
