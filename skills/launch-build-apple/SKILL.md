---
name: launch-build-apple
description: >-
  Builder for native iOS and macOS apps in the launch panel. Builds a functional MVP
  from launch/spec.md in SwiftUI with SwiftData persistence (optional CloudKit sync),
  generates the Xcode project with XcodeGen, applies the brand (accent colour, app
  icon, display name), builds, runs it in the iOS Simulator or as a Mac app, and
  verifies the acceptance checks. Use from /launch when platform is ios or macos.
argument-hint: "[project root] [ios|macos]"
---

# launch-build-apple

Read first: `launch/spec.md`, `launch/scope.md`, `launch/brand.md`,
`brand/tokens.json`, `launch/decisions.md`. Follow the `launch` skill's laws and
hard stops.

## Toolchain (check once, at start)

- Run `xcode-select -p`. If it points at CommandLineTools while Xcode is installed in
  `/Applications/Xcode.app`, prefix every Xcode command with
  `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer` (avoids needing sudo).
  If Xcode isn't installed at all, stop and tell the user to install it from the App Store.
- `xcodegen` missing → **hard stop (system tooling)**: ask once to run
  `brew install xcodegen` (Recommended). If declined, stop and give the user the
  command to run themselves; a hand-written .xcodeproj is too fragile to rely on.
- Pick the simulator: newest available iPhone from
  `xcrun simctl list devices available` (prefer "iPhone 15 Pro" or newer).
- Deployment target: the highest iOS/macOS the installed simulator/OS supports,
  but ≥ iOS 17 / macOS 14 (needed for SwiftData + Observation).

## Default stack

| layer | default | why |
| --- | --- | --- |
| UI | SwiftUI, `NavigationStack`/`NavigationSplitView` (mac) | native, least code |
| state | Observation (`@Observable`) | modern, simple |
| persistence | SwiftData `@Model` | local-first, real persistence, zero cost |
| sync (only if spec needs multi-device) | SwiftData + CloudKit | needs Apple Developer account → **hard stop** |
| accounts (only if spec needs shared data between users) | Sign in with Apple + Supabase | hard stop (accounts) — prefer single-user v1 |
| tests | XCTest unit tests for models/logic + one XCUITest of the critical flow | proves the flow |

Default is **single-user, on-device, SwiftData** unless the spec's core action
truly needs multiple users. Log the choice.

## Project layout

```
<Name>/
  project.yml            # XcodeGen
  <Name>/App/<Name>App.swift
  <Name>/Models/         # @Model types from spec data model
  <Name>/Views/          # one file per screen
  <Name>/Theme/Theme.swift   # colours/fonts from tokens.json
  <Name>/Resources/Assets.xcassets/{AppIcon.appiconset, AccentColor.colorset}
  <Name>/Resources/SampleData.swift   # seed on first launch (only if store empty)
  <Name>Tests/, <Name>UITests/
```

`project.yml` essentials: `name`, `options.bundleIdPrefix: com.launch.<slug>`,
target `type: application`, `platform: iOS|macOS`, `deploymentTarget`,
`settings.base`: `PRODUCT_BUNDLE_IDENTIFIER`, `INFOPLIST_KEY_CFBundleDisplayName`,
`GENERATE_INFOPLIST_FILE: YES`, `ASSETCATALOG_COMPILER_APPICON_NAME: AppIcon`,
`CODE_SIGN_STYLE: Automatic`, `CODE_SIGNING_ALLOWED: NO` for simulator builds,
`SWIFT_VERSION: 5.0` (or 6 if it builds cleanly). Add test targets.

## Build order

1. Write `project.yml` + sources; `xcodegen generate`.
2. Brand: AccentColor from `primary` (light + dark appearances); `Theme.swift`
   with Color extensions from tokens; AppIcon from `brand/icon-1024.png` (single-size
   1024 universal icon in Contents.json; macOS needs the size set — generate
   16…1024 with `sips -z`). Display name = brand name.
3. Models + sample data seeding on first launch.
4. **Critical flow first**, build, run, commit. Then remaining MUST features.
5. Polish: empty states with `ContentUnavailableView`, swipe actions, haptics on
   iOS for the core action, Dynamic Type, dark mode, VoiceOver labels on icons.
   Mac: menu commands + keyboard shortcuts for the core action, sensible window size.

## Build, run, verify

- iOS: open the simulator panel first (`mcp__Claude_Code_iOS_Simulator__control`
  action `attach`; if nothing is booted, `xcrun simctl boot <udid>` then attach).
  Build:
  `DEVELOPER_DIR=… xcodebuild -project <Name>.xcodeproj -scheme <Name> -destination 'platform=iOS Simulator,id=<udid>' -derivedDataPath build build`
  then `launch` with the `.app` from `build/Build/Products/Debug-iphonesimulator/`.
  Walk each acceptance check with tap/text/swipe + screenshot. Kill and relaunch the
  app to prove persistence.
- macOS: build with `-destination 'platform=macOS'`, `open` the `.app`, verify with
  screenshots (computer-use app tools, if granted) and the UI test.
- Run tests: `xcodebuild test …` (same destination). Fix failures; never report a
  check you didn't observe.
- Screenshots to `launch/screens/`.

## Ship (only after the user confirms — hard stop)

TestFlight / Mac App Store / notarized DMG need the user's Apple Developer account
and signing; give them the exact steps (archive, upload via Xcode Organizer) rather
than handling credentials.

## Output

Xcode project generated from `project.yml` (commit `project.yml`, gitignore
`*.xcodeproj` and `build/`), README with `brew install xcodegen && xcodegen generate
&& open <Name>.xcodeproj`, screenshots, passing tests.
