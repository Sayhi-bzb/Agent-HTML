export const RUNTIME_DEPENDENCY_CONTRACT_VERSION = 1

export const playgroundCommonJsInteropDeps = [
  "classnames",
  "lodash/debounce",
  "lodash/memoize",
]

export const playgroundOptimizeDeps = [
  "react",
  "react/jsx-dev-runtime",
  "react-dom/client",
  "class-variance-authority",
  "clsx",
  ...playgroundCommonJsInteropDeps,
  "@visx/event",
  "@visx/responsive",
  "@visx/sankey",
  "d3-sankey",
  "lucide-react",
  "motion/react",
  "shiki/bundle/web",
  "tailwind-merge",
]
