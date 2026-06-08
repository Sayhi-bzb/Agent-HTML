# AgentHTML npm Release Notes

Status: alpha release runbook.

This note records how AgentHTML is currently distributed through npm, how a user
tries it locally, and what still needs to be connected between npm and GitHub.

## Product Shape

AgentHTML v1 ships as two npm packages:

- `agent-html`: the user-facing CLI package.
- `@agent-html/react`: the React protocol package used by Canvas artifacts.

The product entry is the `agent-html` CLI. A user should not need to install or
configure `@agent-html/react` directly when they only want to try AgentHTML.

The CLI owns the runtime host and copies the local Canvas workspace into the
user's project:

```powershell
npx agent-html@alpha init
npx agent-html@alpha dev
```

After `init`, the user's project contains an `agent-html/` directory. That
directory is durable source context for agents and should enter the user's git
history. It contains artifacts, local UI primitives, styles, examples, data,
assets, and agent rules.

`agent-html/` is not a standalone install target. Do not put `node_modules`,
lockfiles, Vite caches, generated bundles, or vendored dependency folders inside
it.

## User Trial Flow

Fresh project test:

```powershell
mkdir D:\tmp\agent-html-user-test
cd D:\tmp\agent-html-user-test
npm init -y
npx agent-html@alpha init
npx agent-html@alpha dev
```

Existing project test:

```powershell
cd <user-project-root>
npx agent-html@alpha init
npx agent-html@alpha dev
```

Expected result:

- `init` creates `agent-html/`.
- `dev` starts the local Canvas host.
- The terminal prints a local URL, normally `http://127.0.0.1:5177`.
- The browser can load the artifact gallery and Canvas CSS.

If port `5177` is already in use, the CLI should select another usable port or
report the conflict cleanly. Runtime failures in a fresh install should be
treated as release blockers.

## Publish Flow

Current published alpha packages:

- `@agent-html/react@0.0.1`
- `agent-html@0.0.1`

npm versions are immutable. Do not try to republish `0.0.1`; bump both packages
before the next release.

Publish order:

1. Publish `@agent-html/react`.
2. Publish `agent-html`.
3. Verify npm metadata.
4. Verify a fresh user install.

Commands:

```powershell
npm publish .\packages\react --access public --tag alpha
npm publish .\packages\cli --access public --tag alpha
```

Metadata checks:

```powershell
npm view @agent-html/react@0.0.1 version dist-tags --registry https://registry.npmjs.org/
npm view agent-html@0.0.1 version dist-tags --registry https://registry.npmjs.org/
```

Fresh install smoke:

```powershell
mkdir D:\tmp\agent-html-install-smoke
cd D:\tmp\agent-html-install-smoke
npm init -y
npx agent-html@alpha init
npx agent-html@alpha dev
```

Release blockers:

- `init` cannot create the workspace.
- `dev` cannot start on a fresh install.
- The host cannot find its bundled `index.html`.
- Vite cannot resolve dependencies used by `agent-html/`.
- Canvas CSS is missing in the browser.
- React or React DOM resolves to an incompatible package copy.

## GitHub and npm Association

npm links packages to GitHub through package metadata. Add or keep these fields
on both published packages:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/Sayhi-bzb/Agent-HTML"
  },
  "bugs": {
    "url": "https://github.com/Sayhi-bzb/Agent-HTML/issues"
  },
  "homepage": "https://github.com/Sayhi-bzb/Agent-HTML#readme"
}
```

For monorepo packages, include `repository.directory`: `packages/cli` for
`agent-html` and `packages/react` for `@agent-html/react`.

Optional later step: enable npm trusted publishing / provenance from GitHub
Actions. That would let GitHub Actions publish without storing long-lived npm
tokens in the repo. Treat this as a release infrastructure task, not a
requirement for the current alpha.

GitHub Releases are created from Git tags, not npm metadata. The current
desktop release workflow listens for `v*` tags and publishes release assets.
After publishing npm packages, create and push the matching release tag.

## Token Handling

Never commit npm tokens, paste them into docs, or store them in `todo/`.

Tokens already pasted into chat should be revoked in npm immediately. Future
manual publish tokens should be short-lived and scoped to the packages that need
publishing. Prefer trusted publishing once the GitHub release workflow exists.
