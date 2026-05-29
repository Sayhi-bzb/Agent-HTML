# GitHub Release

This document defines the lightweight release path for publishing Agent HTML
desktop alpha builds to GitHub. It is intentionally small: a release is one
clean commit, one matching tag, one matching installer, and release notes.

## Rules

- Keep release commits scoped to release work. Do not include unrelated feature,
  docs, gallery, or refactor changes.
- Keep these versions in sync:
  - `package.json`
  - `package-lock.json`
  - `src-tauri/Cargo.toml`
  - `src-tauri/Cargo.lock`
  - `src-tauri/tauri.conf.json`
- The Git tag must point to the same commit that produced the uploaded
  installer.
- Alpha builds are GitHub prereleases and use `vX.Y.Z-alpha.N`.
- Windows alpha releases ship only the NSIS installer. Do not publish MSI or
  `targets = "all"` output unless the release scope explicitly changes.
- The NSIS installer uses current-user installation so alpha testers do not need
  administrator access.
- The NSIS installer uses `src-tauri/installer/header.bmp` and
  `src-tauri/installer/sidebar.bmp` for lightweight branding.
- Windows alpha builds are unsigned. Release notes must mention the unknown
  publisher or SmartScreen warning.
- Alpha tags may be deleted and recreated before wider distribution. Stable
  tags must not move; publish a new patch version instead.

## Release Checklist

Run the minimum local gates:

```powershell
git status --short
npm run typecheck
npm test
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

Build the Windows NSIS installer outside the repository:

```powershell
$env:CARGO_TARGET_DIR='D:\tmp\agent-html-tauri-alpha-target'
$env:CARGO_BUILD_JOBS='1'
npx tauri build --ci --no-sign --bundles nsis
```

Create the release commit and tag:

```powershell
git add package.json package-lock.json src-tauri/Cargo.toml src-tauri/Cargo.lock src-tauri/tauri.conf.json RELEASE_NOTES.md
git commit -m "chore: release vX.Y.Z-alpha.N"
git tag vX.Y.Z-alpha.N
git push origin main
git push origin vX.Y.Z-alpha.N
```

Create the GitHub prerelease:

```powershell
gh release create vX.Y.Z-alpha.N `
  "D:\tmp\agent-html-tauri-alpha-target\release\bundle\nsis\Agent HTML_X.Y.Z-alpha.N_x64-setup.exe" `
  --repo Sayhi-bzb/Agent-HTML `
  --title "Agent HTML vX.Y.Z-alpha.N" `
  --notes-file RELEASE_NOTES.md `
  --prerelease
```

Verify the published release:

```powershell
gh release view vX.Y.Z-alpha.N --repo Sayhi-bzb/Agent-HTML
git rev-parse HEAD vX.Y.Z-alpha.N origin/main
```

The three revisions printed by `git rev-parse` must match.

Before publishing a new installer, open it locally and confirm the header and
sidebar brand images render correctly.

## Common Mistakes

- Uploading an installer built from a different commit than the release tag.
- Creating a GitHub Release while an old tag still points at an old commit.
- Mixing unrelated local changes into the release commit.
- Forgetting to rebuild after a release-only fix, such as Windows subsystem
  changes in `src-tauri/src/main.rs`.
- Treating `gh release list` as a tag check. Releases and Git tags are separate
  objects; use `git ls-remote --tags origin` when tag cleanup matters.
