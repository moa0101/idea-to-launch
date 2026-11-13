---
name: launch-build-game-apple
description: >-
  Builder for native iOS and macOS games in the launch panel. Builds a playable,
  original game MVP from launch/spec.md with SpriteKit hosted in SwiftUI (SpriteView),
  with title, core loop, scoring, game over/restart, persisted high score, haptics
  and sound, generated with XcodeGen, run in the iOS Simulator or as a Mac app and
  verified. Use from /launch when platform is game-ios or game-mac.
argument-hint: "[project root] [ios|macos]"
---

# launch-build-game-apple

Read first: `launch/spec.md`, `launch/brand.md`, `brand/tokens.json`. Follow the
`launch` skill's laws and hard stops, and the **toolchain, project layout,
build/run/verify and ship sections of the `launch-build-apple` skill** (same XcodeGen,
`DEVELOPER_DIR`, simulator and signing rules). Load that skill, or read
`${CLAUDE_SKILL_DIR}/../launch-build-apple/SKILL.md`, before building.

## Originality rule

Original games or games in a genre / with similar mechanics only. Never recreate a
specific existing game's name, characters, art, music, levels or look.

## Default stack

| layer | default | why |
| --- | --- | --- |
| engine | SpriteKit (`SKScene`, `SKPhysicsBody`, `SKAction`) | built in, 2D, 60/120fps, no dependencies |
| shell | SwiftUI app with `SpriteView` for menus/settings | native menus, less SpriteKit UI code |
| art | `SKShapeNode`/SF Symbols textures + brand palette; render shapes to textures once (`view.texture(from:)`) for performance | zero cost, crisp |
| audio | short generated .caf/.wav SFX (write with AVAudioFile from synthesized buffers in a build script) or `AudioServices` system sounds | no licensing |
| persistence | `@AppStorage`/UserDefaults for best score & settings | enough for v1 |
| leaderboards (only if spec asks) | Game Center | needs developer account → hard stop |
| 3D (only if spec truly needs it) | SceneKit / RealityKit | log why |

## The MVP game checklist (all MUST)

1. Title: name, slogan, Play, best score, sound toggle.
2. Core loop tuned to be fun in 10 seconds; tunables in `GameConfig.swift`.
3. Difficulty ramp to hit the session length in the spec.
4. Score + juice: particles (`SKEmitterNode` built in code), shake, scale pops,
   haptics (`UIImpactFeedbackGenerator`) on iOS.
5. Game over → score, best, Restart in one tap.
6. Controls: touch on iOS; keyboard + mouse on macOS (`keyDown` in the scene).
7. Pause when the app goes inactive (`scenePhase`).
8. Performance: node pooling, `ignoresSiblingOrder = true`, show FPS in Debug only.
9. Supports all iPhone sizes in portrait (or landscape if the spec says) with safe areas.

## Build order

Project via XcodeGen (`launch-build-apple` layout; `Scenes/` folder instead of
`Views/` for the game). Brand → AppIcon, AccentColor, palette in `Theme.swift`.
Core loop playable → run in simulator → commit; then ramp, juice, audio, persistence.

## Verify

Play in the simulator with real taps/swipes (`tap`, `touch_path`): start, score,
die, restart, kill and relaunch to confirm best score persists. Screenshots of
title, gameplay, game over into `launch/screens/`. Unit-test pure logic (scoring,
spawning rules) with XCTest.

## Output

Playable game project, README, `GameConfig.swift` tuning notes in
`launch/handoff.md`, screenshots.
