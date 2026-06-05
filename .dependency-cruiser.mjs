export default {
  forbidden: [
    {
      name: "react-canvas-no-unresolvable",
      severity: "error",
      from: {
        path: "^\\.agent-html/",
      },
      to: {
        couldNotResolve: true,
      },
    },
    {
      name: "react-canvas-no-runtime-circular",
      severity: "error",
      from: {
        path: "^\\.agent-html/",
      },
      to: {
        circular: true,
        dependencyTypesNot: ["type-only", "type-import"],
      },
    },
    {
      name: "react-canvas-portable-workspace",
      severity: "error",
      from: {
        path: "^\\.agent-html/",
      },
      to: {
        path: "^(apps/|packages/cli/|packages/agent-html/|src/|config/)",
      },
    },
    {
      name: "react-canvas-no-host-aliases",
      severity: "error",
      from: {
        path: "^\\.agent-html/",
      },
      to: {
        path: "^(@/app|@/agent-html|#agent-html-playground)",
      },
    },
    {
      name: "react-canvas-data-is-leaf",
      severity: "error",
      from: {
        path: "^\\.agent-html/(hooks|lib|schema|theme|ui)/",
      },
      to: {
        path: "^\\.agent-html/(artifacts|examples)/",
      },
    },
    {
      name: "react-canvas-hooks-lib-schema-no-ui",
      severity: "error",
      from: {
        path: "^\\.agent-html/(hooks|lib|schema)/",
      },
      to: {
        path: "^\\.agent-html/ui/",
        dependencyTypesNot: ["type-only", "type-import"],
      },
    },
    {
      name: "react-canvas-ui-no-artifact-data",
      severity: "error",
      from: {
        path: "^\\.agent-html/ui/",
      },
      to: {
        path: "^\\.agent-html/(artifacts|examples|data)/",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
      dependencyTypes: [
        "npm",
        "npm-dev",
        "npm-optional",
        "npm-peer",
        "npm-bundled",
        "npm-no-pkg",
      ],
    },
    exclude: {
      path: "^\\.agent-html/index/",
    },
    webpackConfig: {
      fileName: "config/dependency-cruiser.react-canvas-resolve.mjs",
    },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
      mainFields: ["module", "main", "types"],
    },
  },
}
