import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  ...prefix("docs", [
    route("", "routes/docs-layout.tsx", [
      route("*", "routes/docs-page.tsx"),
    ]),
  ]),
] satisfies RouteConfig
